# PhantomTrace Kiroween 2026 video production

**Project** PhantomTrace · Frankenstein category

**Production date** 21 November 2026 (IST)

**Original local export** `PhantomTrace_Kiroween_2026_Demo.mp4`

## Source footage

- The browser take uses Playwright 1.65.1 and Chromium to record the deployed Vercel application. The first Render health request timed out. The backend responded on retry with its database connected, and capture proceeded against production.
- A dedicated synthetic account was registered and signed in. Credential entry took place between capture intervals. The browser sessions stayed separate from any personal account. The recording used a fictional intake case and the app’s labeled synthetic campaign.
- macOS screen recording captured the actual PhantomTrace workspace in Kiro 1.5.11. A temporary navigation helper opened the real project and native editor views. ScreenCaptureKit also produced nine fresh original screenshots. The raw hooks take ends before the desktop leaves Kiro. [Kiro evidence report](../docs/PHANTOMTRACE_KIRO_EVIDENCE_REPORT.md)
- The native Hooks panel showed six recognized definitions, disabled in the Restricted Mode capture workspace. Hook execution and custom agent selection were unverified. Both agent profile files appear in the walkthrough.

## Demonstrated application workflow

- Registration, sign-in, fictional investigation creation, and evidence submission succeeded. The built-in campaign loaded three synthetic cases. The graph shot opens a related email case and selects its evidence node to inspect provenance.
- The live analysis request attempted four agents and returned no findings after an upstream HTTP 404. The edit shows the disclosure and the actual failure. The app continued to display evidence, two related cases with two shared test indicators, and the generated dossier.
- Report generation returned HTTP 201. The shot shows the saved dossier and its classification legend. The live SHA-256 field was unverified. [Production application preflight](../docs/PHANTOMTRACE_VIDEO_PREFLIGHT_REPORT.md)

## Editing and export

The 13-chapter edit uses fresh production browser recordings and native Kiro footage. FFmpeg assembled the clips, graphic title and caption rails, and English narration from the local macOS Daniel voice. Captions are burned into the picture. The edit trims service waits, preserves the original UI, and crops the Kiro status bar. The raw media and reproducible cuts are saved in `video/raw/` and `video/recording/`. [Shot list](SHOT_LIST.md) · [Edit manifest](recording/segments.json)

| Check | Result |
| --- | --- |
| Container and duration | MP4, 170.000 seconds (2:50) |
| Picture | H.264 High, 1920 × 1080, 30 fps, 5,100 frames |
| Audio | English narration, stereo AAC, 48 kHz, −16.0 LUFS, −1.7 dBFS true peak |
| File size | 18,683,458 bytes |
| SHA-256 of the exported MP4 | `927b8bdf383c612fc6aff2d846cb3e399f3003a944a7ce04b456579b9c7244be` |
| Playback | Full audio and video decode completed without errors. Chapter frames were visually checked across the full timeline. Dark frames flagged by the scan were brief in-app loading indicators. Low-motion sections were readable on-screen holds during narration. |
| Privacy review | Reviewed the authentication, investigation, and Kiro captures. The delivered cut shows blank credential fields and synthetic case information. The Kiro takes and screenshots keep private chat panes out of view. |

At the original export, Git changes were limited to Kiro configuration, documentation, and the production assets. The existing `*.mp4` ignore rule keeps the original video local.

## Final remediation audit

**Audit date** 21 November 2026 (IST)

