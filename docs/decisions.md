# Open decisions

These block or shape the studio build. Until each is answered, the repo uses clearly labelled placeholders.

| # | Decision | Needed by | Current stand-in | Owner | Answer |
|---|---|---|---|---|---|
| D1 | Are **Mohave** (strategic plan) and **Nightingale** (this repo's `AGENTS.md`) the same design system? | Before context pack v1 | Resolved | Studio owner | **Yes, one system. Use the name Nightingale. Its React components are documented in Storybook.** The rest of the plan aligns. |
| D2 | Source of record for tokens, components and content standards. **Framework: React (confirmed).** Still open: the React version and package feed access. The `AGENTS.md` note lists Nightingale as React 16-18 only, while `apps/web` uses React 19. Storybook is the reference until then. | Before context pack v1 | `@studio/ui` adapter with placeholders in `studio/context/` | Design system steward | Partly answered |
| D3 | Hosting: internal static host behind SSO, or private GitHub Pages (needs GitHub Enterprise Cloud). Per-PR previews need an extra action or the internal host. | Before the preview step | None; public Pages is for non-sensitive demos only | Engineering partner | |
| D4 | GitHub org, designer accounts, and real team names for `.github/CODEOWNERS`. | Before enabling rulesets | `@jamalbsw` | Studio owner | |
| D5 | OpenAI project key with a hard spend cap, billed through the OpenAI Platform. Set it as a GitHub secret yourself; never commit it. | Before the agent runner | None | Procurement | |
| D6 | Date of the AI governance review (rules, data handling, approval flow). | Before day 1 of the pilot | None | Studio owner | |
| D7 | Repo split: keep `studio/` inside this repo for now, or move to separate `studio-platform` and `studio-prototypes` repos so prototype PRs cannot edit platform workflows. | Before the agent runs on real briefs | Single repo with CODEOWNERS | Engineering partner | |
| D8 | How the shared agent signs in to Codex. **Recommended: a dedicated OpenAI API key with a spending cap**, kept as a GitHub Actions secret, instead of a person's seat (the plan cites OpenAI's guidance for CI; confirm against OpenAI's current docs). | Before the agent runner | None; intake is a dry run and needs no key | Studio owner and procurement | Recommended, not yet confirmed |
| D9 | How the front end starts a job. **Recommended: the GitHub issue form first** (no backend, no token in the browser), then a small backend or GitHub App when a smoother flow is worth building. | Before the web UI starts jobs | Issue form with dry-run intake (`.github/workflows/studio-brief.yml`) | Engineering partner | Recommended, in use |

## Why D7 matters

An agent that can open PRs in the same repo as its gates could weaken the gates. CODEOWNERS plus required reviews reduce that risk, but separate repos with pinned workflows are safer. Settle this before the agent runs on real briefs.
