import { test, expect } from '@playwright/test'

test('审核面板渲染（单位阶段）', async ({ page, request }) => {
  const title = `E2E_RV_${Date.now()}`
  const created = await request.post('/api/v1/results', { data: { type: '论文', title } })
  const id = (await created.json()).id as string
  await request.post(`/api/v1/results/${id}/submit`)
  await page.goto(`/review?stage=unit&result_id=${id}`)
  await expect(page.locator('.ant-card-head-title').filter({ hasText: '审核面板' })).toBeVisible()
  await expect(page.getByRole('button', { name: '提交审核结论' })).toBeVisible()
})
