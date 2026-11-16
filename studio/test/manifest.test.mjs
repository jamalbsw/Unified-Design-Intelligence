import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { readManifests, studioRoot } from '../scripts/lib.mjs'

const manifestsDir = (name) => join(studioRoot, 'fixtures', 'manifests', name)

test('valid manifest is accepted', () => {
  const { manifests, errors } = readManifests(manifestsDir('good'))
  assert.deepEqual(errors, [])
  assert.equal(manifests.length, 1)
})

test('invalid manifest is rejected with specific reasons', () => {
  const { manifests, errors } = readManifests(manifestsDir('bad'))
  assert.equal(manifests.length, 0)
  const text = errors.join('\n')
  assert.match(text, /\/id must match pattern/)
  assert.match(text, /\/dataPolicy must be equal to constant/)
  assert.match(text, /must have required property 'ask'/)
})

test('a folder with only a spec (awaiting approval) is allowed, an empty one is not', () => {
  const dir = mkdtempSync(join(tmpdir(), 'studio-protos-'))
  mkdirSync(join(dir, 'spec-only'))
  writeFileSync(join(dir, 'spec-only', 'spec.json'), '{}')
  mkdirSync(join(dir, 'empty-one'))
  const { errors } = readManifests(dir)
  assert.deepEqual(errors, ['empty-one: missing prototype.json'])
})

test('real prototypes folder is valid (or empty)', () => {
  const { errors } = readManifests(join(studioRoot, 'prototypes'))
  assert.deepEqual(errors, [])
})
