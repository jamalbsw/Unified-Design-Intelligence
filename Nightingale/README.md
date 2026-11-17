# Nightingale reference workspace

Read component code and Figma, resolve design tokens, approve a specification,
then build and measure an independent React reference approximation.
Use Baylee A2UI as a conversational-pattern reference alongside Nightingale
to specify connected chat/task flows.
Official package/source import is deferred and is not required for this work.
No official components, private implementations, fonts, or assets are bundled.
Follow the root [repository guidance](../AGENTS.md).

## Existing Figma connection

The existing MCP connection `my-mcp-server-265ef024` successfully returned
metadata, design context, variables, and Code Connect data for the Button pilot.
The [agent](../.github/agents/nightingale.agent.md) names that connection's
read tools explicitly. No duplicate workspace MCP server is needed.

In VS Code, select the **Copilot** harness and open **Chat: Open Customizations**.
Confirm **Nightingale** and the six project skills appear without errors.
Start a fresh chat with **Nightingale** and check its tool picker for the existing
connection's read tools. Source reads in this session do not establish that a
fresh custom-agent session has loaded every tool and skill correctly.

If a different machine uses another connection name, update the agent's qualified
tool references to that existing name. Only configure a new server if no Figma
connection exists: use **MCP: Add Server**, HTTP transport, and Figma's official
remote endpoint `https://mcp.figma.com/mcp`. Complete browser authorization yourself;
never paste credentials into chat or source control. Organization policy and
file permissions may restrict access independently of server configuration.

## Six project skills

| Skill | Responsibility |
| --- | --- |
| [Read code](../.github/skills/nightingale-code-review/SKILL.md) | Public exports, props, dependencies, applied styles, documentation, behavior. |
| [Read Figma](../.github/skills/nightingale-figma-reference/SKILL.md) | Scoped nodes, screenshots, variables, and labelled Code Connect evidence. |
| [Audit tokens](../.github/skills/nightingale-token-audit/SKILL.md) | Spacing, borders, colours, typography, effects, aliases, units, and themes. |
| [Specify component](../.github/skills/nightingale-component-spec/SKILL.md) | Evidence-backed state/variant matrix, open questions, and acceptance criteria. |
| [Check fidelity](../.github/skills/nightingale-fidelity-check/SKILL.md) | Measured styles, screenshots, behavior, and accessibility after approval. |
| [Read Baylee A2UI](../.github/skills/a2ui-chat-reference/SKILL.md) | AI chat/task compositions, cross-system token provenance, handoffs, shared state, and recovery paths. |

These are project-authored workflows, not official Figma or Nightingale skills.
The agent preloads them in the Copilot harness; they are also available through
the slash-command menu. Figma's own `figma-design-to-code` guidance must be loaded
through its skill resource before `get_design_context`; the agent includes that
read tool and instruction.

The workflows reuse the existing
[screen-spec approval](../studio/skills/spec-a-screen/SKILL.md) and
[accessibility](../studio/skills/a11y-pass/SKILL.md) skills. They do not replace
studio approval records or permit editing protected adapter/token files.

## Nightingale plus Baylee A2UI

The A2UI skill records the supplied Figma file and starting node without access
query parameters. Metadata access to the section and variable/style access to its
`BayleeCard` component were verified through the existing connection. The section
includes card compositions and a group of Nightingale component instances.
This does not establish a complete chat library inventory, release status,
runtime API, or verified interactions.

Nightingale remains the prototype foundation; A2UI adds reference patterns for
conversational composition. Preserve source attribution when comparing tokens,
and resolve disagreements in the draft rather than silently mixing styles.
The same agent can use both references without another MCP server or dependency.

Example request:

> Use a2ui-chat-reference and the Nightingale skills to draft a synthetic flow
> from a chat response card to a conventional task screen and back. Cite the
> relevant nodes and tokens, identify missing patterns, and specify shared state,
> keyboard behavior, errors, and recovery. Stop before implementation.

End-to-end readiness requires testing the connected journey after approval, not
just inspecting each component. Production AI integration and official
component/runtime imports remain outside this reference workflow.

## First pilot: Button

The [draft Button specification](./pilots/button.spec.json) covers a deliberately
small slice: primary, default colour, medium, no icon, light-theme web reference.
It records source/token references, Figma states, missing evidence, and conflicts.
It is not a complete component-library inventory, a studio screen spec, an
approved implementation, or a visual-fidelity pass.

Useful pilot findings:

- The existing Code Connect label is **React Native**, not **react**. This links
  the design to a component but does not establish React web API compatibility.
- Dimensions and applied colours can be traced to source tokens and compared
  with Figma. Effective typography must include the component's bold override.
- Generated Figma reference padding/borders need reconciliation with the code's
  box sizing. Generated reference code is not an authoritative interactive API.
- Loading needs further inspection: its Figma node is wider than the resting
  node, and the exposed variable set differs from the code's loading background.

Example request in a fresh custom-agent chat:

> Read the Button pilot and its linked skills. Verify the default state's token
> chain using the authorized local Nightingale source root I provide and the
> referenced Figma node. Report evidence and disagreements without changing
> designs, importing components, or implementing the draft.

Review tool activity and results, not just the presence of the files. Expected
activity is local reads and Figma reads, with no source uploads or design writes.
Agent instructions are guidance, not a security sandbox; review approvals.

## Next checkpoint

Resolve the draft's open questions and approve the exact reference scope before
implementation. Keep approximations labelled, retain `@studio/ui` for studio
prototypes, and do not confuse the
[placeholder studio token catalog](../studio/context/tokens.json) with extracted
Nightingale token evidence. Do not commit machine-specific source paths,
credentials, access/session query parameters, or confidential design content.

## References

- [Official Figma remote MCP setup](https://developers.figma.com/docs/figma-mcp-server/remote-server-installation/)
- [VS Code custom agents](https://code.visualstudio.com/docs/agent-customization/custom-agents)
- [VS Code agent skills](https://code.visualstudio.com/docs/agent-customization/agent-skills)
