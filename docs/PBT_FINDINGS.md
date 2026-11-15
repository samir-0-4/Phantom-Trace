# PhantomTrace — Property-Based Testing (PBT) Findings

This document records the property-based testing suites implemented with **jqwik** (`net.jqwik:jqwik 1.9.2`) under JUnit 5, detailing the invariants verified and findings discovered.

---

## 1. Property-Based Test Suites Implemented

All property tests are located under [`backend/src/test/java/com/phantomtrace/pbt/`](file:///Users/samiralam/project/hackathon/backend/src/test/java/com/phantomtrace/pbt/):

| Test Class | Target Component | Invariant Property Tested | Iterations / Generation |
|---|---|---|:---:|
| **`DeterministicExtractionServicePbt`** | `DeterministicExtractionService` | For any arbitrary string input (including null bytes `\u0000`, unicode, very long strings up to 20,000 chars, emojis, control codes, and malformed URLs), extraction never throws uncaught exceptions and returns strictly well-formed candidate indicators (non-null IDs, non-blank original/normalized values, non-null indicator types). | 500 randomized trials |
| **`SyntheticIndicatorDetectorPbt`** | `SyntheticIndicatorDetector` | 1. Any IPv4 address in RFC 5737 TEST-NET ranges (`192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`) is unconditionally detected as synthetic.<br>2. Any domain ending in RFC 2606 test TLDs (`.test`, `.invalid`, `.localhost`, `.example`) is unconditionally detected as synthetic.<br>3. `example.edu` and subdomains are never classified as synthetic or RFC 2606 documentation domains.<br>4. Public routable IPv4 addresses outside RFC 5737 are never classified as synthetic. | Exhaustive (256/256 per subnet) + 1,000 randomized trials |
| **`SecurityManagerPbt`** | `SecurityManager` | For any input string up to 50,000 characters, `sanitizeUserInput` guaranteed invariants:<br>• Output length never exceeds 24,000 characters (`MAX_INPUT`).<br>• Output never contains null bytes (`\u0000`).<br>• Output never contains unescaped markdown code fences (` ``` `).<br>• Null input returns empty string `""`. | 1,000 randomized trials |
| **`RiskAssessmentPbt`** | `RiskAssessmentService` | For any combination and permutation of extracted signals (payment, credentials, OTP, urgency, unusual URLs, verified threats), the resulting composite risk score is strictly clamped within $[0, 100]$ and maps to the correct severity category (`INCONCLUSIVE`, `LOW`, `MODERATE`, `HIGH`, `CRITICAL`). | 300 randomized trials |

---

## 2. Findings and Discovered Edge Cases

### Finding: Score Lower-Bound Clamping in `RiskAssessmentService`
- **Location:** [`RiskAssessmentService.java`](file:///Users/samiralam/project/hackathon/backend/src/main/java/com/phantomtrace/service/RiskAssessmentService.java)
- **Observation:** The risk score aggregation was originally implemented as:
  ```java
  int score = Math.min(100, signals.stream().mapToInt(Signal::weight).sum());
  ```
  While default signal weights in `RiskAssessmentProperties` are positive ($10$ to $40$), the calculation lacked an explicit lower bound. If custom signal configurations or future rules ever introduced negative signal offsets or penalties, the score could mathematically drop below $0$, violating the $[0, 100]$ API contract.
- **Resolution:** Updated to enforce two-sided bounding:
  ```java
  int score = Math.max(0, Math.min(100, signals.stream().mapToInt(Signal::weight).sum()));
  ```
  The invariant $0 \le \text{score} \le 100$ is now mathematically guaranteed across all potential property weights.

### Component Robustness Observations:
- **`DeterministicExtractionService`:** Handled extreme edge cases including embedded null bytes, multi-byte UTF-8, and 20,000-character random noise payloads without regex catastrophic backtracking (ReDoS) or unexpected runtime exceptions.
- **`SyntheticIndicatorDetector`:** All 256 octet variations of TEST-NET-1, TEST-NET-2, and TEST-NET-3 were exhaustively verified with zero false negatives.
- **`SecurityManager`:** Successfully truncated 50,000-character fuzzing inputs to 24,000 characters and replaced all code fences and null bytes as required.

