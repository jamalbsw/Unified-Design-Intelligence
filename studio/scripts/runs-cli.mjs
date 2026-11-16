import { readFileSync } from 'node:fs'
import { appendRun, checkLimits, defaultLedger, loadConfig, readLedger, summarize } from './runs.mjs'

const [command, ...rest] = process.argv.slice(2)
const options = {}
const positional = []
for (let i = 0; i < rest.length; i++) {
  if (rest[i].startsWith('--')) options[rest[i].slice(2)] = rest[++i]
  else positional.push(rest[i])
}
const ledgerPath = options.ledger ?? defaultLedger

function fail(message) {
  console.error(message)
  process.exit(1)
}

try {
  const { limits } = loadConfig()
  if (command === 'check') {
    // STUDIO_ENABLED=false is an emergency switch that needs no commit.
    if (process.env.STUDIO_ENABLED === 'false') limits.enabled = false
    const result = checkLimits({ limits, ledger: readLedger(ledgerPath), requestedBy: options.user })
    if (!result.allowed) fail(`Run blocked: ${result.reason}`)
    console.log('Run allowed.')
  } else if (command === 'record' && positional[0]) {
    appendRun(ledgerPath, JSON.parse(readFileSync(positional[0], 'utf8')))
    console.log(`Recorded run in ${ledgerPath}.`)
  } else if (command === 'summary') {
    console.log(JSON.stringify(summarize(readLedger(ledgerPath)), null, 2))
  } else {
    console.error(
      'Usage: node scripts/runs-cli.mjs check --user <github-user> [--ledger <file>]\n' +
        '       node scripts/runs-cli.mjs record <run.json> [--ledger <file>]\n' +
        '       node scripts/runs-cli.mjs summary [--ledger <file>]',
    )
    process.exit(2)
  }
} catch (error) {
  // Any unexpected problem blocks the run.
  fail(`Run blocked: ${error.message}`)
}
