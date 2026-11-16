import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { screenStates } from '../src/states'

// Automated checks cover part of WCAG 2.2 AA. Report results as "checked so far", not "compliant".
const wcagTags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

for (const state of screenStates) {
  test(`axe finds no WCAG A/AA violations in the "${state}" state`, async ({ page }) => {
    await page.goto(`/?state=${state}`)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
    const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze()
    expect(results.violations.map((v) => `${v.id}: ${v.help}`)).toEqual([])
  })
}

test('keyboard: the primary action is reachable with Tab and shows focus', async ({ page }) => {
  await page.goto('/?state=default')
  const primary = page.getByRole('button', { name: 'Confirm visit details' })
  for (let presses = 0; presses < 10; presses++) {
    await page.keyboard.press('Tab')
    if (await primary.evaluate((el) => el === document.activeElement)) break
  }
  await expect(primary).toBeFocused()
  const outline = await primary.evaluate((el) => getComputedStyle(el).outlineStyle)
  expect(outline).not.toBe('none')
})

// Proves the gate can fail: a deliberately inaccessible page must produce violations.
test('gate self-test: axe flags a known-bad page', async ({ page }) => {
  await page.setContent(`
    <html><body>
      <img src="x.png">
      <button></button>
      <p style="color:#ccc;background:#fff">Low contrast text</p>
    </body></html>`)
  const results = await new AxeBuilder({ page }).withTags(wcagTags).analyze()
  const ids = results.violations.map((v) => v.id)
  expect(ids).toEqual(expect.arrayContaining(['image-alt', 'button-name', 'color-contrast']))
})
