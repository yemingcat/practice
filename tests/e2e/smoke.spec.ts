import { test, expect } from '@playwright/test'

test('lab inbox renders and nav works', async ({ page }) => {
  await page.goto('/lab')
  await expect(page.getByText('实验室工作台', { exact: true })).toBeVisible()

  await page.goto('/unit')
  await expect(
    page.locator('.ant-card-head-title').filter({ hasText: '二级单位审核' })
  ).toBeVisible()

  await page.goto('/reports')
  await expect(page.getByText('汇总报表', { exact: true })).toBeVisible()
})
