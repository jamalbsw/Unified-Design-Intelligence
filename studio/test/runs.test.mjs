import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { appendRun, checkLimits, costUsd, hashText, readLedger, summarize, validateRun } from '../scripts/runs.mjs'
import { studioRoot } from '../scripts/lib.mjs'

const now = new Date('2026-11-15T15:00:00Z')
const limits = { enabled: true, perDesignerPerDay: 2, totalPerDay: 3, monthlyBudgetUsd: 10 }

const run = (overrides = {}) => ({
  runId: `r-${Math.random().toString(36).slice(2)}`,
  prototypeId: 'demo-appointment-prep',
  requestedBy: 'ada',
  phase: 'spec',
  status: 'succeeded',
  startedAt: '2026-11-15T10:00:00Z',
  costUsd: 1,
  ...overrides,
})

const check = (ledger, requestedBy = 'ada', overrides = {}) =>
  checkLimits({ limits: { ...limits, ...overrides }, ledger, requestedBy, now })

test('a run is allowed when nothing has happened yet', () => {
  assert.deepEqual(check([]), { allowed: true })
})

test('the kill switch blocks everything', () => {
  assert.match(check([], 'ada', { enabled: false }).reason, /kill switch/)
})

test('an unknown requester is blocked', () => {
  assert.equal(check([], '').allowed, false)
})

test('the per-designer daily limit blocks that designer only', () => {
  const ledger = [run(), run()]
  assert.match(check(ledger, 'ada').reason, /per designer/)
  assert.equal(check(ledger, 'grace').allowed, true)
})

test('the studio-wide daily limit blocks everyone', () => {
  const ledger = [run({ requestedBy: 'a' }), run({ requestedBy: 'b' }), run({ requestedBy: 'c' })]
  assert.match(check(ledger, 'd').reason, /Studio daily limit/)
})

test('the monthly budget blocks once spent, across designers', () => {
  const ledger = [run({ requestedBy: 'a', costUsd: 6, startedAt: '2026-11-02T10:00:00Z' }), run({ requestedBy: 'b', costUsd: 4, startedAt: '2026-11-03T10:00:00Z' })]
  assert.match(check(ledger, 'c').reason, /Monthly budget/)
})

test('yesterday and last month do not count against today', () => {
  const ledger = [run({ startedAt: '2026-11-14T23:59:00Z' }), run({ startedAt: '2026-10-31T10:00:00Z', costUsd: 50 })]
  assert.deepEqual(check(ledger), { allowed: true })
})

test('blocked runs are not counted against limits or the budget', () => {
  const ledger = [run({ status: 'blocked', blockedReason: 'limit', costUsd: 0 }), run({ status: 'blocked', blockedReason: 'limit', costUsd: 0 })]
  assert.deepEqual(check(ledger), { allowed: true })
})

test('cost is computed from configured rates and fails closed for unknown models', () => {
  const pricing = { rates: { 'example-model': { inputPerMillion: 2, outputPerMillion: 8 } } }
  assert.equal(costUsd({ inputTokens: 500_000, outputTokens: 100_000 }, 'example-model', pricing), 1.8)
  assert.throws(() => costUsd({ inputTokens: 1, outputTokens: 1 }, 'mystery-model', pricing), /no price configured/)
  assert.throws(() => costUsd({ inputTokens: 1, outputTokens: 1 }, 'example-model', { rates: {} }), /no price configured/)
})

test('a blocked record must say why, and bad records are rejected', () => {
  assert.notDeepEqual(validateRun(run({ status: 'blocked' })), [])
  assert.deepEqual(validateRun(run({ status: 'blocked', blockedReason: 'daily limit' })), [])
  assert.notDeepEqual(validateRun(run({ costUsd: -1 })), [])
  assert.notDeepEqual(validateRun(run({ promptSha256: 'abc' })), [])
  assert.equal(hashText('x').length, 64)
})

test('the ledger round-trips and a corrupt line stops runs', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'studio-ledger-')), 'ledger.jsonl')
  assert.deepEqual(readLedger(path), [])
  appendRun(path, run({ runId: 'one' }))
  appendRun(path, run({ runId: 'two' }))
  assert.deepEqual(readLedger(path).map((r) => r.runId), ['one', 'two'])
  assert.throws(() => appendRun(path, { runId: 'bad' }), /invalid/)
  writeFileSync(path, '{not json\n', { flag: 'a' })
  assert.throws(() => readLedger(path), /line 3 is not valid JSON/)
})

test('the summary groups month-to-date spend by designer', () => {
  const ledger = [run({ costUsd: 1.5 }), run({ requestedBy: 'grace', costUsd: 2 }), run({ costUsd: 0.5, startedAt: '2026-10-01T10:00:00Z' })]
  assert.deepEqual(summarize(ledger, now), {
    month: '2026-11',
    totalCostUsd: 3.5,
    byDesigner: { ada: { runs: 1, costUsd: 1.5 }, grace: { runs: 1, costUsd: 2 } },
  })
})

test('the CLI blocks on the kill switch environment variable and on a corrupt ledger', () => {
  const dir = mkdtempSync(join(tmpdir(), 'studio-cli-'))
  const ledger = join(dir, 'ledger.jsonl')
  const cli = (env) => spawnSync('node', ['scripts/runs-cli.mjs', 'check', '--user', 'ada', '--ledger', ledger], { cwd: studioRoot, env: { ...process.env, ...env }, encoding: 'utf8' })

  assert.equal(cli({}).status, 0)
  const off = cli({ STUDIO_ENABLED: 'false' })
  assert.equal(off.status, 1)
  assert.match(off.stderr, /kill switch/)

  writeFileSync(ledger, 'garbage\n')
  assert.equal(cli({}).status, 1)
})
