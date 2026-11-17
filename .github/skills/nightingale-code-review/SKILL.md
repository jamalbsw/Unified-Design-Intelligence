---
name: nightingale-code-review
description: Inspect authorized local Nightingale component code, trace dependencies and exports, and report compatibility and integration blockers without copying the library.
---

# Read Nightingale code

1. Read the root [repository guidance](../../../AGENTS.md) and
   [setup guide](../../../Nightingale/README.md).
2. Obtain the exact local source root from the user. Confirm access and permission
   to inspect it. Do not assume a `libs` directory exists in this repository.
3. Read source-local contributor guidance and package metadata first. Check
   exports, peer dependencies, React requirements, platform-specific entry points,
   license restrictions, and workspace dependencies. Do not read credentials or
   authentication configuration. Do not install dependencies or run source
   scripts just to inspect the code.
4. Enumerate component directories recursively, including web/native variants.
   Trace public exports to implementation, props, tokens, hooks, utilities, and
   existing stories/tests. Read only the files needed for the requested scope.
   A directory count alone is not a public-component inventory.
5. Report each requested component's public name, source location, platform,
   states/variants, accessibility evidence, dependencies, and missing evidence.
   Distinguish documented behavior from assumptions. Cite source locations
   instead of reproducing private implementations.
6. Compare against the studio's [adapter catalog](../../../studio/context/components.json)
   without changing it. Similar names do not prove compatible APIs.
7. Hand token usage to the [token audit](../nightingale-token-audit/SKILL.md)
   and behavior/variant evidence to the
   [component specification](../nightingale-component-spec/SKILL.md).
   Package integration is deferred; do not treat it as a prerequisite for
   reference inspection. Do not copy, install, or integrate actual components.

Return findings and blockers. Do not modify the source repository, publish code,
or send it to external tools. If an inventory was requested, state its exact
scope and omissions; do not claim completeness without checking public exports
and all relevant platform branches.
