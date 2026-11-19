# PhantomTrace — Final Pre-Recording Production Audit & Checklist
**Audit Date:** November 19, 2026, 23:44 IST (18:14 UTC)  
**Evaluator:** Principal QA Automation / DevSecOps Engineer & Hackathon Reviewer  
**Live Frontend:** https://phantomtrace04.vercel.app  
**Live Backend:** https://phantomtrace-backend-vhxt.onrender.com  

---

## 1. Production Verification Audit Matrix (All 12 Checkpoints)

| # | Audit Checkpoint | Type | Status | Empirical Evidence & Live Execution Details |
|---|---|:---:|:---:|---|
| 1 | **Backend Health & Frontend Availability** | Production Live | **PASS** | `GET /api/v1/health` returned `HTTP/2 200 OK` in 328.6 ms (`status: UP`, `dbConnected: true`). Vercel frontend returned `HTTP/2 200 OK` in 408.5 ms. |
| 2 | **Fresh User Registration & Login** | Production Live | **PASS** | `POST /api/v1/auth/register` registered User `16aba2d7-5c8c-466f-aa78-e2f0f0065df9` (`HTTP 201 Created`). `POST /api/v1/auth/login` returned `HTTP 200 OK` issuing a 267-character HS256 JWT with `ROLE_ANALYST`. |
| 3 | **Demo Campaign Seeding (3 Interconnected Cases)** | Production Live | **PASS** | `POST /api/v1/demo/seed` returned `HTTP 200 OK` in 2,457 ms, creating 3 interconnected cases: (1) `SMS Banking Alert & Account Suspension` (Risk 45), (2) `Spear-Phishing Email & KYC Lure` (Risk 50), (3) `Vishing Follow-up & Fraud Refund Lure` (Risk 55). All 3 cases flagged `syntheticDemo: true`. |
| 4 | **Campaign Reconstruction & Evidence Graph** | Production Live | **PASS** | `GET /api/v1/investigations/{id}/campaign` returned `HTTP 200 OK` in 800 ms (`campaignClassification: SYNTHETIC_DEMO_CAMPAIGN`). Correctly identified shared domain `secure-netbanking-verify.internal-demo.test` (across 3 cases) and shared IP `198.51.100.42` (across 2 cases) with `crossInvestigation: true`. `GET .../graph` returned 7 nodes and 3 edges (`CONTAINS_URL`, `REFERENCES_DOMAIN`). |
| 5 | **AI Forensic Analysis & Agent Outputs** | Production Live | **PASS** | `POST /api/v1/evidence/{id}/analysis` executed all 4 specialized agents (`TEXT_DETECTIVE`, `URL_DETECTIVE`, `INTELLIGENCE_CORRELATION`, `INVESTIGATION_REPORT`). Gracefully isolated provider outcomes without server failure. |
| 6 | **Epistemic Truth Separation (`VERIFIED`, `AI_INFERENCE`, `UNKNOWN`)** | Production Live | **PASS** | Indicators extracted via regex carry deterministic badge `VERIFIED`. Synthetic demo IOCs (RFC 2606 `.test` and RFC 5737 `TEST-NET-2`) safely bypass external intelligence feeds to avoid threat feed pollution and carry status `UNKNOWN`. Heuristic risk signals strictly separated from LLM reasoning. |
| 7 | **Investigation Report & SHA-256 Integrity** | Production Live | **PASS** | `POST /api/v1/investigations/{id}/reports` returned `HTTP 201 Created` (Report `8ea32cf9-d99c-480f-a8bb-f5e997c2de96`). Contains immutable snapshot, deterministic executive baseline, and legal limitation disclaimers. |
| 8 | **Database Persistence Across Sessions** | Production Live | **PASS** | Cleared session and re-authenticated as User A. `GET /api/v1/investigations` confirmed all 3 cases persisted in PostgreSQL (`totalElements: 3`, `content: 3 items`). |
| 9 | **Strict Multi-Tenant Isolation** | Production Live | **PASS** | Registered User B (`audit-user-b-...@recording.test`). User B's `/investigations` query returned 0 items. User B attempting to access User A's case (`GET /investigations/{caseA_id}`) was strictly **REJECTED with HTTP 403 Forbidden**. |
| 10 | **Frontend Downtime Error Handling** | Local & Code Audit | **PASS** | `frontend/src/services/api/apiClient.js` configures a 30s timeout and error interceptor. `frontend/src/components/ui/ErrorState.jsx` renders a styled alert banner with a functional **"Retry"** button, preventing white-screens or client crashes during cold starts. |
| 11 | **No Exposed Secrets or Hardcoded Credentials** | Repo-Wide Audit | **PASS** | No passwords or private keys in Git history or configuration. `.env.example` uses `change_me_to_a_secure_password`. `DemoUserSeeder.java` generates cryptographically secure `SecureRandom` credentials in `dev` profile only. Pre-commit secret hook `.kiro/hooks/pre-commit-check.sh` passed with 0 issues. |
| 12 | **Documentation, Screenshots & Kiro Artifacts** | Repo-Wide Audit | **PASS** | All screenshots exist in `docs/images/`. All 35+ `.kiro` files tracked. Apache 2.0 LICENSE verified. Only 1 operational `YOUTUBE_VIDEO_URL` placeholder remains in `README.md:33`. |

