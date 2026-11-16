// Design system conformance gate: fails on raw colors, inline styles and
// imports outside the allow-list. Deterministic and dependency-free so the
// agent cannot talk its way past it.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { extname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const HEX_COLOR = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/
const FUNCTIONAL_COLOR = /\b(?:rgba?|hsla?|hwb|oklch|oklab|lab|lch)\(/i
const IMPORT_SPECIFIER = /(?:\bfrom\s+|\bimport\s*\(?\s*|\brequire\(\s*)['"]([^'"]+)['"]/g
const INLINE_STYLE = /\bstyle\s*=\s*\{/

const SKIPPED_DIRS = new Set(['node_modules', 'dist', '.git'])

function packageName(specifier) {
  const parts = specifier.split('/')
  return specifier.startsWith('@') ? parts.slice(0, 2).join('/') : parts[0]
}

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIPPED_DIRS.has(entry)) continue
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) yield* walk(full)
    else yield full
  }
}

export function checkSource(text, file, config) {
  const violations = []
  const isCss = extname(file) === '.css'
  const lines = text.split('\n')

  lines.forEach((line, index) => {
    const at = (rule, message) => violations.push({ file, line: index + 1, rule, message })
    if (HEX_COLOR.test(line)) at('raw-color', 'Use a Nightingale color token instead of a hex value.')
    if (FUNCTIONAL_COLOR.test(line)) at('raw-color', 'Use a Nightingale color token instead of a color function.')
    if (!isCss && config.forbidInlineStyles && INLINE_STYLE.test(line)) {
      at('inline-style', 'Inline styles bypass tokens; use Nightingale components or token classes.')
    }
    if (!isCss) {
      for (const match of line.matchAll(IMPORT_SPECIFIER)) {
        const specifier = match[1]
        if (specifier.startsWith('.') || specifier.startsWith('/')) continue
        if (!config.allowedPackages.includes(packageName(specifier))) {
          at('disallowed-import', `Package "${specifier}" is not in the approved list.`)
        }
      }
    }
  })
  return violations
}

export function checkDirectory(dir, config) {
  const root = resolve(dir)
  const exempt = config.exemptPaths ?? []
  const violations = []
  for (const file of walk(root)) {
    if (!config.scanExtensions.includes(extname(file))) continue
    const path = relative(root, file).split(sep).join('/')
    if (exempt.some((prefix) => path.startsWith(prefix))) continue
    violations.push(...checkSource(readFileSync(file, 'utf8'), path, config))
  }
  return violations
}

function main() {
  const here = fileURLToPath(new URL('.', import.meta.url))
  const target = process.argv[2] ?? join(here, '..', 'fixtures', 'good', 'src')
  const config = JSON.parse(readFileSync(join(here, 'conformance.config.json'), 'utf8'))
  const violations = checkDirectory(target, config)
  for (const v of violations) console.error(`${v.file}:${v.line}  [${v.rule}] ${v.message}`)
  if (violations.length > 0) {
    console.error(`\nConformance failed: ${violations.length} violation(s).`)
    process.exit(1)
  }
  console.log('Conformance passed.')
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
