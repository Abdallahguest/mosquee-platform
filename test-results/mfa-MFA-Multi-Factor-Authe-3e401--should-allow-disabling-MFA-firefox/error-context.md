# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mfa.spec.ts >> MFA (Multi-Factor Authentication) for Super-Admins >> should allow disabling MFA
- Location: e2e\mfa.spec.ts:35:7

# Error details

```
Test timeout of 30000ms exceeded while running "beforeEach" hook.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[name="email"]')

```

# Page snapshot

```yaml
- main [ref=e2]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]: 🕌
      - heading "Connexion" [level=1] [ref=e6]
      - paragraph [ref=e7]: Accédez à votre espace d'administration
    - generic [ref=e8]:
      - generic [ref=e9]:
        - generic [ref=e10]:
          - generic [ref=e11]: Email
          - textbox "admin@mosquee.com" [ref=e12]
        - generic [ref=e13]:
          - generic [ref=e14]: Mot de passe
          - textbox "••••••••" [ref=e15]
        - link "Mot de passe oublié ?" [ref=e17] [cursor=pointer]:
          - /url: /forgot-password
        - button "Se connecter" [ref=e18]
      - paragraph [ref=e20]:
        - text: Pas encore de compte ?
        - link "S'inscrire" [ref=e21] [cursor=pointer]:
          - /url: /register
    - link "← Retour à l'accueil" [ref=e23] [cursor=pointer]:
      - /url: /
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('MFA (Multi-Factor Authentication) for Super-Admins', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Login as super-admin
  6  |     await page.goto('/fr/login')
> 7  |     await page.fill('input[name="email"]', process.env.TEST_SUPER_ADMIN_EMAIL || 'superadmin@amanaconnect.org')
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  8  |     await page.fill('input[name="password"]', process.env.TEST_SUPER_ADMIN_PASSWORD || 'password')
  9  |     await page.click('button[type="submit"]')
  10 |     await page.waitForURL('/fr/super-admin')
  11 |   })
  12 | 
  13 |   test('should allow super-admin to setup MFA', async ({ page }) => {
  14 |     await page.goto('/fr/admin/profile')
  15 | 
  16 |     // Click on setup MFA button
  17 |     await page.click('text=Activer l\'authentification à deux facteurs')
  18 | 
  19 |     // Should show QR code
  20 |     await expect(page.locator('img[alt*="QR"]')).toBeVisible()
  21 | 
  22 |     // Should show recovery codes
  23 |     await expect(page.locator('text=Codes de récupération')).toBeVisible()
  24 |   })
  25 | 
  26 |   test('should require TOTP code to confirm MFA setup', async ({ page }) => {
  27 |     await page.goto('/fr/admin/profile')
  28 |     await page.click('text=Activer l\'authentification à deux facteurs')
  29 | 
  30 |     // Try to confirm without code
  31 |     await page.click('text=Confirmer')
  32 |     await expect(page.locator('text=Code requis')).toBeVisible()
  33 |   })
  34 | 
  35 |   test('should allow disabling MFA', async ({ page }) => {
  36 |     await page.goto('/fr/admin/profile')
  37 | 
  38 |     // Assuming MFA is already enabled
  39 |     await page.click('text=Désactiver MFA')
  40 |     
  41 |     // Should show confirmation dialog
  42 |     await page.click('text=Confirmer')
  43 | 
  44 |     // Should show success message
  45 |     await expect(page.locator('text=MFA désactivé')).toBeVisible()
  46 |   })
  47 | 
  48 |   test('should allow updating emergency email', async ({ page }) => {
  49 |     await page.goto('/fr/admin/profile')
  50 | 
  51 |     await page.fill('input[name="emergencyEmail"]', 'emergency@example.com')
  52 |     await page.click('text=Mettre à jour')
  53 | 
  54 |     await expect(page.locator('text=Email d\'urgence mis à jour')).toBeVisible()
  55 |   })
  56 | })
  57 | 
```