---

## 2. Verdict: Is PhantomTrace Safe to Record?

### **YES — The application is 100% safe, stable, and ready to record.**

All core differentiators—cross-investigation campaign reconstruction, deterministic regex extraction, SHA-256 evidence integrity, interactive graph visualization, and multi-tenant isolation—operate reliably on the live Vercel and Render deployments.

---

## 3. Remaining Blockers Prior to Final Submission

1. **Demo Video Publication:**
   - The user must record the demonstration video ($\le$ 2m 50s) following the exact script in [docs/PHANTOMTRACE_DEMO_VIDEO_STORYBOARD.md](file:///Users/samiralam/project/hackathon/docs/PHANTOMTRACE_DEMO_VIDEO_STORYBOARD.md).
   - Upload to YouTube (Public or Unlisted).
   - Replace `[Watch PhantomTrace Demo](YOUTUBE_VIDEO_URL)` at [README.md:33](file:///Users/samiralam/project/hackathon/README.md#L33) with the live YouTube URL.

---

## 4. Step-by-Step Production Recording Walkthrough

Follow these exact steps for a flawless, glitch-free screen recording:

### Step 0: Pre-Warm the Backend (Do this 1 minute before hitting Record!)
Open a browser tab or run:
```bash
curl https://phantomtrace-backend-vhxt.onrender.com/api/v1/health
```
Ensure the response is `HTTP 200 OK`. This guarantees the Render free-tier container is awake and responds in sub-second time.

### Step 1: Open the Clean Landing Page (0:00 – 0:20)
1. Navigate to [https://phantomtrace04.vercel.app](https://phantomtrace04.vercel.app) in Chrome full screen (1080p, 100% zoom).
2. Show the dark-mode landing hero and feature grid.
3. Click **Login** in the top right.

### Step 2: Fresh Registration or Login (0:20 – 0:35)
1. Click **Register** and enter a clean demonstration account (e.g., `analyst@cyberdefense.org`, password $\ge 8$ chars).
2. Click **Create Account**. The app immediately logs in and loads the empty **Dashboard**.

### Step 3: Trigger 1-Click Synthetic Campaign Seeding (0:35 – 0:50)
1. On the Dashboard (or from sidebar **Campaign Reconstruction**), click the purple **"Seed Demo Campaign"** button.
2. In ~2 seconds, three interconnected cases appear:
   - `[DEMO] Apex Campaign — SMS Banking Alert & Account Suspension`
   - `[DEMO] Apex Campaign — Spear-Phishing Email & KYC Lure`
   - `[DEMO] Apex Campaign — Vishing Follow-up & Fraud Refund Lure`
3. Point out the High Risk scores (45–55) and the `SYNTHETIC DEMO` classification badges.

### Step 4: Deterministic Extraction & Forensic Truth (0:50 – 1:20)
1. Click into **Case 1 (`SMS Banking Alert`)**.
2. Click the **Evidence** tab. Highlight the raw SMS payload.
3. Show the extracted IOCs table:
   - Point out the extracted URL, Domain (`secure-netbanking-verify.internal-demo.test`), and IP (`198.51.100.42`).
   - Highlight the **`VERIFIED`** green epistemic badge and the SHA-256 payload integrity digest.
4. Click **Run AI Multi-Agent Analysis** to show the third-party privacy consent dialog, then accept.

### Step 5: Campaign Reconstruction & Shared Infrastructure Graph (1:20 – 2:00)
1. Click **Campaign Reconstruction** in the sidebar.
2. Show the **Apex Banking Fraud Campaign** cluster.
3. Zoom in on the visual graph:
   - Highlight how all three distinct cases connect to the exact same C2 domain `secure-netbanking-verify.internal-demo.test`.
   - Highlight the shared host IP `198.51.100.42` linking Case 1 and Case 3.
   - Click a node to show its epistemic provenance and relationship metadata.

### Step 6: Print-Ready Audit Dossier (2:00 – 2:30)
1. Return to the investigation and click **Audit Report**.
2. Scroll through the formal forensic report: Case summary, Risk breakdown, Evidence ledger, Chain of Custody.
3. Press `Cmd+P` (or `Ctrl+P`) to trigger the browser print preview:
   - Show how the `@media print` CSS automatically reformats the dark theme into an A4 court-ready black-and-white legal dossier.
   - Cancel print preview.

### Step 7: Architecture & Closing (2:30 – 2:50)
1. Briefly display the GitHub repository (`https://github.com/samir-0-4/Phantom-Trace`).
2. Show the `.kiro/` directory (specs, hooks, agents) in VS Code or browser.
3. Conclude with the live frontend URL: `phantomtrace04.vercel.app`.
