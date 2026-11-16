import { join } from 'node:path'
import { readManifests, studioRoot } from './lib.mjs'

const dir = process.argv[2] ?? join(studioRoot, 'prototypes')
const { manifests, errors } = readManifests(dir)

for (const message of errors) console.error(message)
if (errors.length > 0) {
  console.error(`\nManifest validation failed: ${errors.length} problem(s).`)
  process.exit(1)
}
console.log(`Manifest validation passed (${manifests.length} prototype(s)).`)
