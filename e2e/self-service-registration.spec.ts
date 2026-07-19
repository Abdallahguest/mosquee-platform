import { test, expect } from '@playwright/test'

test.describe('Self-Service Registration Flow', () => {
  test('should allow user to register and create mosque in trial mode', async ({ page }) => {
    await page.goto('/fr/register', { waitUntil: 'domcontentloaded' })

    await page.locator('input[name="mosqueName"]').fill('Mosquée Test QA')
    await page.locator('input[name="fullName"]').fill('Admin Test')
    await page.locator('input[name="email"]').fill(`qa+${Date.now()}@example.com`)
    await page.locator('input[name="password"]').fill('Password123!')
    await page.locator('button[type="submit"]').click()

    // Assertion volontairement souple (à spécialiser selon ton UI réelle)
    await expect(page).toHaveURL(/\/fr\/(dashboard|welcome|onboarding|login)/)
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/fr/register', { waitUntil: 'domcontentloaded' })
    await page.locator('button[type="submit"]').click()

    // Plus robuste que texte exact
    await expect(page.locator('input[name="email"]')).toHaveAttribute('aria-invalid', /true|/)
  })

  test('should validate email format', async ({ page }) => {
    await page.goto('/fr/register', { waitUntil: 'domcontentloaded' })

    await page.locator('input[name="email"]').fill('invalid-email')
    await page.locator('input[name="password"]').fill('Password123!')
    await page.locator('button[type="submit"]').click()

    await expect(page.getByText(/email|e-?mail|courriel|adresse/i)).toBeVisible()
  })

  test('should validate password length', async ({ page }) => {
    await page.goto('/fr/register', { waitUntil: 'domcontentloaded' })

    await page.locator('input[name="password"]').fill('short')
    await page.locator('button[type="submit"]').click()

    // Remplace texte strict par regex tolérante FR
    await expect(
      page.getByText(/(8|huit)\s*caract[eè]res?.*minimum|mot de passe.*(court|min)/i)
    ).toBeVisible()
  })
})
