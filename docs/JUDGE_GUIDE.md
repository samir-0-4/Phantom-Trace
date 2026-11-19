# PhantomTrace — Hackathon Judge Evaluation Guide
**Kiroween 2026 Hackathon Submission | Category: Frankenstein**

Welcome, judges! This guide provides everything you need to evaluate **PhantomTrace** quickly, effectively, and thoroughly.

---

## Live Deployments

| Component | URL | Notes |
| :--- | :--- | :--- |
| **Frontend Application** | [https://phantomtrace04.vercel.app](https://phantomtrace04.vercel.app) | Deployed on Vercel Edge CDN |
| **Backend API** | [https://phantomtrace-backend-vhxt.onrender.com](https://phantomtrace-backend-vhxt.onrender.com) | Spring Boot 3.4 on Render |
| **API Health Check** | [https://phantomtrace-backend-vhxt.onrender.com/api/v1/health](https://phantomtrace-backend-vhxt.onrender.com/api/v1/health) | Canonical uptime, database & integration diagnostic |
| **GitHub Repository** | [https://github.com/samir-0-4/Phantom-Trace.git](https://github.com/samir-0-4/Phantom-Trace.git) | Branch: `main` |

> [!NOTE]
> **Render Cold Start:** The backend runs on Render's free tier. If the instance has been idle, the initial request may take **30–50 seconds** to spin up. Once awake, response times are sub-second. If you see a timeout or loading spinner on the first page load, wait a few moments and refresh.

---

## Fast-Track 5-Minute Evaluation Flow

### Step 1: Login or Register
1. Navigate to [https://phantomtrace04.vercel.app](https://phantomtrace04.vercel.app).
2. Click **Register** to create your own isolated tenant account (e.g. `judge@kiroween.org`), or use any valid email and password ($\ge 8$ chars). Multi-tenant isolation ensures your evidence and cases are strictly private to your account.

### Step 2: Seed the Multi-Case Campaign Dataset (1 Click)
To immediately see PhantomTrace's cross-case campaign correlation and entity resolution in action without manually typing dozens of phishing items:
1. Navigate to **Campaign Reconstruction** from the sidebar or click **Seed Demo Campaign**.
2. Alternatively, open any investigation and click **Seed Synthetic Campaign**.
3. This creates three interconnected cases simulating a coordinated multi-vector campaign (Apex Banking Fraud Campaign):
   - **Apex Campaign — SMS Banking Alert & Account Suspension** (Urgent SMS credential/OTP harvest referencing IP `198.51.100.42` and login portal)
   - **Apex Campaign — Spear-Phishing Email & KYC Lure** (Targeted corporate email lure requesting mandatory annual KYC disclosure on identical host)
   - **Apex Campaign — Vishing Follow-up & Fraud Refund Lure** (SMS follow-up to support call soliciting transaction references for unauthorized charge reversal)
4. Notice how PhantomTrace automatically correlates shared infrastructure across all three cases:
   - Shared Domain: `secure-netbanking-verify.internal-demo.test` (RFC 2606 test domain, shared across all 3 cases)
   - Shared Host IP: `198.51.100.42` (RFC 5737 TEST-NET-2 address, shared between Case 1 and Case 3)
   - Reconstructed Campaign Graph: Links all 3 cases, evidence items, and IOCs while safely flagging them as `SYNTHETIC DEMO CAMPAIGN` fixtures (never polluting external threat intelligence feeds).

### Step 3: Inspect the Interactive Evidence Relationship Graph
1. Navigate to the **Evidence Graph** tab for either case.
2. Explore the visual graph:
   - **Nodes:** Investigations, Evidence items (Email, SMS, PDF), and extracted entities (URLs, Domains, IP addresses, Cryptographic hashes).
   - **Edges:** Colored by relationship type (`REFERENCES_DOMAIN`, `CONTAINS_URL`, `SHARES_INDICATOR`, `MATCHES_THREAT_INDICATOR`).
   - Click any node or edge to inspect forensic provenance and epistemic confidence.

### Step 4: Submit New Evidence & Observe Deterministic vs. AI Separation
1. Click **New Investigation** and enter a title (e.g., "Suspicious Payroll Notification").
2. In the **Evidence** tab, paste a raw phishing lure:
   ```text
   From: security@notifications-bank-alert.com
   Subject: URGENT: Account Suspension Notice
   Date: 2026-11-14

   Dear Customer,
   Your account access has been restricted due to unauthorized login attempts from 198.51.100.42.
   Please verify your identity immediately:
   http://verify-security-login.com/auth/login?session=893247
   Bitcoin settlement wallet for penalty waiver: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
   ```
3. Click **Submit & Extract Indicators**.
4. **Deterministic Extraction:** Watch the system immediately extract IPs, domains, URLs, and BTC wallet addresses locally without any AI calls. Indicators are tagged with epistemic status `VERIFIED` and a tamper-evident SHA-256 payload hash.
5. **AI Multi-Agent Synthesis:** Click **Run AI Multi-Agent Analysis**.
   - Notice the **Data Privacy Confirmation Dialog** explaining exactly what extracted text will be transmitted to Groq LLM before proceeding.
   - Six specialized forensic agents (`TextDetectiveAgent`, `UrlDetectiveAgent`, `EmailDetectiveAgent`, `FileAnalystAgent`, `IntelligenceCorrelationAgent`, `InvestigationReportAgent`) analyze the evidence.
   - Inferences are strictly tagged `AI_INFERENCE` so judges and analysts always know what was mathematically extracted vs. machine-inferred.

### Step 5: Export / Print Court-Ready Forensic Report
1. Click **Audit Report** in the investigation header.
2. The page renders a formal forensic dossier including:
   - Case metadata and chain of custody
   - Risk score matrix (0–100) with mathematical bounds
   - Evidence ledger with SHA-256 cryptographic verification hashes
   - Multi-agent forensic findings and threat intelligence matches
3. Click **Print Report** or press `Cmd+P` / `Ctrl+P`. Notice the dedicated `@media print` layout that strips dark-mode canvas, sidebars, and navigation, generating a clean A4 black-and-white audit report suitable for legal or regulatory disclosure.

---

## Graceful Degradation / Unconfigured API Key Behavior

PhantomTrace is engineered for maximum operational reliability:
- **Groq API:** If `GROQ_API_KEY` is omitted or quota is exhausted, the AI orchestrator falls back to rule-based heuristic synthesis. The UI continues to function with deterministic findings.
- **VirusTotal & URLhaus:** If `VIRUSTOTAL_API_KEY` is unconfigured, threat intelligence lookups fallback to local RFC 5737 / RFC 2606 synthetic indicator detection and deterministic reputation rules.
- **Privacy Hardening:** Under `THREAT_LOOKUP_STRIP_QUERY=true` (default), all URLs have query parameters and fragments stripped before external threat queries are made, preventing sensitive auth tokens or session IDs from leaking.

---

## Verifying Test Suites

PhantomTrace maintains rigorous automated test coverage across both frontend and backend:

### Backend (213 Tests: 204 Unit/Integration + 9 Property-Based Tests across 4 PBT Suites)
```bash
cd backend
mvn test
```
- Includes 4 jqwik Property-Based Testing suites in `com.phantomtrace.pbt.*` generating 4,000+ randomized inputs to verify mathematical invariants (Risk clamping $[0, 100]$, sanitization boundaries $\le 24,000$ chars, RFC 5737 test network coverage, parser stability).

### Frontend (33 Tests: 100% Component & Integration Suite)
```bash
cd frontend
npm test -- --run
npm run lint
npm run build
```
- 33 Vitest unit and integration tests passing.
- 0 ESLint warnings or errors.
- Clean Vite production build.

---

## Submission Documentation Links

- [Kiro Usage Documentation](file:///Users/samiralam/project/hackathon/docs/KIRO_USAGE.md): Deep-dive into Kiro IDE, real hooks, custom agents, steering, and MCP.
- [Property-Based Testing Findings](file:///Users/samiralam/project/hackathon/docs/PBT_FINDINGS.md): Invariants tested and bugs caught with jqwik.
- [MCP Usage Guide](file:///Users/samiralam/project/hackathon/docs/MCP_USAGE.md): Database and GitHub MCP server integration.
- [Deployment Notes](file:///Users/samiralam/project/hackathon/docs/DEPLOYMENT_NOTES.md): Render database renewal guide, cold-start handling, and production architecture.
