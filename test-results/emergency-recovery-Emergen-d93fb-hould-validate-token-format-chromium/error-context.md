# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: emergency-recovery.spec.ts >> Emergency Recovery for Super-Admins >> should validate token format
- Location: e2e\emergency-recovery.spec.ts:21:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://127.0.0.1:3000/fr/emergency-recovery/complete", waiting until "load"

```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Emergency Recovery for Super-Admins', () => {
  4  |   test('should allow initiating emergency recovery', async ({ page }) => {
  5  |     await page.goto('/fr/emergency-recovery')
  6  | 
  7  |     // Enter super-admin email
  8  |     await page.fill('input[name="email"]', process.env.TEST_SUPER_ADMIN_EMAIL || 'superadmin@amanaconnect.org')
  9  |     await page.click('button[type="submit"]')
  10 | 
  11 |     // Should show success message (even if email doesn't exist for security)
  12 |     await expect(page.locator('text=Si cet email correspond à un compte super-admin')).toBeVisible()
  13 |   })
  14 | 
  15 |   test('should allow completing recovery with valid token', async ({ page }) => {
  16 |     // This test would need a valid token, which is hard to automate
  17 |     // In production, this would be tested with a mock email service
  18 |     test.skip()
  19 |   })
  20 | 
  21 |   test('should validate token format', async ({ page }) => {
> 22 |     await page.goto('/fr/emergency-recovery/complete')
     |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  23 |     
  24 |     await page.fill('input[name="token"]', 'invalid-token')
  25 |     await page.fill('input[name="newPassword"]', 'NewPassword123')
  26 |     await page.click('button[type="submit"]')
  27 | 
  28 |     await expect(page.locator('text=Token invalide ou expiré')).toBeVisible()
  29 |   })
  30 | 
  31 |   test('should validate new password strength', async ({ page }) => {
  32 |     await page.goto('/fr/emergency-recovery/complete')
  33 |     
  34 |     await page.fill('input[name="token"]', 'valid-token-format')
  35 |     await page.fill('input[name="newPassword"]', 'short')
  36 |     await page.click('button[type="submit"]')
  37 | 
  38 |     await expect(page.locator('text=8 caractères minimum')).toBeVisible()
  39 |   })
  40 | })
  41 | 
```