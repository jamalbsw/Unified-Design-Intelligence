import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { studioRoot } from './lib.mjs'

const readJson = (path) => JSON.parse(readFileSync(path, 'utf8'))

export function loadSpecContext() {
  const catalog = readJson(join(studioRoot, 'context', 'components.json'))
  // Read the state list from the template so the spec checker cannot drift from it.
  const statesSource = readFileSync(join(studioRoot, 'template', 'src', 'states.ts'), 'utf8')
  const list = statesSource.match(/screenStates\s*=\s*\[([^\]]*)\]/)?.[1] ?? ''
  const states = [...list.matchAll(/'([^']+)'/g)].map((m) => m[1])
  return { components: catalog.components.map((c) => c.name), states }
}

// Returns a list of human-readable problems; empty means the spec is acceptable to show a designer.
export function checkSpec(spec, { components, states }) {
  const ajv = new Ajv2020({ allErrors: true })
  addFormats(ajv)
  const validate = ajv.compile(readJson(join(studioRoot, 'schemas', 'spec.schema.json')))
  if (!validate(spec)) return validate.errors.map((e) => `${e.instancePath || '/'} ${e.message}`)

  const errors = []
  const seen = new Set()
  for (const screen of spec.screens) {
    if (seen.has(screen.id)) errors.push(`screen "${screen.id}" is listed more than once`)
    seen.add(screen.id)
    if (!screen.states.includes('default')) errors.push(`screen "${screen.id}" must include the "default" state`)
    for (const state of screen.states) {
      if (!states.includes(state)) errors.push(`screen "${screen.id}": unknown state "${state}" (allowed: ${states.join(', ')})`)
    }
    for (const component of screen.components) {
      if (!components.includes(component)) {
        errors.push(`screen "${screen.id}": component "${component}" is not in the approved catalog; raise it as an open question instead`)
      }
    }
  }
  return errors
}

export const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex')

// An approval is valid only for the exact spec bytes it names. Who approved is
// recorded here but must be authenticated by the platform (the GitHub reviewer), not trusted from this file.
export function verifyApproval(specPath, approvalPath) {
  if (!existsSync(approvalPath)) return ['no approval found: the designer must approve the spec before the build runs']
  const approval = readJson(approvalPath)
  const errors = []
  if (!approval.approvedBy) errors.push('approval is missing "approvedBy"')
  if (!/^[0-9a-f]{64}$/.test(approval.specSha256 ?? '')) errors.push('approval is missing a valid "specSha256"')
  else if (approval.specSha256 !== sha256(specPath)) errors.push('the spec changed after it was approved; it needs a new approval')
  return errors
}
