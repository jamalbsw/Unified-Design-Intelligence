---
name: nightingale-fidelity-check
description: Verify an approved Nightingale reference approximation against its component spec using measured tokens, geometry, interactions, screenshots, and accessibility checks.
---

# Check reference fidelity

Use only after an exact component spec and its unresolved decisions have been
approved. Without an implementation, report verification as not run; a token
audit or Figma screenshot alone is not a visual test.

1. Read the approved spec, source references, and acceptance criteria. Match the
   theme, viewport, browser, pixel ratio, font availability, text, and content
   before comparing. Record mismatched capture conditions explicitly.
2. Render only the scoped component and required states using existing tooling.
   Use real hover, press, keyboard focus, and disabled/loading interactions,
   not a state label that merely changes CSS.
3. Measure computed padding, gaps, dimensions, border width/style/radius, colours,
   typography, and focus geometry against approved expected values. Check the
   token mapping as well as the resolved value; one hardcoded matching value does
   not demonstrate token-driven implementation.
4. Compare screenshots for every scoped state. Use existing visual-test tooling
   when available; otherwise report manual inspection separately. Apply only
   approved numeric tolerances. Do not auto-accept changed baselines or let an
   aggregate pixel score hide a wrong border, missing focus ring, or font mismatch.
5. Check native button semantics, accessible name, Tab focus, Enter/Space
   activation, disabled/loading event suppression, announcements, and reduced
   motion when applicable. Reuse the existing
   [accessibility workflow](../../../studio/skills/a11y-pass/SKILL.md) for studio
   prototypes; report manual checks still needed.
6. Add focused behavioral tests in existing test locations for introduced or
   fixed behavior. Use existing build/type-check/test commands scoped to the
   changed project. Do not install a new tool merely to claim a visual pass.

Report a per-state result with expected value, actual value, delta, tolerance,
and evidence. Use pass, fail, or not run with a reason; retain failures and
unverified cases. Report automated accessibility as "checked so far," not
"compliant." Preserve out-of-scope styles and files, especially platform chrome
and protected adapter/gate code. Never use design screenshots as rendered UI.
