import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { parseBrief } from './brief.mjs'
import { checkLimits, defaultLedger, loadConfig, readLedger } from './runs.mjs'

// Only people who are part of the project may start a run; anyone can open an issue on a public repo.
const ALLOWED_ASSOCIATIONS = ['OWNER', 'MEMBER', 'COLLABORATOR']

// Decides what to do with a new issue. Pure, so every outcome is testable without GitHub.
export function decide({ event, ledger, limits, now = new Date() }) {
  const issue = event?.issue
  if (event?.action !== 'opened' || !issue || !String(issue.title ?? '').startsWith('[Brief]')) {
    return { action: 'ignore' }
  }
  if (!ALLOWED_ASSOCIATIONS.includes(issue.author_association)) {
    return { action: 'reject', message: 'Only organization members and collaborators can start studio runs.' }
  }
  const { errors } = parseBrief(issue.body)
  if (errors.length > 0) {
    return { action: 'reject', message: `This brief needs a few fixes before it can go on:\n\n${errors.map((e) => `- ${e}`).join('\n')}` }
  }
  const limit = checkLimits({ limits, ledger, requestedBy: issue.user?.login, now })
  if (!limit.allowed) return { action: 'reject', message: `Run blocked: ${limit.reason}` }

  return {
    action: 'accept',
    message:
      'Brief accepted. The checks passed: you are allowed to run, the brief is complete and within limits.\n\n' +
      '**This is a dry run.** The agent is not connected yet, so no spec was generated. ' +
      'When it is, the next step is a spec for you to approve before anything is built.',
  }
}

async function postComment(issueNumber, body) {
  const { GITHUB_TOKEN, GITHUB_REPOSITORY, GITHUB_API_URL = 'https://api.github.com' } = process.env
  const response = await fetch(`${GITHUB_API_URL}/repos/${GITHUB_REPOSITORY}/issues/${issueNumber}/comments`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${GITHUB_TOKEN}`, Accept: 'application/vnd.github+json', 'Content-Type': 'application/json' },
    body: JSON.stringify({ body }),
  })
  if (!response.ok) throw new Error(`could not comment on the issue (${response.status})`)
}

async function main() {
  const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'))
  const { limits } = loadConfig()
  if (process.env.STUDIO_ENABLED === 'false') limits.enabled = false

  const result = decide({ event, ledger: readLedger(defaultLedger), limits })
  console.log(`Outcome: ${result.action}`)
  if (result.action === 'ignore') return
  if (process.env.GITHUB_TOKEN) await postComment(event.issue.number, result.message)
  else console.log(result.message)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  // Any unexpected problem fails the job rather than letting a run through.
  main().catch((error) => {
    console.error(`Intake failed: ${error.message}`)
    process.exit(1)
  })
}
