import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { checkSpec, loadSpecContext, sha256, verifyApproval } from '../scripts/spec.mjs'
import { studioRoot } from '../scripts/lib.mjs'

const specFile = (name) => join(studioRoot, 'fixtures', 'specs', name)
const load = (name) => JSON.parse(readFileSync(specFile(name), 'utf8'))
const context = loadSpecContext()

test('spec context reads the template states and the catalog', () => {
  assert.deepEqual(context.states, ['default', 'loading', 'empty', 'error', 'success'])
  assert.deepEqual(context.components.sort(), ['Button', 'Card', 'Notice'])
})

test('a good spec is accepted', () => {
  assert.deepEqual(checkSpec(load('good.spec.json'), context), [])
})

test('a bad spec reports every problem', () => {
  const text = checkSpec(load('bad.spec.json'), context).join('\n')
  assert.match(text, /component "FancyCarousel" is not in the approved catalog/)
  assert.match(text, /unknown state "mystery"/)
  assert.match(text, /must include the "default" state/)
  assert.match(text, /listed more than once/)
})

test('a spec that does not match the schema is rejected', () => {
  assert.notDeepEqual(checkSpec({ id: 'Bad Id' }, context), [])
})

function approvalFixture(approvedHash) {
  const dir = mkdtempSync(join(tmpdir(), 'studio-approval-'))
  const spec = join(dir, 'spec.json')
  const approval = join(dir, 'approval.json')
  writeFileSync(spec, readFileSync(specFile('good.spec.json')))
  writeFileSync(approval, JSON.stringify({ approvedBy: 'example-designer', specSha256: approvedHash ?? sha256(spec) }))
  return { spec, approval }
}

test('approval is accepted for the exact approved spec', () => {
  const { spec, approval } = approvalFixture()
  assert.deepEqual(verifyApproval(spec, approval), [])
})

test('editing the spec after approval invalidates it', () => {
  const { spec, approval } = approvalFixture()
  writeFileSync(spec, `${readFileSync(spec, 'utf8')} `)
  assert.match(verifyApproval(spec, approval).join(), /changed after it was approved/)
})

test('a missing approval blocks the build', () => {
  const { spec } = approvalFixture()
  assert.match(verifyApproval(spec, join(tmpdir(), 'does-not-exist.json')).join(), /no approval found/)
})

test('a malformed approval is rejected', () => {
  const { spec, approval } = approvalFixture('not-a-hash')
  assert.match(verifyApproval(spec, approval).join(), /valid "specSha256"/)
})
