import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { dirname, join } from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { studioRoot } from './lib.mjs'

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))

export const defaultLedger = join(studioRoot, 'runs', 'ledger.jsonl')

export function loadConfig() {
  return {
    limits: readJson(join(studioRoot, 'config', 'limits.json')),
    pricing: readJson(join(studioRoot, 'config', 'pricing.json')),
  }
}

function runValidator() {
  const ajv = new Ajv2020({ allErrors: true })
  addFormats(ajv)
  return ajv.compile(readJson(join(studioRoot, 'schemas', 'run.schema.json')))
}

export function validateRun(record) {
  const validate = runValidator()
  return validate(record) ? [] : validate.errors.map((e) => `${e.instancePath || '/'} ${e.message}`)
}

export const hashText = (text) => createHash('sha256').update(text).digest('hex')

// Fails closed: a model without a configured price cannot run, rather than costing "zero".
export function costUsd(usage, model, pricing) {
  const rate = pricing.rates?.[model]
  if (!rate) throw new Error(`no price configured for model "${model}"`)
  const total = (usage.inputTokens * rate.inputPerMillion + usage.outputTokens * rate.outputPerMillion) / 1e6
  return Math.round(total * 1e6) / 1e6
}

// Fails closed: one unreadable line stops runs until a human fixes the ledger.
export function readLedger(path) {
  if (!existsSync(path)) return []
  const records = []
  readFileSync(path, 'utf8')
    .split('\n')
    .forEach((line, index) => {
      if (!line.trim()) return
      let record
      try {
        record = JSON.parse(line)
      } catch {
        throw new Error(`ledger line ${index + 1} is not valid JSON`)
      }
      const errors = validateRun(record)
      if (errors.length > 0) throw new Error(`ledger line ${index + 1} is invalid: ${errors.join('; ')}`)
      records.push(record)
    })
  return records
}

export function appendRun(path, record) {
  const errors = validateRun(record)
  if (errors.length > 0) throw new Error(`run record is invalid: ${errors.join('; ')}`)
  mkdirSync(dirname(path), { recursive: true })
  appendFileSync(path, `${JSON.stringify(record)}\n`)
}

const utcDay = (iso) => new Date(iso).toISOString().slice(0, 10)

// Decides whether a new run may start. Blocked runs are not counted against anyone's limits.
export function checkLimits({ limits, ledger, requestedBy, now = new Date() }) {
  if (!limits.enabled) return { allowed: false, reason: 'The studio is switched off (kill switch).' }
  if (!requestedBy) return { allowed: false, reason: 'The requester is unknown.' }

  const day = now.toISOString().slice(0, 10)
  const month = day.slice(0, 7)
  const counted = ledger.filter((run) => run.status !== 'blocked')
  const today = counted.filter((run) => utcDay(run.startedAt) === day)

  const mine = today.filter((run) => run.requestedBy === requestedBy).length
  if (mine >= limits.perDesignerPerDay) {
    return { allowed: false, reason: `Daily limit reached: ${limits.perDesignerPerDay} runs per designer.` }
  }
  if (today.length >= limits.totalPerDay) {
    return { allowed: false, reason: `Studio daily limit reached: ${limits.totalPerDay} runs.` }
  }
  const spent = counted.filter((run) => utcDay(run.startedAt).startsWith(month)).reduce((sum, run) => sum + run.costUsd, 0)
  if (spent >= limits.monthlyBudgetUsd) {
    return { allowed: false, reason: `Monthly budget of $${limits.monthlyBudgetUsd} is used up.` }
  }
  return { allowed: true }
}

export function summarize(ledger, now = new Date()) {
  const month = now.toISOString().slice(0, 7)
  const byDesigner = {}
  let total = 0
  for (const run of ledger) {
    if (run.status === 'blocked' || !utcDay(run.startedAt).startsWith(month)) continue
    byDesigner[run.requestedBy] ??= { runs: 0, costUsd: 0 }
    byDesigner[run.requestedBy].runs += 1
    byDesigner[run.requestedBy].costUsd = Math.round((byDesigner[run.requestedBy].costUsd + run.costUsd) * 1e6) / 1e6
    total += run.costUsd
  }
  return { month, totalCostUsd: Math.round(total * 1e6) / 1e6, byDesigner }
}
