// Parses the body of the "Prototype brief (TADA)" issue form into a brief.
// The body is untrusted text: it is only ever read as data, never run or interpolated into commands.
const FIELDS = [
  { key: 'title', label: 'Title', required: true, max: 200 },
  { key: 'assign', label: 'Assign', required: true, max: 1000 },
  { key: 'define', label: 'Define', required: true, max: 3000 },
  { key: 'ask', label: 'Ask', required: true, max: 3000 },
  { key: 'figmaUrl', label: 'Figma link (optional)', required: false, max: 500 },
]
const SYNTHETIC_LABEL = 'Synthetic data only'

export function parseSections(body) {
  const sections = {}
  const parts = String(body ?? '').split(/^### +(.+?)[ \t]*$/m)
  for (let i = 1; i < parts.length; i += 2) sections[parts[i].trim()] = parts[i + 1].trim()
  return sections
}

function isFigmaUrl(value) {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && (url.hostname === 'figma.com' || url.hostname.endsWith('.figma.com'))
  } catch {
    return false
  }
}

// Returns { brief, errors }. errors is empty only when the brief may go on to a spec.
export function parseBrief(body) {
  const sections = parseSections(body)
  const errors = []
  const brief = {}

  for (const field of FIELDS) {
    let value = sections[field.label] ?? ''
    if (value === '_No response_') value = ''
    if (!value) {
      if (field.required) errors.push(`"${field.label}" is required.`)
      continue
    }
    if (value.length > field.max) errors.push(`"${field.label}" is too long (maximum ${field.max} characters).`)
    else brief[field.key] = value
  }

  if (brief.figmaUrl && !isFigmaUrl(brief.figmaUrl)) errors.push('"Figma link" must be an https figma.com link.')
  if (!/^- \[[xX]\]/m.test(sections[SYNTHETIC_LABEL] ?? '')) errors.push('Please confirm the brief uses synthetic data only.')

  return { brief, errors }
}
