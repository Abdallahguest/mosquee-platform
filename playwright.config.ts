import { defineConfig, devices } from '@playwright/test'

const PORT = 3000
const BASE_URL = `http://127.0.0.1:${PORT}`

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: process.env.CI ? 2 : 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: { timeout: 10_000 },

  reporter: [['html', { open: 'never' }], ['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15_000,
    navigationTimeout: 30_000
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/superadmin.json'
      },
      dependencies: ['setup']
    }
    // Active après stabilisation:
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'], storageState: 'playwright/.auth/superadmin.json' },
    //   dependencies: ['setup']
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'], storageState: 'playwright/.auth/superadmin.json' },
    //   dependencies: ['setup']
    // }
  ],

  webServer: {
    command: 'pnpm next build && pnpm next start -p 3000',
    url: BASE_URL,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: 'test',
      DATABASE_URL:
        process.env.DATABASE_URL ??
        'postgresql://postgres:postgres@127.0.0.1:5432/mosquee_test',
      TEST_SUPER_ADMIN_EMAIL:
        process.env.TEST_SUPER_ADMIN_EMAIL ?? 'superadmin@amanaconnect.org',
      TEST_SUPER_ADMIN_PASSWORD:
        process.env.TEST_SUPER_ADMIN_PASSWORD ?? 'password'
    }
  }
})
