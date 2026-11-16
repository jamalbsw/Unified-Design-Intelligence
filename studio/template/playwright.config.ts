import { createHash } from 'node:crypto'
import { defineConfig } from '@playwright/test'

const openPort = 4173
const gatedPort = 4174
export const testPassword = 'correct-horse-test'
const testPasswordHash = createHash('sha256').update(testPassword).digest('hex')

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : 'list',
  projects: [
    { name: 'open', testMatch: 'a11y.spec.ts', use: { baseURL: `http://localhost:${openPort}` } },
    { name: 'gated', testMatch: 'gate.spec.ts', use: { baseURL: `http://localhost:${gatedPort}` } },
  ],
  // Test production builds, which is what a preview link serves. The second build embeds a password hash.
  webServer: [
    {
      command: `npm run build && npm run preview -- --port ${openPort} --strictPort`,
      url: `http://localhost:${openPort}`,
      env: { VITE_PILOT_PASSWORD_HASH: '' },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: `npm run build -- --outDir dist-gated && npm run preview -- --outDir dist-gated --port ${gatedPort} --strictPort`,
      url: `http://localhost:${gatedPort}`,
      env: { VITE_PILOT_PASSWORD_HASH: testPasswordHash },
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
})