| Result | Check | Evidence |
| --- | --- | --- |
| PASS | Live AI diagnosis | Four persisted production agent records used `llama-3.3-70b-versatile` and reported upstream HTTP 404. The checked-in client resolves to `POST https://api.groq.com/openai/v1/chat/completions`. A direct request to this endpoint with the old model returned `404 model_not_found`. The deployed app retains only the generic HTTP error. Its private Render environment and raw upstream body were unavailable. |
| PASS | Local application with live Groq | The model-only migration exposed a missing prompt schema. After adding the response contract and raising the completion budget to 3,200 tokens, an isolated browser-triggered investigation completed 4/4 agents with local rate limiting enabled. The same browser displayed nine AI assessments, the backend persisted them as `AI_INFERENCE` from source `AI`, and the regenerated dossier contained all four executions. |
| FAIL | Production AI readiness | The deployed evidence still records the retired model failure. The verified repair is local to the workspace, with no deployment or production configuration change in this audit. |
| PASS | Finding classification | The model prompt supplies the exact agent response contract. Ingestion records AI provenance and maps unsupported verification claims to `UNKNOWN`. The frontend distinguishes `UNVERIFIED`, `VERIFIED`, `AI_INFERENCE`, and `UNKNOWN`. The final source passed 225 backend and 34 frontend tests. |
| PASS | Kiro registration and trust gate | The installed IDE read and registered all seven JSON definitions. The trusted Hooks view showed the six previously filmed entries and the additional `secret-detection-before-commit` entry. In the earlier Restricted Mode recording, Kiro marked the hooks disabled. |
| UNVERIFIED | Kiro execution | At 21:49:55 IST, Kiro returned HTTP 402 in a fresh trusted session before editing the disposable Java fixture. Its comment remained unchanged, there was no matching native invocation record, and the hook wrapper never ran. There is no hook exit status. The temporary instrumentation and fixture were removed. |
| PASS | Original video integrity | The original MP4 still measures 170.000 seconds and matches the SHA-256 above. The audit established neither deployed AI recovery nor a Kiro hook execution. The original remains the only submission export. |

The provider retired `llama-3.3-70b-versatile` on 16 August 2026 for free and developer tiers. Its recommended replacement for that model includes `openai/gpt-oss-120b`. Groq’s JSON object mode guarantees JSON syntax without enforcing the application's DTO schema. These two issues explain the observed HTTP 404 and the first local browser run's schema failures. [Groq model deprecations](https://console.groq.com/docs/deprecations) · [Groq structured outputs](https://console.groq.com/docs/structured-outputs)

Both ignored local `.env` copies had an explicit retired-model override. Only the `GROQ_DEFAULT_MODEL` line changed in each copy. The deployment blueprint has no model or base URL override and keeps the Groq key as a managed value. The actual deployed overrides were unavailable for inspection. All audit artifacts and changes remain local in the working tree.

The 24.466-second validation clip (`raw/09-ai-analysis-local-validation.webm`) is a genuine Playwright recording of the localhost build calling live Groq. Full video decode and privacy review passed. The clip also captured a stale risk notice. The risk service checked only the legacy `SUCCESS` status while the orchestrator stored `COMPLETED`. The final source accepts both statuses with persisted output. Regression tests verify the notice clears without changing the deterministic risk score. The localhost clip predates this notice fix. The 2:50 original still contains the observed production failure.

### Exact files changed in this audit

The following 22 files changed relative to the completed original demo. The two `.env` entries are ignored local files. They were edited without exposing their values.

- `.env`
- `.env.example`
- `.kiro/steering/tech-stack.md`
- `README.md`
- `backend/.env`
- `backend/.env.example`
- `backend/src/main/java/com/phantomtrace/ai/agent/AbstractAiAgent.java`
- `backend/src/main/java/com/phantomtrace/ai/agent/StructuredAiResponseParser.java`
- `backend/src/main/java/com/phantomtrace/ai/config/AIProviderConfig.java`
- `backend/src/main/java/com/phantomtrace/ai/config/GroqProperties.java`
- `backend/src/main/java/com/phantomtrace/service/RiskAssessmentService.java`
- `backend/src/main/resources/application.yml`
- `backend/src/test/java/com/phantomtrace/ai/agent/AiPromptEvidenceFieldsTest.java`
- `backend/src/test/java/com/phantomtrace/ai/agent/StructuredAiResponseParserTest.java`
- `backend/src/test/java/com/phantomtrace/service/RiskAssessmentServiceTest.java`
- `docs/PHANTOMTRACE_KIRO_EVIDENCE_REPORT.md`
- `docs/evidence/kiro-hooks-trusted-bottom.png`
- `docs/evidence/kiro-hooks-trusted-top.png`
- `frontend/src/pages/AnalysisResultsPage.jsx`
- `frontend/tests/AnalysisResultsPage.test.jsx`
- `video/PRODUCTION_REPORT.md`
- `video/raw/09-ai-analysis-local-validation.webm`
