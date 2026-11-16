import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { readManifests, studioRoot } from './lib.mjs'

export function buildIndex(manifests) {
  const entries = manifests
    .map((m) => ({
      id: m.id,
      title: m.title,
      owner: m.owner,
      status: m.status,
      designSystemVersion: m.designSystem.version,
      components: m.components ?? [],
      gatesPassing: Object.values(m.gates).every((g) => g.status === 'pass'),
    }))
    .sort((a, b) => a.id.localeCompare(b.id))
  return { count: entries.length, prototypes: entries }
}

const dir = process.argv[2] ?? join(studioRoot, 'prototypes')
const out = process.argv[3] ?? join(studioRoot, 'dist', 'library-index.json')
const { manifests, errors } = readManifests(dir)

if (errors.length > 0) {
  for (const message of errors) console.error(message)
  process.exit(1)
}
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, `${JSON.stringify(buildIndex(manifests), null, 2)}\n`)
console.log(`Wrote ${out} (${manifests.length} prototype(s)).`)
