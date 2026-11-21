import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { matchTemplate } from '../src/prototype/templates'

test('keyword matching selects distinct supported layouts and their combination', () => {
  expect(matchTemplate('Create a home page.')).toEqual({ ok: true, options: { layout: 'home', communication: false } })
  expect(matchTemplate('Create a TASK-focused homepage.')).toEqual({ ok: true, options: { layout: 'tasks', communication: false } })
  expect(matchTemplate('Create a home page with a communication summary.')).toEqual({ ok: true, options: { layout: 'home', communication: true } })
  expect(matchTemplate('Tasks and messages')).toEqual({ ok: true, options: { layout: 'tasks', communication: true } })
})

test('empty and unsupported requests do not receive a success-shaped fallback', () => {
  for (const request of ['   ', 'Create a payment portal', 'homework and multitasking']) {
    expect(matchTemplate(request).ok).toBe(false)
  }
})

test.describe('template browser demo', () => {
  test.beforeEach(async ({ page }) => {
    const password = process.env.WEB_DEMO_TEST_PASSWORD
    if (!password) throw new Error('Synthetic demo test access is not configured.')
    await page.goto('/')
    await page.getByLabel('Pilot password', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Continue to pilot' }).click()
    await expect(page.getByRole('heading', { name: 'Make the next idea tangible.' })).toBeVisible()
  })

  test('step 2 links to the clickable portal prototype, which loads and opens its chat', async ({ page, context }) => {
    await expect(page.getByRole('link', { name: /Open the clickable prototype/ })).toHaveCount(0)
    await page.getByRole('button', { name: 'Simple homepage', exact: true }).click()
    await expect(page.getByRole('img', { name: /Preview of the Get Care page/ })).toBeVisible()
    await expect(page.getByText('Clickable prototype', { exact: true })).toBeVisible()
    const link = page.getByRole('link', { name: /Open the clickable prototype/ })
    await expect(link).toHaveAttribute('href', /prototypes\/portal-chat\/$/)
    const [prototype] = await Promise.all([context.waitForEvent('page'), link.click()])
    await prototype.waitForLoadState()
    await expect(prototype.getByRole('heading', { name: /how can I help/ })).toBeVisible()
    // Baylee opens by itself right after the page loads
    await expect(prototype.getByRole('heading', { name: 'Baylee', exact: true })).toBeVisible()
    await expect(prototype.getByRole('button', { name: /Open chat/ })).toHaveAttribute('aria-expanded', 'true')
  })

  test('builds a labelled homepage and preserves task progress and focus on return', async ({ page }) => {
    const build = page.getByRole('button', { name: 'Build template preview' })
    await expect(build).toBeDisabled()
    await page.getByRole('button', { name: 'Simple homepage', exact: true }).click()
    await build.click()
    const frame = page.frameLocator('iframe[title="Interactive homepage template"]')
    await expect(frame.getByRole('heading', { name: 'Welcome home' })).toBeVisible()
    await expect(frame.getByText('Template demo | Not AI-generated', { exact: false })).toBeVisible()
    await frame.getByRole('button', { name: 'Open weekly plan' }).click()
    await expect(frame.getByRole('heading', { name: 'Plan your week', exact: true })).toBeFocused()
    await frame.getByRole('button', { name: 'Mark sample task complete' }).click()
    await expect(frame.getByRole('button', { name: 'Completed', exact: true })).toBeDisabled()
    await frame.getByRole('button', { name: 'Back to home' }).click()
    await expect(frame.getByText('Completed in this demo')).toBeVisible()
    await expect(frame.getByRole('button', { name: 'Open weekly plan' })).toBeFocused()
    await page.getByRole('button', { name: 'Mobile', exact: true }).click()
    expect(await page.locator('iframe').evaluate(element => element.getBoundingClientRect().width)).toBeLessThanOrEqual(340)
    const overflow = await frame.locator('html').evaluate(element => element.scrollWidth > element.clientWidth)
    expect(overflow).toBe(false)
    await expect(frame.getByText('Completed in this demo')).toBeVisible()
  })

  test('changes layouts explicitly, reports stale or unmatched requests, and rebuilds cleanly', async ({ page }) => {
    const request = page.getByLabel('What would you like to prototype?')
    const build = page.getByRole('button', { name: 'Build template preview' })
    const frame = page.frameLocator('iframe')
    await request.fill('Create a task-focused home page.')
    await build.click()
    await expect(frame.getByRole('heading', { name: 'Your tasks, in one place' })).toBeVisible()
    await request.fill('Create a payment portal')
    await expect(page.getByRole('status')).toContainText('Request edited.')
    await build.click()
    await expect(page.getByRole('alert')).toContainText('No matching template.')
    await expect(page.getByRole('alert')).toContainText('previous preview is unchanged')
    await expect(request).toHaveAttribute('aria-invalid', 'true')
    await expect(frame.getByRole('heading', { name: 'Your tasks, in one place' })).toBeVisible()
    await page.getByRole('button', { name: 'Communication summary', exact: true }).click()
    await build.click()
    await expect(frame.getByRole('heading', { name: 'Welcome home' })).toBeVisible()
    await expect(frame.getByRole('heading', { name: 'Communication summary' })).toBeVisible()
    await frame.getByRole('button', { name: 'Read sample update' }).click()
    await expect(frame.getByRole('heading', { name: 'Sample communication' })).toBeVisible()
    await frame.getByRole('button', { name: 'Back to home' }).click()
    await expect(frame.getByRole('button', { name: 'Read sample update' })).toBeFocused()
    await build.click()
    await expect(frame.getByRole('heading', { name: 'Welcome home' })).toBeVisible()
  })

  test('isolates preview styles, checks keyboard focus, and scans platform accessibility', async ({ page }) => {
    await page.getByLabel('What would you like to prototype?').fill('Create a home page with communication.')
    await page.getByRole('button', { name: 'Build template preview' }).click()
    const frame = page.frameLocator('iframe')
    await expect(frame.getByRole('heading', { name: 'Welcome home' })).toBeVisible()
    const frameTheme = await frame.locator('html').evaluate(element => ({
      platformToken: getComputedStyle(element).getPropertyValue('--fi-midnight-navy'),
      text: getComputedStyle(element).color,
    }))
    expect(frameTheme.platformToken).toBe('')
    expect(frameTheme.text).toBe('rgb(54, 66, 72)')
    const action = frame.getByRole('button', { name: 'Open preferences' })
    await frame.getByRole('button', { name: 'Home', exact: true }).focus()
    for (let presses = 0; presses < 8; presses++) {
      await page.keyboard.press('Tab')
      if (await action.evaluate(element => element === element.ownerDocument.activeElement)) break
    }
    await expect(action).toBeFocused()
    expect(await action.evaluate(element => getComputedStyle(element).outlineStyle)).not.toBe('none')
    for (const detail of [false, true]) {
      if (detail) {
        await page.keyboard.press('Enter')
        await expect(frame.getByRole('heading', { name: 'Review your preferences', exact: true })).toBeFocused()
      }
      const results = await new AxeBuilder({ page }).setLegacyMode().options({ iframes: false }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze()
      expect(results.violations.map(item => `${item.id}: ${item.help}`)).toEqual([])
    }
  })
})
