# Kiro Usage & Architecture Report
**Kiroween 2026 Hackathon Submission | Category: Frankenstein**

This document details how **Kiro** (Kiro IDE, Kiro CLI, Kiro Agent Hooks, Steering, Custom Agents, and MCP) was utilized throughout the engineering, hardening, and verification of **PhantomTrace**.

---

## 1. Executive Summary

PhantomTrace was built and audited using Kiro's developer platform to create a robust, multi-agent cyber fraud investigation engine. The project embodies the **Frankenstein** category—assembling six specialized AI analytical organs, deterministic indicator extractors, and cross-case correlation into a cohesive, production-grade security platform.

Kiro's capabilities were leveraged across five pillars:
1. **Real Kiro Agent Hooks (`.kiro/hooks/*.kiro.hook`):** Event-driven automation executing tests, linters, and privacy audits on file save.
2. **Custom Kiro Agent (`.kiro/agents/test-writer.md`):** Specialized agent persona for property-based testing and deterministic invariant validation.
3. **Kiro Steering (`.kiro/steering/kiroween-theme.md`):** Project-wide constraints enforcing the Kiroween aesthetic, WCAG AA accessibility, and reduced-motion standards.
4. **Model Context Protocol (MCP) (`.kiro/settings/mcp.json`):** Standardized context feeds for live PostgreSQL database schema inspection and GitHub repository metadata.
5. **Property-Based Testing (PBT):** Rigorous fuzzing and invariant testing using `jqwik` on Java Spring Boot services.

---

## 2. Kiro Agent Hooks (`.kiro/hooks/`)

PhantomTrace defines real Kiro Agent Hook configuration files formatted to the Kiro IDE hook specification (`.kiro.hook` JSON schema). Alongside traditional shell scripts, these hooks provide IDE-native lifecycle triggers:

| Hook File | Trigger Event | Target Pattern | Action Description |
| :--- | :--- | :--- | :--- |
| `backend-test-on-save.kiro.hook` | `PostFileSave` | `^backend/src/.*\.java$` | Automatically triggers `cd backend && mvn test` to prevent regressions during Spring Boot development. |
| `frontend-lint-on-save.kiro.hook` | `PostFileSave` | `^frontend/src/.*\.(js\|jsx)$` | Executes `cd frontend && npm run lint` to enforce React 18 and Tailwind formatting. |
| `extraction-privacy-review-on-save.kiro.hook` | `PostFileSave` | `DeterministicExtractionService\|SyntheticIndicatorDetector` | Invokes an agent prompt reviewing extraction changes against PBT invariants and privacy documentation. |

In addition, shell companions exist under `.kiro/hooks/*.sh` for headless CI/CD execution:
- `backend-test.sh`: Runs the full Maven test suite.
- `frontend-lint.sh`: Runs ESLint across all frontend source files.
- `check-compliance.sh`: Verifies no uncommitted `.env` files or secrets are tracked and validates `.kiro/` tracking.

---

## 3. Custom Kiro Agents (`.kiro/agents/`)

### `test-writer` (`.kiro/agents/test-writer.md`)
A dedicated Kiro custom agent configured with expertise in:
- Property-Based Testing (PBT) using `jqwik` for Java 21 / Spring Boot 3.4.
- Invariant definition: bounded outputs, mathematical clamping, idempotent sanitization, and state machine transitions.
- Epistemic integrity verification: asserting that raw deterministic extractions never receive `AI_INFERENCE` labels, and AI inferences never receive `VERIFIED` labels.

---

## 4. Kiro Steering (`.kiro/steering/`)

### `kiroween-theme.md` (`.kiro/steering/kiroween-theme.md`)
Defines the visual and architectural steering for the Kiroween 2026 Frankenstein theme:
- **Design Philosophy:** Digital threat investigation stitched together from multi-vector fragments (SMS, email, PDF, screenshots, voice transcripts).
- **Aesthetic Guidelines:** Deep eerie obsidian canvas (`#04060a`), spectral emerald/cyan glows (`#00C9C8` / `#10b981`), and stitched dashed border accents representing disparate evidence synthesis.
- **Microcopy:** Thematic alerts ("Haunted infrastructure detected across dossiers", "6 specialized analytical spirits assembled").
- **Accessibility Invariants:** Mandatory WCAG AA contrast compliance ($\ge 4.5:1$) and strict enforcement of `@media (prefers-reduced-motion: reduce)`.

---

## 5. Model Context Protocol (MCP) (`.kiro/settings/mcp.json`)

PhantomTrace provides a standard Kiro MCP configuration enabling AI coding agents to securely access external system context:
- **`postgres` Server:** Standard PostgreSQL MCP server connecting via `${DATABASE_URL}` with read-only inspection access to verify Flyway migrations (V1–V10) and multi-tenant schema isolation.
- **`github` Server:** GitHub MCP server using `${GITHUB_TOKEN}` to inspect PRs, issues, and workflow execution.
- **Security Boundaries:** Both servers default to `autoApprove: []`, requiring explicit human confirmation before executing any tool actions, with zero credentials hardcoded in the repository.

See [MCP Usage Guide](file:///Users/samiralam/project/hackathon/docs/MCP_USAGE.md) for full architecture details.

---

## 6. Property-Based Testing Invariants (`jqwik`)

Using Kiro's `test-writer` agent, we introduced 4 comprehensive property-based test suites to stress-test Spring Boot backend invariants with 4,000+ randomized inputs:
1. **`SecurityManagerPbt`:** Verifies input sanitization length clamping ($\le 24,000$ chars), null-byte stripping, and markdown code fence neutralization.
2. **`SyntheticIndicatorDetectorPbt`:** Verifies RFC 5737 TEST-NET (1, 2, 3) address recognition across all $256^2$ address spaces and RFC 2606 test TLDs.
3. **`DeterministicExtractionServicePbt`:** Fuzzes arbitrary inputs to prove that deterministic indicator extraction never throws unhandled exceptions.
4. **`RiskAssessmentPbt`:** Mathematically proves risk scores are strictly clamped to $[0, 100]$ across arbitrary signal permutations. **This PBT suite caught an actual boundary vulnerability** where raw signal combinations could produce negative risk scores, which was immediately corrected with mathematical clamping.

See [Property-Based Testing Findings](file:///Users/samiralam/project/hackathon/docs/PBT_FINDINGS.md) for full test metrics and details.

---

## 7. Kiro Powers Disclosure

- **Kiro Powers:** **Not used.**
  *(In accordance with hackathon rules requiring complete accuracy and zero unsubstantiated claims, Kiro Powers were evaluated but not incorporated into this codebase, as the project relied instead on Kiro Agent Hooks, Custom Agents, Steering, and MCP configuration.)*

