import { Page, expect, Locator } from '@playwright/test'

export async function selectOptionByFormLabel(page: Page, label: string, optionText: string) {
  const select = page.locator('.ant-form-item', { hasText: label }).locator('.ant-select')
  await select.click()
  const dropdown = page.locator('.ant-select-dropdown:visible').last()
  try {
    await dropdown.waitFor({ state: 'visible', timeout: 2000 })
    const opt = dropdown.getByRole('option', { name: optionText }).first()
    await opt.scrollIntoViewIfNeeded()
    await opt.waitFor({ state: 'visible', timeout: 1000 })
    await opt.click()
    return
  } catch {}
  // 回退：使用搜索输入框键入并回车选择
  const input = page.locator('.ant-select-dropdown:visible input, .ant-select-selection-search-input').first()
  if (await input.count()) {
    try {
      await input.fill('')
      await input.type(optionText, { delay: 50 })
      await page.keyboard.press('Enter')
      return
    } catch {}
  }
  // 最后兜底强制点击
  const opt2 = dropdown.getByRole('option', { name: optionText }).first()
  if (await opt2.count()) {
    await page.waitForTimeout(100)
    await opt2.click({ force: true })
  }
}

export async function selectOption(select: Locator, page: Page, optionText: string) {
  await select.click()
  const dropdown = page.locator('.ant-select-dropdown:visible').last()
  try {
    await dropdown.waitFor({ state: 'visible', timeout: 2000 })
    const opt = dropdown.getByRole('option', { name: optionText }).first()
    await opt.scrollIntoViewIfNeeded()
    await opt.waitFor({ state: 'visible', timeout: 1000 })
    await opt.click()
    return
  } catch {}
  const input = page.locator('.ant-select-dropdown:visible input, .ant-select-selection-search-input').first()
  if (await input.count()) {
    try {
      await input.fill('')
      await input.type(optionText, { delay: 50 })
      await page.keyboard.press('Enter')
      return
    } catch {}
  }
  const opt2 = dropdown.getByRole('option', { name: optionText }).first()
  if (await opt2.count()) {
    await page.waitForTimeout(100)
    await opt2.click({ force: true })
  }
}
