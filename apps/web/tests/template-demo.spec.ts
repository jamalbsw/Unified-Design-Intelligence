import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { matchTemplate } from '../src/prototype/templates'

test('keyword matching selects supported local preview layouts', () => {
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
    await expect(page.getByRole('note')).toHaveCount(0)
    await page.getByLabel('Password', { exact: true }).fill(password)
    await page.getByRole('button', { name: 'Continue to pilot' }).click()
    await expect(page.getByRole('heading', { name: 'Make the next idea tangible.' })).toBeVisible()
  })

  test('keeps Research Lab disabled until it is connected', async ({ page }) => {
    const research = page.getByText('Research Lab', { exact: true })
    await expect(research).toHaveAttribute('aria-disabled', 'true')
    await expect(research).toHaveAttribute('title', 'Research Lab is not enabled yet')
    await expect(page.getByRole('link', { name: 'Research Lab' })).toHaveCount(0)
  })

  test('uses the requested button blue and keeps content bubbles out of the pages', async ({ page }) => {
    await page.reload()
    const passwordButton = page.getByRole('button', { name: 'Continue to pilot' })
    expect(await passwordButton.evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(47, 111, 214)')
    await page.getByLabel('Password', { exact: true }).fill(process.env.WEB_DEMO_TEST_PASSWORD!)
    await passwordButton.click()

    const introductionCard = page.locator('main#home > .intro-guidance-card')
    await expect(introductionCard).toBeVisible()
    await expect(introductionCard).toHaveCount(1)
    await expect(page.locator('.intro-guidance-card + .workspace-grid')).toHaveCount(1)
    const introductionBounds = await introductionCard.boundingBox()
    expect(introductionBounds).not.toBeNull()
    expect(introductionBounds!.height).toBeLessThan(220)
    await expect(introductionCard.getByRole('heading', { name: 'Make the next idea tangible.' })).toBeVisible()
    await expect(introductionCard.getByRole('heading', { name: /Grounded in Nightingale/ })).toBeVisible()
    await expect(introductionCard.getByText('DESIGN GUIDANCE', { exact: true })).toHaveCount(0)
    await expect(page.locator('.intro')).toHaveCount(0)
    await expect(page.locator('.notice, .demo-description')).toHaveCount(0)
    const storybookLink = page.getByRole('link', { name: /Grounded in Nightingale/ })
    await expect(storybookLink).toHaveAttribute(
      'href',
      'https://storybook.bswsites.com/?path=/docs/get-started-about-nightingale--page',
    )
    await expect(page.getByRole('link', { name: /Nightingale Storybook/ })).toHaveCount(0)

    const entryButton = page.getByRole('button', { name: 'Baylee entry points' })
    expect(await entryButton.evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(23, 28, 36)')
    expect(await page.locator('.topbar .logo-cell').count()).toBe(1)
    await expect(page.locator('.app-shell main .cell')).toHaveCount(0)

    const switcher = page.locator('.viewport-control')
    await expect(switcher).toHaveCSS('border-radius', '999px')
    await expect(switcher.getByRole('button', { name: 'Desktop' })).toHaveCSS('background-color', 'rgb(47, 111, 214)')
    await expect(switcher.getByRole('button', { name: 'Mobile' })).toBeDisabled()
    await expect(page.getByText('Preview size')).toBeHidden()
    await expect(switcher).toHaveAccessibleName('Preview view')
    await expect(page.locator('.preview-caption, .pipeline')).toHaveCount(0)
    await expect(page.getByText('TEMPLATES', { exact: true })).toBeVisible()
    await expect(page.locator('.request-input-shell + .voice-status')).toHaveCount(1)
    await expect(page.locator('.voice-status + .example-group')).toHaveCount(1)
    await expect(page.locator('.example-group')).toHaveCSS('border-top-width', '1px')
    await expect(page.locator('.example-group')).toHaveCSS('padding-top', '16px')
    for (const label of ['Example A', 'Example B', 'Example C']) {
      await expect(page.getByRole('button', { name: label, exact: true })).toBeDisabled()
    }
    await expect(page.getByRole('button', { name: 'Restart', exact: true })).toHaveCount(0)
    await entryButton.click()
    await expect(entryButton).toHaveAttribute('aria-pressed', 'true')
    await expect(entryButton).toHaveCSS('border-color', 'rgb(140, 200, 255)')
    await expect(page.getByLabel('What would you like to prototype?')).toHaveValue('Baylee entry points')
    const build = page.getByRole('button', { name: 'Build', exact: true })
    const savePrototype = page.getByRole('button', { name: 'Save prototype', exact: true })
    const attachInsights = page.getByRole('button', { name: 'Attach insights' })
    const voiceCommand = page.getByRole('button', { name: 'Voice Command' })
    for (const property of ['min-height', 'padding', 'border-radius', 'font-size', 'font-weight']) {
      await expect(entryButton).toHaveCSS(property, await voiceCommand.evaluate(
        (element, cssProperty) => getComputedStyle(element).getPropertyValue(cssProperty),
        property,
      ))
    }
    await expect(attachInsights).toBeDisabled()
    await expect(page.locator('.request-input-shell .request-action-chip')).toHaveCount(2)
    const requestActionsFooter = page.locator('.request-actions-footer')
    await expect(build.locator('xpath=..')).toHaveClass(/request-actions-footer/)
    const entryButtonBounds = await entryButton.boundingBox()
    const buildButtonBounds = await build.boundingBox()
    const controlsBounds = await requestActionsFooter.boundingBox()
    expect(entryButtonBounds).not.toBeNull()
    expect(buildButtonBounds).not.toBeNull()
    expect(controlsBounds).not.toBeNull()
    expect(Math.abs(
      controlsBounds!.x + controlsBounds!.width
      - buildButtonBounds!.x - buildButtonBounds!.width,
    )).toBeLessThan(1)
    await expect(savePrototype).toBeDisabled()
    for (const property of ['border-color', 'color', 'background-color', 'border-radius', 'min-height']) {
      await expect(savePrototype).toHaveCSS(property, await build.evaluate(
        (element, cssProperty) => getComputedStyle(element).getPropertyValue(cssProperty),
        property,
      ))
    }
    const saveButtonBounds = await savePrototype.boundingBox()
    expect(saveButtonBounds).not.toBeNull()
    expect(Math.abs(
      buildButtonBounds!.y + buildButtonBounds!.height / 2
      - saveButtonBounds!.y - saveButtonBounds!.height / 2,
    )).toBeLessThan(1)
    await expect(attachInsights).toHaveCSS('border-radius', '999px')
    await expect(voiceCommand).toHaveCSS('border-radius', '999px')
    await expect(page.getByText(/Storybook is the current design reference/)).toHaveCount(0)
    await expect(page.getByText(/Add relevant research findings/)).toHaveCount(0)
    await expect(page.locator('.reference-links small')).toHaveCount(0)
    await expect(build).toBeDisabled()
    await expect(build).toHaveCSS('background-color', 'rgb(23, 28, 36)')
    await expect(build).toHaveCSS('color', 'rgb(127, 138, 153)')
    await expect(build.locator('span')).toHaveCount(0)
    const restart = page.getByRole('button', { name: 'Restart', exact: true })
    await expect(restart).toBeVisible()
    await expect(restart).toHaveCSS('border-radius', '999px')
    await expect(restart).toHaveCSS('color', 'rgb(197, 138, 58)')
    await expect(page.getByRole('img', { name: /Preview of the Get Care page/ })).toBeVisible()
    await restart.click()
    await expect(page.getByLabel('What would you like to prototype?')).toHaveValue('')
    await expect(entryButton).toHaveAttribute('aria-pressed', 'false')
    await expect(restart).toHaveCount(0)
    await expect(page.getByRole('heading', { name: 'Your preview will appear here' })).toBeVisible()
    await expect(build).toBeDisabled()
    await expect(build).toHaveCSS('background-color', 'rgb(47, 111, 214)')

    await page.goto('/#research')
    await expect(page.locator('#research .cell')).toHaveCount(0)
  })

  test('fits a larger desktop preview without cropping at Surface Pro viewport size', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 960 })
    const defaultPreviewBounds = await page.locator('.preview-card').boundingBox()
    const defaultCanvasBounds = await page.locator('.preview-canvas').boundingBox()
    await page.getByRole('button', { name: 'Baylee entry points', exact: true }).click()

    const requestBounds = await page.locator('.request-card').boundingBox()
    const previewBounds = await page.locator('.preview-card').boundingBox()
    const canvasBounds = await page.locator('.preview-canvas').boundingBox()
    const imageBounds = await page.getByRole('img', { name: /Preview of the Get Care page/ }).boundingBox()
    expect(requestBounds).not.toBeNull()
    expect(previewBounds).not.toBeNull()
    expect(canvasBounds).not.toBeNull()
    expect(imageBounds).not.toBeNull()
    expect(defaultPreviewBounds).not.toBeNull()
    expect(defaultCanvasBounds).not.toBeNull()
    expect(Math.abs(defaultPreviewBounds!.height - previewBounds!.height)).toBeLessThan(1)
    expect(Math.abs(defaultCanvasBounds!.height - canvasBounds!.height)).toBeLessThan(1)
    expect(previewBounds!.width).toBeGreaterThan(requestBounds!.width)
    expect(previewBounds!.y + previewBounds!.height).toBeLessThanOrEqual(960)
    expect(imageBounds!.x).toBeGreaterThanOrEqual(canvasBounds!.x)
    expect(imageBounds!.y).toBeGreaterThanOrEqual(canvasBounds!.y)
    expect(imageBounds!.x + imageBounds!.width).toBeLessThanOrEqual(canvasBounds!.x + canvasBounds!.width)
    expect(imageBounds!.y + imageBounds!.height).toBeLessThanOrEqual(canvasBounds!.y + canvasBounds!.height)
    expect(Math.abs(imageBounds!.width / imageBounds!.height - 1440 / 1066)).toBeLessThan(0.01)
  })

  test('stacks the workspace without horizontal overflow at 393 by 852', async ({ page }) => {
    await page.setViewportSize({ width: 393, height: 852 })
    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(documentWidth).toBeLessThanOrEqual(393)

    const requestBounds = await page.locator('.request-card').boundingBox()
    const previewBounds = await page.locator('.preview-card').boundingBox()
    expect(requestBounds).not.toBeNull()
    expect(previewBounds).not.toBeNull()
    expect(previewBounds!.y).toBeGreaterThan(requestBounds!.y)
    expect(Math.abs(previewBounds!.width - requestBounds!.width)).toBeLessThan(1)

    await page.getByRole('button', { name: 'Baylee entry points', exact: true }).click()
    const canvasBounds = await page.locator('.preview-canvas').boundingBox()
    const imageBounds = await page.getByRole('img', { name: /Preview of the Get Care page/ }).boundingBox()
    expect(canvasBounds).not.toBeNull()
    expect(imageBounds).not.toBeNull()
    expect(imageBounds!.x).toBeGreaterThanOrEqual(canvasBounds!.x)
    expect(imageBounds!.x + imageBounds!.width).toBeLessThanOrEqual(canvasBounds!.x + canvasBounds!.width)
    expect(Math.abs(imageBounds!.width / imageBounds!.height - 1440 / 1066)).toBeLessThan(0.01)
  })

  test('voice input appends speech to the request and can be stopped', async ({ page }) => {
    await page.addInitScript(() => {
      class FakeSpeechRecognition {
        lang = ''
        continuous = false
        interimResults = false
        maxAlternatives = 0
        onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null = null
        onerror: ((event: { error: string }) => void) | null = null
        onend: (() => void) | null = null

        start() {
          this.onresult?.({ results: [[{ transcript: 'Create a home page.' }]] })
        }

        stop() {
          this.onend?.()
        }

        abort() {
          this.onend?.()
        }
      }

      Object.defineProperty(window, 'SpeechRecognition', {
        configurable: true,
        value: FakeSpeechRecognition,
      })
    })
    await page.reload()
    await page.getByLabel('Password', { exact: true }).fill(process.env.WEB_DEMO_TEST_PASSWORD!)
    await page.getByRole('button', { name: 'Continue to pilot' }).click()

    const request = page.getByLabel('What would you like to prototype?')
    await request.fill('Start with this:')
    await page.getByRole('button', { name: 'Voice Command' }).click()
    await expect(request).toHaveValue('Start with this: Create a home page.')
    await expect(page.getByRole('button', { name: 'Stop listening' })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('status')).toContainText('Listening.')
    await page.getByRole('button', { name: 'Stop listening' }).click()
    await expect(page.getByRole('button', { name: 'Voice Command' })).toHaveAttribute('aria-pressed', 'false')
  })

  test('step 2 links to the clickable portal prototype, which loads and opens its chat', async ({ page, context }) => {
    await expect(page.getByRole('link', { name: /Open the clickable prototype/ })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Task-focused homepage' })).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Communication summary' })).toHaveCount(0)
    await page.getByRole('button', { name: 'Baylee entry points', exact: true }).click()
    await expect(page.getByRole('button', { name: 'Baylee entry points', exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByRole('img', { name: /Preview of the Get Care page/ })).toBeVisible()
    await expect(page.locator('.preview-caption, .pipeline')).toHaveCount(0)
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
    const build = page.getByRole('button', { name: 'Build', exact: true })
    await expect(build).toBeDisabled()
    await expect(build).toHaveCSS('background-color', 'rgb(47, 111, 214)')
    await expect(page.locator('.preview-status')).toHaveCount(0)
    await page.getByLabel('What would you like to prototype?').fill('Create a home page.')
    await expect(build).toBeEnabled()
    await build.click()
    const frame = page.frameLocator('iframe[title="Interactive homepage template"]')
    await expect(frame.getByRole('heading', { name: 'Welcome home' })).toBeVisible()
    await expect(frame.getByText('Local interactive preview | Not AI-generated', { exact: false })).toBeVisible()
    await frame.getByRole('button', { name: 'Open weekly plan' }).click()
    await expect(frame.getByRole('heading', { name: 'Plan your week', exact: true })).toBeFocused()
    await frame.getByRole('button', { name: 'Mark sample task complete' }).click()
    await expect(frame.getByRole('button', { name: 'Completed', exact: true })).toBeDisabled()
    await frame.getByRole('button', { name: 'Back to home' }).click()
    await expect(frame.getByText('Completed in this demo')).toBeVisible()
    await expect(frame.getByRole('button', { name: 'Open weekly plan' })).toBeFocused()
    const mobileView = page.locator('.preview-card').getByRole('button', { name: 'Mobile', exact: true })
    await expect(mobileView).toBeDisabled()
    await expect(page.locator('.preview-card').getByRole('button', { name: 'Desktop' })).toHaveAttribute('aria-pressed', 'true')
    expect(await page.locator('iframe').evaluate(element => element.getBoundingClientRect().width)).toBeGreaterThan(340)
    const overflow = await frame.locator('html').evaluate(element => element.scrollWidth > element.clientWidth)
    expect(overflow).toBe(false)
    await expect(frame.getByText('Completed in this demo')).toBeVisible()
  })

  test('changes layouts explicitly, reports stale or unmatched requests, and rebuilds cleanly', async ({ page }) => {
    const request = page.getByLabel('What would you like to prototype?')
    const build = page.getByRole('button', { name: 'Build', exact: true })
    const frame = page.frameLocator('iframe')
    await request.fill('Create a task-focused home page.')
    await build.click()
    await expect(frame.getByRole('heading', { name: 'Your tasks, in one place' })).toBeVisible()
    await request.fill('Create a payment portal')
    await expect(page.getByRole('status')).toContainText('Preview is out of date.')
    await build.click()
    await expect(page.getByRole('alert')).toContainText('No matching template.')
    await expect(page.getByRole('alert')).toContainText('previous preview is unchanged')
    await expect(request).toHaveAttribute('aria-invalid', 'true')
    await expect(frame.getByRole('heading', { name: 'Your tasks, in one place' })).toBeVisible()
    await request.fill('Create a home page.')
    await build.click()
    await expect(frame.getByRole('heading', { name: 'Welcome home' })).toBeVisible()
    await expect(frame.getByRole('heading', { name: 'Communication summary' })).toHaveCount(0)
    await build.click()
    await expect(frame.getByRole('heading', { name: 'Welcome home' })).toBeVisible()
  })

  test('isolates preview styles, checks keyboard focus, and scans platform accessibility', async ({ page }) => {
    await page.getByLabel('What would you like to prototype?').fill('Create a home page.')
    await page.getByRole('button', { name: 'Build', exact: true }).click()
    const frame = page.frameLocator('iframe')
    await expect(frame.getByRole('heading', { name: 'Welcome home' })).toBeVisible()
    const frameTheme = await frame.locator('html').evaluate(element => ({
      platformToken: getComputedStyle(element).getPropertyValue('--fi-midnight-navy'),
      text: getComputedStyle(element).color,
      background: getComputedStyle(element).backgroundColor,
      headingFont: getComputedStyle(element.ownerDocument.querySelector('h1')!).fontFamily,
    }))
    expect(frameTheme.platformToken).toBe('')
    expect(frameTheme.text).toBe('rgb(27, 36, 48)')
    expect(frameTheme.background).toBe('rgb(233, 237, 242)')
    expect(frameTheme.headingFont).toContain('Space Grotesk')
    const action = frame.getByRole('button', { name: 'Open preferences' })
    expect(await action.evaluate(element => getComputedStyle(element).backgroundColor)).toBe('rgb(47, 111, 214)')
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
