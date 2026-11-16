---
name: a11y-pass
description: Run the automated accessibility checks on a prototype and explain findings in plain language with fixes.
---

# Accessibility pass

Run from `studio/template`:

1. `npm run typecheck && npm run conformance`
2. `npm run test:a11y` (builds, serves the build, runs axe on every state, checks a keyboard path)

## Reporting

- For each failure, name the state, the rule (for example `color-contrast`), where it is, and the fix in plain language.
- Fix problems in `src/screens/`. If the cause is in `src/ui/` (adapter or tokens), do not edit it; report it for a human.
- Say "checked so far", not "compliant". Automated tools find only part of WCAG 2.2 AA.
- End with the manual checks still needed before publishing: keyboard order, focus order, reading order, and a screen reader spot check.
