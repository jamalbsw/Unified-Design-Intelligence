import { loadSpecContext, checkSpec, verifyApproval } from './spec.mjs'
import { readFileSync } from 'node:fs'

const [command, specPath, approvalPath] = process.argv.slice(2)
let errors

if (command === 'check' && specPath) {
  errors = checkSpec(JSON.parse(readFileSync(specPath, 'utf8')), loadSpecContext())
} else if (command === 'approval' && specPath && approvalPath) {
  errors = verifyApproval(specPath, approvalPath)
} else {
  console.error('Usage: node scripts/spec-cli.mjs check <spec.json>\n       node scripts/spec-cli.mjs approval <spec.json> <approval.json>')
  process.exit(2)
}

for (const message of errors) console.error(message)
if (errors.length > 0) process.exit(1)
console.log(command === 'check' ? 'Spec is valid.' : 'Approval matches the spec.')
