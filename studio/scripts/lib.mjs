import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

export const studioRoot = fileURLToPath(new URL('..', import.meta.url))

export function loadValidator() {
  const schema = JSON.parse(readFileSync(join(studioRoot, 'schemas', 'prototype.schema.json'), 'utf8'))
  const ajv = new Ajv2020({ allErrors: true })
  addFormats(ajv)
  return ajv.compile(schema)
}

// Reads prototypes/<id>/prototype.json and checks the folder name matches the manifest id.
export function readManifests(prototypesDir) {
  const validate = loadValidator()
  const manifests = []
  const errors = []
  if (!existsSync(prototypesDir)) return { manifests, errors }

  for (const entry of readdirSync(prototypesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const file = join(prototypesDir, entry.name, 'prototype.json')
    if (!existsSync(file)) {
      // A folder holding only a spec is a prototype still awaiting approval and build.
      if (!existsSync(join(prototypesDir, entry.name, 'spec.json'))) errors.push(`${entry.name}: missing prototype.json`)
      continue
    }
    let data
    try {
      data = JSON.parse(readFileSync(file, 'utf8'))
    } catch (error) {
      errors.push(`${entry.name}: invalid JSON (${error.message})`)
      continue
    }
    if (!validate(data)) {
      for (const e of validate.errors) errors.push(`${entry.name}: ${e.instancePath || '/'} ${e.message}`)
      continue
    }
    if (data.id !== entry.name) errors.push(`${entry.name}: manifest id "${data.id}" must match the folder name`)
    else manifests.push(data)
  }
  return { manifests, errors }
}
