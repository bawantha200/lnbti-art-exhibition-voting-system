import { test, expect } from '@playwright/test'

test('Voting system homepage loads successfully', async ({ page }) => {
  const response = await page.goto('/')

  // Check whether the homepage loaded successfully.
  expect(response?.status()).toBe(200)

  // Check whether the page has a title.
  await expect(page).toHaveTitle(/.+/)

  // Check whether the page is visible.
  await expect(page.locator('body')).toBeVisible()
})
