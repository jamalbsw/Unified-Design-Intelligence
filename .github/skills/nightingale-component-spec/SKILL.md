---
name: nightingale-component-spec
description: Assemble an evidence-backed Nightingale component specification, variant/state coverage, token mappings, and measurable acceptance criteria before reference implementation.
---

# Specify a reference component

Read [repository guidance](../../../AGENTS.md). Reuse the
[local-code](../nightingale-code-review/SKILL.md),
[Figma-reference](../nightingale-figma-reference/SKILL.md), and
[token-audit](../nightingale-token-audit/SKILL.md) workflows rather than guessing
values or reproducing private implementations.

## Draft

1. State the component, target platform, theme, included variants/states, and
   exclusions. Enumerate the available variants from source and Figma, then mark
   each combination inspected, pending, or excluded. Do not infer the full
   Cartesian product exists, or call a selected pilot the whole library.
2. Follow referenced component documentation, stories, tests, nested components,
   and public exports within scope. Record references not accessed or missing.
3. Describe anatomy, content rules, props/defaults, dimensions, layout, responsive
   behavior, and token provenance. Keep Figma observations separate from code
   observations; record conflicts and unknowns with no invented resolution.
4. Specify enabled-rest, hover, pressed, focus-visible, disabled, loading, and
   relevant combinations. Specify keyboard activation, focus order, accessible
   name, loading announcements, event suppression, and reduced-motion behavior
   as observed or proposed. An unavailable state is not an implicit pass.
5. Record whether fonts/assets are available and authorized for reference use.
   Any substitution must be explicit; do not claim visual fidelity with a
   different font or an unverified asset.
6. Define acceptance criteria before rendering: exact expected token values,
   declared geometry tolerances in CSS pixels, matching capture conditions,
   state-specific interaction assertions, and accessibility checks. Proposed
   tolerances need approval; never invent an automatic passing threshold.
7. Save a draft `Nightingale/pilots/<component>.spec.json` when requested.
   Include `status`, `scope`, `sources`, `tokenEvidence`, `states`,
   `openQuestions`, and `verification`. The
   [Button pilot](../../../Nightingale/pilots/button.spec.json) is an evidence
   example, not a JSON Schema or an approved design.

For flows that include AI chat, also use the
[Baylee A2UI workflow](../a2ui-chat-reference/SKILL.md). Cite the source system
for each surface/component and document transitions, shared synthetic state,
return paths, and recovery between conversational UI and conventional task UI.
Carry those requirements into the existing screen-spec workflow; do not treat
isolated component specs as proof that the full user journey works.

## Approval and implementation

Stop and present the draft's open questions. Request approval of the exact scope
and decisions before writing reference component code. The component evidence
file is not a studio screen spec and cannot replace the existing
[spec-a-screen approval workflow](../../../studio/skills/spec-a-screen/SKILL.md).

After approval, use native React/HTML/CSS only where repository rules permit,
label the result an approximation, and retain the `@studio/ui` boundary for studio
prototypes. Do not import official components or copy private implementations.
If required adapter APIs, tokens, fonts, or catalog entries are missing, propose
the human-owned changes rather than editing protected files or bypassing gates.
Then run the [fidelity check](../nightingale-fidelity-check/SKILL.md).
