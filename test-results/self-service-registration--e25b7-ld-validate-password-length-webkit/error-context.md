# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: self-service-registration.spec.ts >> Self-Service Registration Flow >> should validate password length
- Location: e2e\self-service-registration.spec.ts:46:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=8 caractères minimum')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=8 caractères minimum')

```

```yaml
- main:
  - heading "Créer un compte pour votre mosquée" [level=1]
  - paragraph: Inscrivez-vous gratuitement et commencez à gérer votre mosquée
  - heading "Informations personnelles" [level=3]
  - text: auth.name *
  - textbox "auth.name *"
  - text: auth.email *
  - textbox "auth.email *"
  - text: auth.password *
  - textbox "auth.password *": short
  - paragraph: Minimum 8 caractères
  - heading "Informations de la mosquée" [level=3]
  - text: Nom de la mosquée *
  - textbox "Nom de la mosquée *"
  - text: Ville *
  - textbox "Ville *"
  - text: Pays *
  - textbox "Pays *"
  - paragraph:
    - strong: Période d'essai gratuite
    - text: Votre mosquée bénéficiera de 3 mois d'accès gratuit pour découvrir toutes les fonctionnalités.
  - button "Créer mon compte"
  - paragraph: En vous inscrivant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité.
  - link "auth.alreadyHaveAccount":
    - /url: /login
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test'
  2  | 
  3  | test.describe('Self-Service Registration Flow', () => {
  4  |   test('should allow user to register and create mosque in trial mode', async ({ page }) => {
  5  |     await page.goto('/fr/register')
  6  | 
  7  |     // Fill personal information
  8  |     await page.fill('input[name="name"]', 'Test User')
  9  |     await page.fill('input[name="email"]', `test${Date.now()}@example.com`)
  10 |     await page.fill('input[name="password"]', 'TestPassword123')
  11 | 
  12 |     // Fill mosque information
  13 |     await page.fill('input[name="mosqueName"]', 'Test Mosque')
  14 |     await page.fill('input[name="city"]', 'Conakry')
  15 |     await page.fill('input[name="country"]', 'Guinea')
  16 | 
  17 |     // Submit form
  18 |     await page.click('button[type="submit"]')
  19 | 
  20 |     // Should show success message
  21 |     await expect(page.locator('text=Inscription réussie')).toBeVisible()
  22 |     
  23 |     // Should redirect to login after 3 seconds
  24 |     await page.waitForURL('/login?registered=true', { timeout: 5000 })
  25 |   })
  26 | 
  27 |   test('should validate required fields', async ({ page }) => {
  28 |     await page.goto('/fr/register')
  29 | 
  30 |     // Submit empty form
  31 |     await page.click('button[type="submit"]')
  32 | 
  33 |     // Should show validation errors
  34 |     await expect(page.locator('text=Nom requis')).toBeVisible()
  35 |   })
  36 | 
  37 |   test('should validate email format', async ({ page }) => {
  38 |     await page.goto('/fr/register')
  39 | 
  40 |     await page.fill('input[name="email"]', 'invalid-email')
  41 |     await page.click('button[type="submit"]')
  42 | 
  43 |     await expect(page.locator('text=Email invalide')).toBeVisible()
  44 |   })
  45 | 
  46 |   test('should validate password length', async ({ page }) => {
  47 |     await page.goto('/fr/register')
  48 | 
  49 |     await page.fill('input[name="password"]', 'short')
  50 |     await page.click('button[type="submit"]')
  51 | 
> 52 |     await expect(page.locator('text=8 caractères minimum')).toBeVisible()
     |                                                             ^ Error: expect(locator).toBeVisible() failed
  53 |   })
  54 | })
  55 | 
```