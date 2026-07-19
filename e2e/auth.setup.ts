import { test as setup, expect } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

const authFile = 'playwright/.auth/superadmin.json'

setup('authenticate super-admin and save storage state', async ({ page }) => {
  const email = process.env.TEST_SUPER_ADMIN_EMAIL ?? 'superadmin@amanaconnect.org'
  const password = process.env.TEST_SUPER_ADMIN_PASSWORD ?? 'password'

  const authDir = path.dirname(authFile)
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true })

  await page.goto('/fr/login', { waitUntil: 'domcontentloaded' })

  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(password)
  await page.locator('button[type="submit"]').click()

  // Ajuste ce check si ton app redirige ailleurs
  await page.waitForLoadState('networkidle')
  await expect(page).not.toHaveURL(/\/fr\/login$/)

  await page.context().storageState({ path: authFile })
})
