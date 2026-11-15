# PhantomTrace — Model Context Protocol (MCP) Configuration & Usage

This document describes the Model Context Protocol (MCP) servers configured for PhantomTrace in [`.kiro/settings/mcp.json`](file:///Users/samiralam/project/hackathon/.kiro/settings/mcp.json).

---

## Configured MCP Servers

### 1. PostgreSQL MCP Server (`postgres`)
- **Package:** `@modelcontextprotocol/server-postgres`
- **Purpose:** Enables Kiro IDE agent assistance for inspecting the local PostgreSQL database schema, auditing table structures across Flyway migrations (V1–V10), inspecting investigation dossiers, and validating database constraints during backend development.
- **Connection Configuration:** Utilizes `${DATABASE_URL:-postgresql://phantomtrace_user:password@localhost:5432/phantomtrace}` as an environment variable fallback. Real credentials are never stored in the configuration file.
- **State:** `disabled: false`, `autoApprove: []` (queries require manual developer approval).

### 2. GitHub MCP Server (`github`)
- **Package:** `@modelcontextprotocol/server-github`
- **Purpose:** Enables Kiro IDE agent assistance for querying git commits, pull request discussions, issue tracking, and repository metadata on the project repository (`samir-0-4/Phantom-Trace`).
- **Connection Configuration:** Reads `GITHUB_PERSONAL_ACCESS_TOKEN` via the `${GITHUB_TOKEN}` environment variable placeholder.
- **State:** `disabled: false`, `autoApprove: []` (write and read operations require manual developer approval).

---

## Security Invariants

1. **Zero Secret Storage:** Neither database passwords nor GitHub tokens are written in configuration files. Secrets are resolved dynamically from the developer's local shell environment.
2. **Explicit Approval Gate:** `autoApprove` is set to an empty array `[]` for all servers. The AI agent cannot execute database mutations or GitHub operations autonomously without explicit operator confirmation.
3. **Local Scope:** Configured under `.kiro/settings/mcp.json` strictly for developer ergonomics during local investigation workflows and debugging.

