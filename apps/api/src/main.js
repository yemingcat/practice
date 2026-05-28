import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import { PrismaClient } from '@prisma/client'
import multer from 'multer'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const app = express()

app.use(helmet())

const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : []
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : false,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id']
}))

app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
}))

app.use(express.json({ limit: '2mb' }))
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))

app.get('/health', (_, res) => res.json({ status: 'ok' }))
app.get('/healthz', async (req, res) => {
  try {
    if (String(req.query.db || '0') === '1') {
      await prisma.$queryRaw`SELECT 1`
      return res.json({ status: 'ok', db: 'ok' })
    }
    return res.json({ status: 'ok' })
  } catch {
    return res.status(503).json({ status: 'degraded', db: 'error' })
  }
})

const v1 = express.Router()
const prisma = new PrismaClient()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadRoot = path.resolve(__dirname, '../uploads')
if (!fs.existsSync(uploadRoot)) fs.mkdirSync(uploadRoot, { recursive: true })
app.use('/static', express.static(uploadRoot))
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const id = req.params.id
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) return cb(new Error('INVALID_ID'))
    const dir = path.join(uploadRoot, id)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    cb(null, dir)
  },
  filename: (req, file, cb) => {
    const stamp = Date.now()
    const safe = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    cb(null, `${stamp}_${safe}`)
  }
})
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allow = ['image/png', 'image/jpeg', 'application/pdf']
    if (allow.includes(file.mimetype)) cb(null, true)
    else cb(new Error('FILE_TYPE_NOT_ALLOWED'))
  }
})
// 避免浏览器对 API 做条件缓存导致 304 无数据
v1.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store')
  next()
})

