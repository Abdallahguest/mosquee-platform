import { test, expect } from '@playwright/test'

test.describe('MFA (Multi-Factor Authentication) for Super-Admins', () => {
  test.beforeEach(async ({ page }) => {
    // Login as super-admin
    await page.goto('/fr/login')
    await page.fill('input[name="email"]', process.env.TEST_SUPER_ADMIN_EMAIL || 'superadmin@amanaconnect.org')
    await page.fill('input[name="password"]', process.env.TEST_SUPER_ADMIN_PASSWORD || 'password')
    await page.click('button[type="submit"]')
    await page.waitForURL('/fr/super-admin')
  })

  test('should allow super-admin to setup MFA', async ({ page }) => {
    await page.goto('/fr/admin/profile')

    // Click on setup MFA button
    await page.click('text=Activer l\'authentification à deux facteurs')

    // Should show QR code
    await expect(page.locator('img[alt*="QR"]')).toBeVisible()

    // Should show recovery codes
    await expect(page.locator('text=Codes de récupération')).toBeVisible()
  })

  test('should require TOTP code to confirm MFA setup', async ({ page }) => {
    await page.goto('/fr/admin/profile')
    await page.click('text=Activer l\'authentification à deux facteurs')

    // Try to confirm without code
    await page.click('text=Confirmer')
    await expect(page.locator('text=Code requis')).toBeVisible()
  })

  test('should allow disabling MFA', async ({ page }) => {
    await page.goto('/fr/admin/profile')

    // Assuming MFA is already enabled
    await page.click('text=Désactiver MFA')
    
    // Should show confirmation dialog
    await page.click('text=Confirmer')

    // Should show success message
    await expect(page.locator('text=MFA désactivé')).toBeVisible()
  })

  test('should allow updating emergency email', async ({ page }) => {
    await page.goto('/fr/admin/profile')

    await page.fill('input[name="emergencyEmail"]', 'emergency@example.com')
    await page.click('text=Mettre à jour')

    await expect(page.locator('text=Email d\'urgence mis à jour')).toBeVisible()
  })
})
