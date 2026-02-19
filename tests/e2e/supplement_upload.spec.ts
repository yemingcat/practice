import { test, expect } from '@playwright/test'
import fs from 'fs'
import os from 'os'
import path from 'path'

test('补充材料上传', async ({ page, request }) => {
  const title = `E2E_SUP_${Date.now()}`
  const created = await request.post('/api/v1/results', { data: { type: '论文', title } })
  const id = (await created.json()).id as string
  await request.post(`/api/v1/results/${id}/submit`)
  await request.post('/api/v1/reviews', { data: { result_id: id, stage: 'unit', decision: 'rejected', comment: '补充' } })
  await page.goto(`/supplement?result_id=${id}`)
  const pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
  const tmp = path.join(os.tmpdir(), `e2e_${Date.now()}.png`)
  fs.writeFileSync(tmp, Buffer.from(pngBase64, 'base64'))
  await page.locator('input[type="file"]').setInputFiles(tmp)
  await expect(page.getByRole('link', { name: /e2e_.*\.png/ })).toBeVisible()
})
