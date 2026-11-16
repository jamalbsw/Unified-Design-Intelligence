import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { testPassword } from '../playwright.config'

const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']
const appHeading = 'Prepare for your appointment'

test('the password prompt is shown first and hides the app', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Enter the pilot password' })).toBeVisible()
  await expect(page.getByRole('heading', { name: appHeading })).toHaveCount(0)
  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze()
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
})

test('a wrong password is rejected with an announced error', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Password').fill('not-the-password')
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('alert')).toHaveText(/did not match/)
  await expect(page.getByRole('heading', { name: appHeading })).toHaveCount(0)
})

test('the right password opens the app, which stays open for the session', async ({ page }) => {
  await page.goto('/')
  await page.getByLabel('Password').fill(testPassword)
  await page.getByRole('button', { name: 'Continue' }).click()
  await expect(page.getByRole('heading', { level: 1, name: appHeading })).toBeVisible()
  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze()
  expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: appHeading })).toBeVisible()
})

test('the built bundle never contains the plaintext password', () => {
  const assets = join(import.meta.dirname, '..', 'dist-gated', 'assets')
  const bundle = readdirSync(assets)
    .filter((file) => file.endsWith('.js'))
    .map((file) => readFileSync(join(assets, file), 'utf8'))
    .join('\n')
  expect(bundle.length).toBeGreaterThan(0)
  expect(bundle).not.toContain(testPassword)
})
