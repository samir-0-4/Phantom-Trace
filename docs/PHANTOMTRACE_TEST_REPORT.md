# PhantomTrace — Automated Test & Build Verification Report
**Date:** November 19, 2026  
**Environment:** macOS (Darwin 24.6.0) / OpenJDK Temurin 21 / Node.js v20 / Vite 6  
**Evaluator:** QA Automation & DevSecOps Lead  

---

## 1. Executive Summary

All automated test suites across both backend and frontend passed with **100% success rate**. No tests were skipped, disabled, or weakened.

| Suite | Framework | Total Tests | Passed | Failed | Skipped | Execution Time |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Backend Unit & Integration** | JUnit 5 + Spring Boot Test | 204 | 204 | 0 | 0 | 8.2 s |
| **Backend Property-Based (PBT)** | jqwik (4 suites, 4,000+ iterations) | 9 | 9 | 0 | 0 | 0.8 s |
| **Frontend Unit & Component** | Vitest + React Testing Library | 33 | 33 | 0 | 0 | 3.0 s |
| **Frontend Code Quality** | ESLint | Verified | Passed | 0 | 0 | 1.1 s |
| **Frontend Production Build** | Vite Build | Complete | Passed | 0 | 0 | 1.5 s |
| **Backend Production Build** | Maven Package (`spring-boot:repackage`) | Complete | Passed | 0 | 0 | 3.5 s |
| **Total Automated Tests** | | **246** | **246** | **0** | **0** | **18.1 s** |

---

## 2. Backend Test Execution Details

### Command Executed:
```bash
cd backend && mvn clean test
```

### Key Test Categories Verified:
1. **Controller Tests:**
   - `HealthControllerTest`: 2 tests (`/api/v1/health` and `/actuator/health` bridge). Both return HTTP 200 `UP`.
   - `InvestigationControllerTest`: CRUD, pagination, filtering, tenant scoping.
   - `EvidenceControllerTest`: Evidence ingestion, payload validation, status transitions.
   - `AnalysisControllerTest`: Execution triggering, report generation.
   - `AuthControllerTest`: Registration, login, duplicate email rejection, invalid password handling.
2. **Security & Authentication Tests:**
   - `JwtAuthenticationFilterTest`: Valid token authorization, missing token rejection, expired token handling.
   - `JwtServiceTest`: 7 tests verifying HS256 signing, minimum key length ($\ge 32$ bytes), rejection of insecure placeholders.
   - `RateLimitingFilterTest`: Rate limit bucket replenishment, IP isolation, 429 Too Many Requests response.
3. **Forensic Extraction & Risk Calculation:**
   - `DeterministicExtractionServiceTest`: RegEx extraction of URLs, Domains, IPv4, RFC 5737, BTC addresses, lexical urgency/OTP terms.
   - `SyntheticIndicatorDetectorTest`: 86 tests validating RFC 2606 (`.test`, `.example`, `.invalid`, `.localhost`) and RFC 5737 (`198.51.100.0/24`, `192.0.2.0/24`, `203.0.113.0/24`).
   - `RiskAssessmentServiceTest`: Score calculations, weight clamping ($[0, 100]$), epistemic classification.
4. **Campaign Reconstruction Tests:**
   - `CampaignReconstructionServiceTest`: Cross-investigation entity resolution, relationship linking (`SHARES_INDICATOR`, `REFERENCES_DOMAIN`).
   - `DemoDatasetServiceTest`: Three-case synthetic campaign generation, shared domain and IP linkage, idempotent reset.
5. **Property-Based Testing Suites (`jqwik`):**
   - `RiskAssessmentPbt`: Verifies risk score mathematical clamping strictly in $[0, 100]$ across 300 randomized risk signal vectors.
   - `DeterministicExtractionServicePbt`: Verifies regex extraction never throws and produces valid indicator objects across 500 arbitrary fuzzing strings.
   - `SyntheticIndicatorDetectorPbt`: 6 property tests running 4,000+ randomized iterations verifying RFC 2606 TLDs and RFC 5737 IPs are always detected as synthetic fixtures while public IPs are never misclassified.
   - `SecurityManagerPbt`: Verifies input text sanitization boundaries ($\le 24,000$ characters) across 1,000 randomized Unicode payloads.

---

## 3. Frontend Test Execution Details

### Commands Executed:
```bash
cd frontend
npm test -- --run
npm run lint
npm run build
```

### Results Summary:
- **Test Files:** 12 passed of 12.
- **Tests:** 33 passed of 33.
- **Components Tested:**
  - `App.test.jsx`: Landing page hero, navigation structure.
  - `LoginPage.test.jsx`: Form validation, empty submit errors, error alert handling.
  - `RegisterPage.test.jsx`: Password length validation, password match verification.
  - `Routing.test.jsx`: Protected route redirection to `/login`, authenticated pass-through.
  - `DashboardPage.test.jsx`: Stat cards, active cases, recent evidence, empty states.
  - `InvestigationsPage.test.jsx`: Investigation table, search filtering, empty state rendering.
  - `NewInvestigationPage.test.jsx`: Category selection, required field validation.
  - `EvidenceAnalysisPage.test.jsx`: Type switching (SMS, Email, URL, File), input validation.
  - `AnalysisResultsPage.test.jsx`: Risk banner, findings list, epistemic badges, AI disclosure modal.
  - `CampaignReconstructionPage.test.jsx`: Cluster cards, cross-case graph rendering, 1-click seed trigger.
  - `EvidenceGraphPage.test.jsx`: Graph container, node/edge interaction, confidence badges.
  - `LayoutOverflow.test.jsx`: Responsive layout safety, `min-w-0` truncation, mobile grid adaptability.

---

## 4. Build Artifact Verification

1. **Backend JAR Packaging:**
   - Command: `mvn clean package -DskipTests`
   - Artifact: `target/phantomtrace-backend-0.1.0-SNAPSHOT.jar`
   - Size: ~45 MB (Executable Spring Boot fat JAR with embedded Tomcat and Temurin 21 compatibility).
   - Build Status: **SUCCESS**
2. **Frontend Production Bundle:**
   - Command: `vite build`
   - Output Directory: `frontend/dist/`
   - Bundle Assets: Single HTML entry point, modular CSS (with responsive `@media print` rules), dynamically split JavaScript chunks.
   - Build Status: **SUCCESS**

---

## 5. Live Deployment Verification

1. **Render Health Endpoint (`GET /api/v1/health`):**
   - HTTP Status: `200 OK`
   - Response Payload:
     ```json
     {
       "status": "UP",
       "application": "PhantomTrace",
       "version": "0.1.0",
       "dbConnected": true,
       "groqConfigured": true,
       "virusTotalConfigured": true,
       "urlhausConfigured": true
     }
     ```
2. **Actuator Health Compatibility Bridge (`GET /actuator/health`):**
   - HTTP Status: `200 OK` (Permitted and bridged to canonical status).
3. **Vercel Frontend Live Check:**
   - URL: `https://phantomtrace04.vercel.app`
   - HTTP Status: `200 OK`
   - Client API Configuration: Points to production Render API `https://phantomtrace-backend-vhxt.onrender.com/api/v1`.
