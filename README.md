# Unified Design Intelligence

A shared workspace for turning product requests into interactive prototypes and
for centralizing what users tell us in research. It has two pages:

- **Applied AI Design:** describe an idea and preview the prototype. It uses the
  Nightingale Storybook as a temporary design reference.
- **Research Lab:** search and reuse research insights (UI shell only, not
  connected yet).

**GitHub Pages:** [Open Unified Design Intelligence](https://jamalbsw.github.io/intelligent-workspace/)

The site will be available after the GitHub Pages workflow completes its first
successful deployment. In the repository settings, set **Settings → Pages →
Build and deployment → Source** to **GitHub Actions**. The demo password is set
in the Pages workflow; no Actions secret is needed.

## Run locally

```sh
cd apps/web
npm ci
npm run dev
```

See [the web app README](./apps/web/README.md) for checks and current limitations.

Generated previews are temporary approximations, not official Nightingale
components. AI generation, real authentication, and shared storage are not
connected yet. The password prompt is a demo-only browser gate, not security.
Use fictional examples only; do not enter patient or confidential information.