v1.get('/results', async (req, res) => {
  const status = req.query.status
  const limit = Math.min(Number(req.query.limit) || 20, 100)
  const cursor = req.query.cursor ? String(req.query.cursor) : undefined
  const data = await prisma.result.findMany({
    where: status ? { status: String(status) } : undefined,
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { id: 'desc' }
  })
  const next_cursor = data.length === limit ? data[data.length - 1].id : null
  res.json({ data, pagination: { next_cursor, has_more: !!next_cursor, limit } })
})
v1.get('/results/:id', async (req, res) => {
  const r = await prisma.result.findUnique({ where: { id: req.params.id } })
  if (!r) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'result not found' } })
  res.json(r)
})
v1.post('/results', async (req, res) => {
  const { type, title, unique_no, date } = req.body || {}
  if (!type || !title) return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'type/title required' } })
  const r = await prisma.result.create({
    data: { type, title, unique_no: unique_no || null, date: date ? new Date(date) : null, status: 'draft' }
  })
  res.status(201).json(r)
})
v1.patch('/results/:id', async (req, res) => {
  try {
    const allowed = ['type', 'title', 'unique_no', 'date']
    const data = {}
    for (const key of allowed) {
      if (req.body && req.body[key] !== undefined) data[key] = req.body[key]
    }
    if (Object.keys(data).length === 0) {
      return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'no valid fields to update' } })
    }
    if (data.date) data.date = new Date(data.date)
    const r = await prisma.result.update({ where: { id: req.params.id }, data })
    res.json(r)
  } catch {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'result not found' } })
  }
})
v1.post('/results/:id/submit', async (req, res) => {
  try {
    // 若最近一次结论为 rejected，需有至少一条附件
    const last = await prisma.review.findFirst({ where: { result_id: req.params.id }, orderBy: { created_at: 'desc' } })
    if (last?.decision === 'rejected') {
      const cnt = await prisma.attachment.count({ where: { result_id: req.params.id } })
      if (cnt === 0) return res.status(409).json({ error: { code: 'NEED_ATTACHMENTS', message: '请先上传补充材料后再提交' } })
    }
    const r = await prisma.result.update({ where: { id: req.params.id }, data: { status: 'submitted' } })
    // 单位阶段待审已存在则不重复创建
    await prisma.review.upsert({
      where: { result_id_stage: { result_id: r.id, stage: 'unit' } },
      create: { result_id: r.id, stage: 'unit', decision: 'pending' },
      update: { decision: 'pending' }
    })
    res.json({ ok: true, result: r })
  } catch {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'result not found' } })
  }
})
v1.get('/reports/summary', async (req, res) => {
  const all = await prisma.result.findMany({ select: { type: true } })
  const map = all.reduce((acc, r) => {
    acc[r.type] = (acc[r.type] || 0) + 1
    return acc
  }, {})
  res.json({ type: Object.entries(map).map(([name, count]) => ({ name, count })) })
})
v1.get('/reviews', async (req, res) => {
  const stage = String(req.query.stage || 'unit')
  const status = String(req.query.status || 'pending') // pending/rejected/approved/all
  const limit = Math.min(Number(req.query.limit) || 20, 100)
  const cursor = req.query.cursor ? String(req.query.cursor) : undefined
  const where = {
    stage,
    ...(status === 'pending' ? { decision: 'pending' } :
      status === 'rejected' ? { decision: 'rejected' } :
      status === 'approved' ? { decision: 'approved' } : {})
  }
  const reviews = await prisma.review.findMany({
    where,
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: { result: true },
    orderBy: { id: 'desc' }
  })
  const next_cursor = reviews.length === limit ? reviews[reviews.length - 1].id : null
  const data = reviews.map(rv => ({
    id: rv.id,
    result_id: rv.result_id,
    stage: rv.stage,
    decision: rv.decision,
    name: rv.result?.title || '',
    type: rv.result?.type || '',
    lab: '材料实验室',
    owner: '张三'
  }))
  res.json({ data, pagination: { next_cursor, has_more: !!next_cursor, limit } })
})
v1.post('/reviews', async (req, res) => {
  const { result_id, stage, decision, comment } = req.body || {}
  const validDecisions = ['approved', 'rejected', 'pending']
  const validStages = ['unit', 'final']
  if (!result_id || !stage || !decision) {
    return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: 'result_id, stage, and decision are required' } })
  }
  if (!validDecisions.includes(decision)) {
    return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: `decision must be one of: ${validDecisions.join(', ')}` } })
  }
  if (!validStages.includes(stage)) {
    return res.status(422).json({ error: { code: 'VALIDATION_ERROR', message: `stage must be one of: ${validStages.join(', ')}` } })
  }
  try {
    await prisma.review.updateMany({ where: { result_id, stage }, data: { decision, comment: comment || null } })
    if (decision === 'approved') {
      if (stage === 'unit') {
        await prisma.review.create({ data: { result_id, stage: 'final', decision: 'pending' } })
      }
      if (stage === 'final') {
        await prisma.result.update({ where: { id: result_id }, data: { status: 'locked' } })
      }
    }
    if (decision === 'rejected') {
      await prisma.result.update({ where: { id: result_id }, data: { status: 'rejected' } })
    }
    res.json({ ok: true })
  } catch {
    res.status(404).json({ error: { code: 'NOT_FOUND', message: 'review not found' } })
  }
})
v1.get('/results/:id/attachments', async (req, res) => {
  const id = req.params.id
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return res.status(400).json({ error: { code: 'INVALID_ID', message: 'invalid id' } })
  const atts = await prisma.attachment.findMany({ where: { result_id: id }, orderBy: { created_at: 'desc' } })
  const items = atts.map(a => ({
    id: a.id,
    file_name: a.file_name,
    mime_type: a.mime_type,
    size: a.size,
    url: `/static/${id}/${a.file_path}`,
    download_url: `/api/v1/attachments/${a.id}/download`,
    created_at: a.created_at
  }))
  res.json({ data: items })
})
v1.post('/results/:id/attachments', upload.array('files', 10), async (req, res) => {
  const id = req.params.id
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) return res.status(400).json({ error: { code: 'INVALID_ID', message: 'invalid id' } })
  const r = await prisma.result.findUnique({ where: { id } })
  if (!r) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'result not found' } })
  // 最近一次审核需为退回
  const last = await prisma.review.findFirst({ where: { result_id: id }, orderBy: { created_at: 'desc' } })
  if (last?.decision !== 'rejected' || r.status !== 'rejected') {
    return res.status(409).json({ error: { code: 'STATE_INVALID', message: '仅退回记录允许上传补充材料' } })
  }
  const files = req.files || []
  const created = []
  for (const f of files) {
    const rec = await prisma.attachment.create({
      data: { result_id: id, file_name: f.originalname, file_path: f.filename, mime_type: f.mimetype, size: f.size, uploaded_by: 'unit' }
    })
    created.push({ id: rec.id, file_name: rec.file_name })
  }
  res.status(201).json({ data: created })
})
v1.delete('/attachments/:id', async (req, res) => {
  const att = await prisma.attachment.findUnique({ where: { id: req.params.id } })
  if (!att) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'attachment not found' } })
  const filePath = path.join(uploadRoot, att.result_id, att.file_path)
  try { if (fs.existsSync(filePath)) fs.unlinkSync(filePath) } catch {}
  await prisma.attachment.delete({ where: { id: att.id } })
  res.json({ ok: true })
})
v1.get('/attachments/:id/download', async (req, res) => {
  const att = await prisma.attachment.findUnique({ where: { id: req.params.id } })
  if (!att) return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'attachment not found' } })
  const filePath = path.join(uploadRoot, att.result_id, att.file_path)
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: { code: 'FILE_MISSING', message: 'file not found' } })
  res.setHeader('Content-Type', att.mime_type || 'application/octet-stream')
  const encoded = encodeURIComponent(att.file_name || att.file_path)
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encoded}`)
  fs.createReadStream(filePath).pipe(res)
})
app.use('/api/v1', v1)
// 上传错误处理
app.use((err, req, res, next) => {
  if (err && (err.code === 'LIMIT_FILE_SIZE' || err.message === 'FILE_TYPE_NOT_ALLOWED')) {
    return res.status(413).json({ error: { code: err.code || 'FILE_TYPE_NOT_ALLOWED', message: '文件不允许或超出限制' } })
  }
  if (err) return res.status(400).json({ error: { code: 'UPLOAD_ERROR', message: err.message || 'upload error' } })
  next()
})

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`api listening on :${port}`))
