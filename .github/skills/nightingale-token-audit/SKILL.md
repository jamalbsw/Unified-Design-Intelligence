---
name: nightingale-token-audit
description: Resolve Nightingale spacing, border, colour, typography, and interaction tokens from local definitions and Figma, preserving provenance and reporting conflicts.
---

# Audit component tokens

Use after the [local-code](../nightingale-code-review/SKILL.md) and
[Figma-reference](../nightingale-figma-reference/SKILL.md) workflows have identified
the component, platform, variant, state, and theme. Inspect source as data;
never execute token-generation scripts or evaluate source expressions.

## Trace actual usage

1. Follow component property -> semantic token -> aliases -> primitive value.
   Read the applied theme/provider and wrappers as well as token declarations.
   Record literal values as literals, not invented tokens. Detect unresolved or
   cyclic aliases and preserve them as unresolved; never silently substitute.
2. Inspect effective styles, including overrides and interaction precedence.
   A base token is not necessarily the rendered value: a component can override
   typography weight, height, colours, or focus styles later.
3. Collect the corresponding Figma variable/style definitions and design context
   for each inspected state. Record node IDs, variable names, modes, and aliases
   when exposed. A flattened resolved value does not prove its alias chain.
4. Cover these categories, marking each as evidenced, missing, or not applicable:
   - Spacing: horizontal/vertical padding, gaps, margins, icon/text spacing.
   - Geometry: height, width rules, min/max dimensions, border width/style/radius.
   - Colour: surface, label, icon, border, hover, pressed, disabled, focus.
   - Typography: family, effective weight, size, line-height, letter-spacing.
   - Effects: shadows, focus outline/gap, opacity, transitions, reduced motion.
5. Retain units. Do not equate unitless line-height with pixels or native density
   units with CSS pixels. Record conversion assumptions explicitly.
6. Compare like-for-like platform/theme/state values. Flag code/Figma conflicts
   without silently declaring either the source of truth. Distinguish missing
   evidence from an observed mismatch. Inactive in a design may mean enabled
   at rest, not disabled.

## Output

Write token evidence into the requested component spec under `Nightingale/`,
not the studio's live placeholder catalog or CSS. Each entry must identify:

- The component property and applicable variant/state/platform/theme.
- Source system and Figma file where relevant, especially when comparing
  [Baylee A2UI chat references](../a2ui-chat-reference/SKILL.md) with Nightingale.
  Identical token names in different libraries are not proof of shared identity.
- Semantic token, aliases, primitive token, resolved value, and unit where known.
- Source-relative file and line or Figma file/node reference.
- Evidence status: confirmed, inferred, conflicting, or unresolved.

Record source version/revision when available; label it unknown otherwise.
State the exact audited scope and remaining categories. Do not copy entire
private token packages, fonts, assets, or implementations. This is a cited
reference audit, not a package import or a claim of full token coverage.
