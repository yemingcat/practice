import 'dotenv/config'
import { describe, it, expect, beforeAll } from 'vitest'
import axios from 'axios'

function normalizeBase(raw?: string) {
  const fallback = 'http://localhost:3000'
  if (!raw) return fallback
  // If someone accidentally set "health" or a path-like value, ignore it
  if (raw === 'health' || raw.startsWith('/')) return fallback
  const withProto = /^https?:\/\//.test(raw) ? raw : `http://${raw}`
  try {
    // Validate URL
    const u = new URL(withProto)
    if (!u.hostname || u.hostname === 'health') return fallback
    return withProto.replace(/\/+$/, '')
  } catch {
    return fallback
  }
}
// 显式声明 process 为 NodeJS.Process 类型，避免找不到名称“process”
declare const process: any
const BASE_URL = normalizeBase(process.env.BASE_URL)
const api = axios.create({ baseURL: BASE_URL, timeout: 10000 })

let createdId: string | null = null

describe('API smoke & rules', () => {
  beforeAll(async () => {
    try {
      const r = await api.get('/health')
      expect(r.status).toBe(200)
    } catch (e: any) {
      throw new Error(`health check failed: ${e?.message || 'unknown'}`)
    }
  })

  it('create result', async () => {
    const r = await api.post('/api/v1/results', { type: '论文', title: '自动化用例' })
    expect(r.status).toBe(201)
    expect(r.data?.id).toBeDefined()
    createdId = r.data.id
  })

  it('submit initial review', async () => {
    if (!createdId) throw new Error('no id')
    const r = await api.post(`/api/v1/results/${createdId}/submit`)
    expect(r.status).toBe(200)
    expect(r.data?.ok).toBe(true)
  })

  it('review list has pending unit item', async () => {
    const r = await api.get('/api/v1/reviews', { params: { stage: 'unit', status: 'pending', limit: 5 } })
    expect(r.status).toBe(200)
    expect(Array.isArray(r.data?.data)).toBe(true)
  })

  it('reject then block resubmit when no attachments', async () => {
    if (!createdId) throw new Error('no id')
    const rej = await api.post('/api/v1/reviews', { result_id: createdId, stage: 'unit', decision: 'rejected', comment: '补充材料' })
    expect(rej.status).toBe(200)
    const resubmit = await api.post(`/api/v1/results/${createdId}/submit`, {}).catch(e => e.response)
    expect(resubmit.status).toBe(409)
    expect(resubmit.data?.error?.code).toBe('NEED_ATTACHMENTS')
  })
})
