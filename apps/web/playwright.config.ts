import { randomBytes } from 'node:crypto'
import { defineConfig } from '@playwright/test'

process.env.WEB_DEMO_TEST_PASSWORD ??= randomBytes(24).toString('hex')

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: { baseURL: 'http://127.0.0.1:5187' },
  webServer: {
    command: 'npm run build -- --outDir dist-test && npm run preview -- --outDir dist-test --host 127.0.0.1 --port 5187 --strictPort',
    url: 'http://127.0.0.1:5187',
    env: { VITE_PILOT_PASSWORD: process.env.WEB_DEMO_TEST_PASSWORD },
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
