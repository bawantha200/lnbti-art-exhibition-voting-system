import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: /start voting/i }).click()
})

test('rejects an email from an unauthorized domain', async ({ page }) => {
  await page.locator('#email').fill('student@gmail.com')

  await page.getByRole('button', {
    name: /send verification code/i,
  }).click()

  await expect(page.getByText(
    'Please use your institutional email ending in @edu.lnbti.lk'
  )).toBeVisible()

  await expect(page).toHaveURL(/\/email$/)
})

test('rejects an incorrect institutional domain', async ({ page }) => {
  await page.locator('#email').fill('student@edu.lnbti.com')

  await page.getByRole('button', {
    name: /send verification code/i,
  }).click()

  await expect(page.getByText(
    'Please use your institutional email ending in @edu.lnbti.lk'
  )).toBeVisible()
})

test('rejects an empty email address', async ({ page }) => {
  await page.getByRole('button', {
    name: /send verification code/i,
  }).click()

  await expect(page.getByText(
    'Please use your institutional email ending in @edu.lnbti.lk'
  )).toBeVisible()
})

test('accepts a valid institutional email and navigates to OTP screen', async ({ page }) => {
  await page.route('**/api/auth/send-otp', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'OTP sent successfully.',
      }),
    })
  })

  await page.locator('#email').fill('student@edu.lnbti.lk')

  await page.getByRole('button', {
    name: /send verification code/i,
  }).click()

  await expect(page).toHaveURL(/\/otp$/)
})
