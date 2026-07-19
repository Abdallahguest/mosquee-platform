# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: self-service-registration.spec.ts >> Self-Service Registration Flow >> should validate email format
- Location: e2e\self-service-registration.spec.ts:37:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://127.0.0.1:3000/fr/register", waiting until "load"

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
> 38 |     await page.goto('/fr/register')
     |                ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
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
  52 |     await expect(page.locator('text=8 caractères minimum')).toBeVisible()
  53 |   })
  54 | })
  55 | 
```