# Unified Design Intelligence

The web front door for two areas: **Applied AI Design** (collect prototype
requests and preview the generation flow) and **Research Lab** (find and reuse
research insights). It uses the public Nightingale Storybook as a design
reference, linked from the "Nightingale Storybook" chip on Applied AI Design; it
does not import or claim to render official Nightingale components.

**GitHub Pages:** [Open Unified Design Intelligence](https://jamalbsw.github.io/intelligent-workspace/)
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
```

## Pilot access

The pilot uses a browser-side password prompt for casual demos only; it is not
real access control, and the password can be recovered from the deployed site.
Never use it to protect sensitive information.

For GitHub Pages, the workflow sets the demo password (`design123`) as
`VITE_PILOT_PASSWORD` for the build. It is visible in this public repository, so
treat it as a courtesy prompt only. For local development, set `VITE_PILOT_PASSWORD`
in an untracked `.env.local` file in this directory.

## Current limitations

- The AI generation service is not connected, so the Generate button is
  intentionally disabled.
- Real authentication, shared team storage, and prototype versioning are not
  connected yet.
- The **Research Lab** page (`#research`) is a UI shell only. It is not connected
  to a research platform or storage, shows no research data, and its search,
  filters and "Attach insights" button are disabled. Do not enter participant
  details; research data must never be stored in this public repository.
- Use fictional examples only. Do not enter patient or confidential information.
- Temporary previews must be identified as approximations until the official
  Nightingale package is approved and available.
