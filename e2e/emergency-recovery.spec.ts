import { test, expect } from '@playwright/test'

test.describe('Emergency Recovery for Super-Admins', () => {
  test('should allow initiating emergency recovery', async ({ page }) => {
    await page.goto('/fr/emergency-recovery')

    // Enter super-admin email
    await page.fill('input[name="email"]', process.env.TEST_SUPER_ADMIN_EMAIL || 'superadmin@amanaconnect.org')
    await page.click('button[type="submit"]')

    // Should show success message (even if email doesn't exist for security)
    await expect(page.locator('text=Si cet email correspond à un compte super-admin')).toBeVisible()
  })

  test('should allow completing recovery with valid token', async ({ page }) => {
    // This test would need a valid token, which is hard to automate
    // In production, this would be tested with a mock email service
    test.skip()
  })

  test('should validate token format', async ({ page }) => {
    await page.goto('/fr/emergency-recovery/complete')
    
    await page.fill('input[name="token"]', 'invalid-token')
    await page.fill('input[name="newPassword"]', 'NewPassword123')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=Token invalide ou expiré')).toBeVisible()
  })

  test('should validate new password strength', async ({ page }) => {
    await page.goto('/fr/emergency-recovery/complete')
    
    await page.fill('input[name="token"]', 'valid-token-format')
    await page.fill('input[name="newPassword"]', 'short')
    await page.click('button[type="submit"]')

    await expect(page.locator('text=8 caractères minimum')).toBeVisible()
  })
})
