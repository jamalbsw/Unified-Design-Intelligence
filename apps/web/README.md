# Unified Design Intelligence

The web front door for two areas: **Applied AI Design** (collect prototype
requests and preview the generation flow) and **Research Lab** (find and reuse
research insights). It uses the public Nightingale Storybook as a design
reference, linked from the "Nightingale Storybook" chip on Applied AI Design; it
does not import or claim to render official Nightingale components.

The platform uses the graphite, blue, and gold palette with Space Grotesk
headings, Inter body text, and JetBrains Mono labels. The prototype screen uses
the wireframe palette; neither set of temporary preview styles claims to be an
official Nightingale implementation.

**GitHub Pages:** [Open Unified Design Intelligence](https://jamalbsw.github.io/Unified-Design-Intelligence/)
after the repository's Pages workflow completes successfully.

## Run locally

```sh
cd apps/web
npm ci
npm run dev
```

Run checks with:

```sh
npm run build
npm run lint
npm test
```

The browser tests build and serve the app with a randomly generated, test-only
demo access value. They exercise template matching, interaction, viewport sizing,
focus restoration, style isolation, and automated platform accessibility checks.
The preview's script-disabled iframe is excluded from axe: its sandbox prevents
axe's asynchronous scan from completing. Preview keyboard navigation, activation,
and visible/restored focus are tested directly without relaxing the sandbox.
Preview screen-reader and additional manual accessibility checks remain needed;
these checks do not establish WCAG compliance.
If Playwright reports that Chromium is missing, run
`npx playwright install chromium` and retry `npm test`.

## Template-based browser pilot

After passing the existing demo access prompt, enter one of these requests and
select **Build template preview**:

- `Create a home page.`
- `Create a task-focused home page.`
- `Create a home page with a communication summary.`

This is deterministic keyword matching, **not AI generation or intent
understanding**. It recognizes home, task, and communication/message keywords;
all other instructions are ignored. Unsupported requests show an explicit error
and leave any previous preview unchanged. Editing a request marks the old
preview as out of date until it is rebuilt.

The preview uses a small React renderer boundary in `src/prototype/`, isolated
inside an iframe so the platform's Fluid Intelligence styles do not leak into
it. It contains independent Nightingale-inspired approximations, not official
components or a verified Figma replication. Selected reference values come from
the [Button pilot evidence](../../Nightingale/pilots/button.spec.json); system
fonts and simplified focus/card styling are explicitly approximations.

Open a sample task, mark it complete, and return home. The status survives screen
navigation and desktop/mobile switching, but rebuilding, leaving Applied AI
Design, or reloading resets the preview's interactive state. The communication
variant opens a fictional update and returns to the summary. Nothing is sent,
saved to browser storage, or shared; there are no AI, MCP, or backend calls.
This tests the browser interaction loop, not whether an AI understands a query.
A2UI chat generation and unrestricted page generation are not implemented.

## Clickable portal and chat prototype

Applied AI Design, **Step 2: Your prototype preview**, links to a standalone,
clickable prototype of a patient portal with a chat assistant beside the page:
`public/prototypes/portal-chat/index.html`, served at `/prototypes/portal-chat/`.
It is a single self-contained HTML file with fictional data and no network calls.
Payments, messages, and appointments are demo-only, and chat replies are scripted,
not AI-generated. It uses Nightingale-inspired approximations (not official
components) built from values read in the Nightingale Storybook; Sharp Sans is not
bundled. Open the page with the link in Step 2, or run `npm run dev` and visit
`/prototypes/portal-chat/`.

## Pilot access

The pilot uses a browser-side password prompt for casual demos only; it is not
real access control, and the password can be recovered from the deployed site.
Never use it to protect sensitive information.

For GitHub Pages, the workflow sets the demo password (`design123`) as
`VITE_PILOT_PASSWORD` for the build. It is visible in this public repository, so
treat it as a courtesy prompt only. For local development, set `VITE_PILOT_PASSWORD`
in an untracked `.env.local` file in this directory.

## Current limitations

- The AI generation service is not connected. Only the explicitly labelled
  template-based browser pilot is enabled.
- Real authentication, shared team storage, and prototype versioning are not
  connected yet.
- The **Research Lab** page (`#research`) is a UI shell only. It is not connected
  to a research platform or storage, shows no research data, and its search,
  filters and "Attach insights" button are disabled. Do not enter participant
  details; research data must never be stored in this public repository.
- Use fictional examples only. Do not enter patient or confidential information.
- Temporary previews must be identified as approximations until the official
  Nightingale package is approved and available.
