# Unified Design Intelligence

A shared workspace for turning product requests into interactive prototypes and
for centralizing what users tell us in research. It has two pages:

- **Applied AI Design:** describe an idea and preview the prototype. It uses the
  Nightingale Storybook as a temporary design reference.
- **Research Lab:** search and reuse research insights (UI shell only, not
  connected yet).

**GitHub Pages:** [Open Unified Design Intelligence](https://jamalbsw.github.io/Unified-Design-Intelligence/)

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

The local web app includes an explicitly labelled **template-based demo**, not
AI generation: build a homepage, a task-focused variant, or a communication
summary and click through sample actions. See the
[web pilot instructions](./apps/web/README.md#template-based-browser-pilot).

## Design-system and Figma tooling

See the [Nightingale setup guide](./Nightingale/README.md) for the workspace Figma
MCP connection, the VS Code Copilot agent, and project skills for reading local
component code, design references, token evidence, and component specifications.
The agent also reads the Baylee A2UI Figma library for chat/task patterns and
connected prototype-flow specifications alongside Nightingale.
Official component import is deferred; the first Button pilot is a draft
reference specification, not an implemented component.
