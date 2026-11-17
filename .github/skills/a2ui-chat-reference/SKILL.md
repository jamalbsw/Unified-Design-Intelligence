---
name: a2ui-chat-reference
description: Read the Baylee A2UI Figma library for AI chat cards and patterns, reconcile its tokens with Nightingale, and specify connected prototype flows without importing a runtime or changing designs.
---

# Read Baylee A2UI chat references

Follow the root [repository guidance](../../../AGENTS.md). Use this skill for
conversational interfaces and embedded task UI, alongside the
[Nightingale Figma workflow](../nightingale-figma-reference/SKILL.md).
This is a Figma design-library reference, not evidence that an A2UI protocol,
runtime, component package, or production AI service is installed.

## Source and verified scope

- Figma file key: `9pSQqh5FOUPNTnMcfS5tKO`.
- Starting section: `567:17272`.
- Card composition section: `567:13142`; `BayleeCard` component: `567:12818`.
- Nightingale composition section: `541:7678`.

The existing `my-mcp-server-265ef024` connection returned metadata for the starting
section and variable/style definitions for `BayleeCard`. Observed structures
include card headers, body layouts, footers, and composed Nightingale controls,
including Button, Card, TextArea, and BayleeResponseChip instances. This is
structural evidence, not a complete inventory or verified interaction contract.
Publication status and revision are unknown; a review-section name is not proof
that a component is approved or released.

## Inspect the requested pattern

1. Establish the task and bounded nodes. Read metadata in smaller child scopes
   rather than requesting generated code for the entire library. Identify active
   versus hidden/old examples; do not silently use deprecated-looking examples.
   Record uncertain status instead of guessing.
2. Before `get_design_context`, load Figma's `figma-design-to-code` guidance with
   `get_figma_skill` at `skill://figma/figma-design-to-code/SKILL.md` and follow its
   screenshot and `skillNames` requirements. Inspect context, screenshots, and
   variables for each scoped variant/state. Metadata alone is not a visual spec.
3. Inspect the requested card or chat pattern's anatomy and composition:
   header, body slots, layout alternatives, footer actions, response choices,
   input/composer, and message/status UI where actually present. Record missing
   patterns explicitly; do not invent a composer, streaming state, or API from
   the library's name.
4. Use read-only Code Connect mappings where available. Record the actual label,
   platform, version, and provenance. Do not equate instance names with local
   exports or treat a React Native mapping as a React web API guarantee.
5. Apply the [token audit](../nightingale-token-audit/SKILL.md) to spacing, borders,
   colours, typography, focus, effects, and responsive layout. Label each token
   with its source system, Figma file/node, theme/mode, alias chain when exposed,
   and value/unit. Distinguish shared names from confirmed shared definitions.
   Preserve mixed unitless/pixel line-height evidence rather than normalizing
   without a verified conversion.

## Compose the two references

- Nightingale remains the prototype foundation required by repository guidance;
  Baylee A2UI supplies conversational composition and embedded task patterns.
  Leave Fluid Intelligence platform chrome untouched.
- Prefer confirmed Nightingale primitives for shared controls. Cross-reference
  both files when an A2UI composition embeds them; do not fabricate local code
  mappings or silently replace shared token values.
- Keep A2UI-only tokens/patterns attributable to their source. Record conflicts
  and proposed mappings in the draft; obtain approval before applying overrides.
  Do not merge token dictionaries solely because keys or colours happen to match.

## Specify an end-to-end flow

Combine findings with the
[component-spec workflow](../nightingale-component-spec/SKILL.md) and existing
[screen-spec approval workflow](../../../studio/skills/spec-a-screen/SKILL.md).
For every flow step, record:

- The user goal, screen/chat surface, source-system ownership, and source nodes.
- Entry conditions, trigger, user action, resulting state, next step, and return
  path between the conversation and the conventional task UI.
- Shared synthetic state carried across the handoff; avoid resetting selections
  or submitting actions twice.
- Applicable states: initial/empty, composing, pending/streaming, success,
  failure/retry, cancellation, and completion. Mark each as observed, proposed,
  not applicable, or missing rather than claiming the library defines them all.
- Keyboard/focus behavior, input labelling, accessible action names, status
  announcements that avoid reading every streamed token, and reduced motion.
  Separate design evidence from proposed accessible behavior.
- Acceptance checks for both visual fidelity and flow continuity, including
  back/return, errors, retries, and cancellation where in scope.

Return a cited draft, coverage matrix, token mappings/conflicts, and open
questions. Use existing screen-spec fields and record unsupported patterns in
`openQuestions`; do not invent a new runtime schema or expand the approved
component catalog. Stop for approval before implementation. This skill does not
replace approval records or authorize protected adapter changes.

Use synthetic conversations and local simulated responses only. Do not upload
source, modify designs or mappings, install packages, connect production AI, or
execute generated snippets. Stop on real personal, health, or secret data.
Reference previews must remain labelled approximations, not official library
components. After approved implementation, use the
[fidelity check](../nightingale-fidelity-check/SKILL.md) on both component states
and the complete scoped flow; report checks not run.
