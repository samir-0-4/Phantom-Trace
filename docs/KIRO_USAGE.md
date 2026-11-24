# How PhantomTrace used Kiro

PhantomTrace is a Kiroween 2026 Frankenstein project. We used Kiro IDE to organize development around specifications and steering files. The repository also contains custom agent profiles and hook definitions. The native IDE capture shows how these artifacts are laid out in the project. [Kiro evidence report](PHANTOMTRACE_KIRO_EVIDENCE_REPORT.md)

## From a spec to a working evidence graph

The evidence graph is a concrete example of the requirements, design, and task workflow. Requirements constrain the graph to nodes and relationships returned by the authenticated backend and define how to handle loading, empty, disconnected, and error states. The design maps backend records directly to React Flow and keeps layout and selection state in the frontend. The task list separates route and API integration, node and edge rendering, provenance inspection, and testing. [Requirements](../.kiro/specs/evidence-relationship-graph/requirements.md) · [Design](../.kiro/specs/evidence-relationship-graph/design.md) · [Tasks](../.kiro/specs/evidence-relationship-graph/tasks.md)

That sequence makes the API contract and provenance requirement reviewable before changing the UI. During the production capture, selecting the fictional email evidence node displayed its source and verification state. The frontend tests exercise graph rendering and selection. Free-form prompts suit visual exploration. For this feature, the spec made it possible to check frontend behavior against the same source-of-truth rules throughout development. [Graph page](../frontend/src/pages/EvidenceGraphPage.jsx) · [Tests](../frontend/tests/EvidenceGraphPage.test.jsx) · [Verification checks](PHANTOMTRACE_FINAL_VERIFICATION.md)

## Steering

[Project rules](../.kiro/steering/project-rules.md) distinguish verified evidence, inference, and unknowns. The [architecture](../.kiro/steering/architecture.md) and [testing](../.kiro/steering/testing.md) files document service boundaries and testing expectations. [Frankenstein theme guidance](../.kiro/steering/kiroween-theme.md) connects the visual treatment to how the app assembles disparate evidence, with accessibility and reduced-motion requirements. Together these files keep decisions available across features and sessions.

## Hooks and custom agents

The backend save hook is configured to run Maven tests when Kiro edits Java files. The frontend save hook is configured to run ESLint for JavaScript and JSX. A second Java save hook requests a privacy review when the extraction service or synthetic-indicator detector changes. Other definitions cover checks at the end of an agent turn and a pre-tool staged-secret check. The trusted Kiro IDE registered all seven definitions. A later test of the backend save workflow stopped at an HTTP 402 before Kiro edited the disposable file. Hook execution and the staged-secret hook's Git tool matching remain unverified. [Hook definitions](../.kiro/hooks) · [Trusted workspace audit](PHANTOMTRACE_KIRO_EVIDENCE_REPORT.md#trusted-workspace-audit)

The [Threat Analyst](../.kiro/agents/threat-analyst.md) profile describes reviews for evidence classification, correlation, and integrations. The [Test Writer](../.kiro/agents/test-writer.md) profile focuses on invariants and automated regression coverage. The capture shows both profile files in Kiro. Selection and execution of the profiles remain unverified.

## Property-based testing

Four jqwik suites exercise deterministic extraction, synthetic indicator detection, input sanitization, and the risk score's bounds and severity categories. The risk suite varies generated signal counts and flags with default weights. The service also clamps the score to the range from zero to 100. The available evidence supports the implemented checks, with no recorded attribution of the lower-bound change to a generated counterexample or a particular Kiro agent. [Property suites](../backend/src/test/java/com/phantomtrace/pbt) · [Risk property](../backend/src/test/java/com/phantomtrace/pbt/RiskAssessmentPbt.java) · [Score calculation](../backend/src/main/java/com/phantomtrace/service/RiskAssessmentService.java)

## Integrations and scope

The workspace declares PostgreSQL and GitHub MCP servers for optional development use. The audit verified the configuration files. Connection tests and MCP tool calls were outside the verified walkthrough. The recorded Kiro workflow uses the IDE. Kiro Powers, Web, and Crew are outside the documented workflow. [MCP configuration](../.kiro/settings/mcp.json)
