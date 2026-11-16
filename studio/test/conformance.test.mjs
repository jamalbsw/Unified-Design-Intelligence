import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { checkDirectory, checkSource } from '../gates/conformance.mjs'
import { studioRoot } from '../scripts/lib.mjs'

const config = JSON.parse(readFileSync(join(studioRoot, 'gates', 'conformance.config.json'), 'utf8'))
const fixture = (name) => join(studioRoot, 'fixtures', name, 'src')

test('known-good prototype passes conformance', () => {
  assert.deepEqual(checkDirectory(fixture('good'), config), [])
})

test('the template source passes conformance, including its exempt ui/ adapter', () => {
  assert.deepEqual(checkDirectory(join(studioRoot, 'template', 'src'), config), [])
})

test('the ui/ exemption does not cover prototype code', () => {
  const violations = checkSource('color: #fff;', 'screens/Page.css', config)
  assert.equal(violations.length, 1)
})

test('known-bad prototype fails on every rule', () => {
  const rules = new Set(checkDirectory(fixture('bad'), config).map((v) => v.rule))
  assert.deepEqual([...rules].sort(), ['disallowed-import', 'inline-style', 'raw-color'])
})

test('hex colors are caught but ids and anchors are not', () => {
  assert.equal(checkSource('color: #fff;', 'a.css', config).length, 1)
  assert.equal(checkSource('<a href="#main-content">Skip</a>', 'a.tsx', config).length, 0)
})

test('scoped and relative imports are handled', () => {
  assert.equal(checkSource("import x from '@studio/ui/button'", 'a.tsx', config).length, 0)
  assert.equal(checkSource("import x from './local'", 'a.tsx', config).length, 0)
  assert.equal(checkSource("import x from '@other/ui'", 'a.tsx', config).length, 1)
})
