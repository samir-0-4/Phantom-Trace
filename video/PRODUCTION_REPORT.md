# PhantomTrace Kiroween 2026 video production

**Project** PhantomTrace · Frankenstein category

**Production date** 21 November 2026 (IST)

**Original local export** `PhantomTrace_Kiroween_2026_Demo.mp4`

**Submission cut** `PhantomTrace_Kiroween_2026_Submission.mp4`

## 22 November submission checks

| Result | Check | Evidence |
| --- | --- | --- |
| PASS | Public source and license | GitHub serves the reviewed `9dfa16a` release on `main`, including the root `.kiro/` directory and standard Apache-2.0 license. GitHub identifies the license as `Apache-2.0`. [Release commit](https://github.com/samir-0-4/Phantom-Trace/commit/9dfa16a380545c87a5a0c240e19753eb5b828b3d) |
| PASS | Deployed backend and database | Render deployment `dep-dc1f2nm0tbcc73aknsd0` is live on `9dfa16a`. Public health returned HTTP 200 with `dbConnected: true`. A read-only query to the existing `phantomtrace-db` independently found the four fresh completed demo executions and the report that contains all four execution IDs. No database plan or credentials changed. [Backend health](https://phantomtrace-backend-vhxt.onrender.com/api/v1/health) |
| PASS | Production AI and risk | A Playwright test registered and signed in with a disposable demo account, seeded three synthetic cases, and checked the selected SMS against its reserved-domain fixture. Live analysis returned HTTP 200. All four agents completed with `openai/gpt-oss-120b` and returned 11 findings labeled `AI_INFERENCE` with source `AI`. Risk refresh returned HTTP 200 and cleared the stale analysis notice. |
| PASS | Production report | A real report request returned HTTP 201. The saved dossier contained the AI summary and all four newly completed execution IDs. An independent SHA-256 calculation matched the report digest. The analysis and dossier retakes used the public frontend with the updated Render backend. Credential entry took place off camera. |
| PASS | Deployed frontend | The initial Vercel build failed when it tried to run `vite build` from the repository root. After setting the existing project root to `frontend`, Git-based production deployment `dpl_Eaj7VKtBjZLqc3kikjxkgnzX3wLk` became ready on `9dfa16a` and received the public alias. The homepage and SPA deep link returned HTTP 200. The served bundle includes the reserved `.test` example and the production API origin. This deployment switched over after the Render-backed retake. [Public app](https://phantomtrace04.vercel.app) |
| PASS | Native Kiro registration | The trusted Kiro workspace registered all seven hook definitions. Restricted Mode disables hooks. The filmed custom agents are their real profile definitions. [Kiro evidence report](../docs/PHANTOMTRACE_KIRO_EVIDENCE_REPORT.md) |
| UNVERIFIED | Kiro hook execution | The trusted Kiro session returned HTTP 402 before the agent saved the disposable Java fixture. Kiro documents this `PostFileSave` trigger for a file saved or modified by the agent. There was no qualifying save, command invocation, or exit status. [Kiro File Save trigger](https://kiro.dev/docs/hooks/types/#file-save) |
| FAIL | Database availability through judging | Render shows the authorized existing `phantomtrace-db` on the free plan with expiry on **14 December 2026 at 3:02 p.m. IST**, before judging begins. The database works now. Continuity through the judging period remains unresolved under the current plan. [Judge access and expiry](../docs/DEPLOYMENT_NOTES.md) |
| PENDING | Public YouTube and Devpost | The rules require a publicly visible YouTube link on the Devpost submission. Public video upload and Devpost submission require separate approval. [Rules and submission checklist](../docs/hackathon/rules-verification.md) |

On 23 November, the first browser sign-in timed out before the health endpoint responded. Once health reported `UP` and `dbConnected: true`, Playwright signed into the existing synthetic account on the updated Vercel frontend. It read all four saved executions and 11 AI assessments, loaded the persisted report, checked its digest, and confirmed all four execution IDs were present. This check created no new account, case, AI execution, or report.

### Submission cut export

The separate submission cut replaces the earlier AI and report sections with genuine production retakes. Burned-in English captions carry the narration, with no audio stream. The cut omits the original’s Apple Daniel System Voice, whose license limits sharing. The original export remains byte-for-byte intact. [Shot list](SHOT_LIST.md) · [Submission edit manifest](submission/segments.json) · [Apple macOS Tahoe license §2.F](https://www.apple.com/legal/sla/docs/macOSTahoe.pdf#page=3)

| Check | Result |
| --- | --- |
| Container and duration | MP4, exactly 170.000 seconds (2:50) |
| Picture | H.264 High, 1920 × 1080, 30 fps, 5,100 decoded frames, 13 chapters |
| Audio | No audio stream. English captions are embedded in the picture. |
| Playback and content | Complete FFmpeg decode passed. Review confirmed the registration, investigation, AI, graph, campaign, report, Kiro and closing chapters. The new analysis scene shows 11 AI assessments on a synthetic case. The report scene shows the classification legend. |
| Privacy | The synthetic test account was entered off camera. Crops and masks remove unrelated UI and private information. Frame inspection found labeled sample evidence and no credentials or private Kiro session data. |
| File size | 14,162,648 bytes |
| SHA-256 | `a7d73148bbe78b014028edd3012f9ac03e143eeb0e9a3e656427352fed163463` |

The local raw retakes are `raw/production-ai-success.webm` and `raw/production-refreshed-report.webm`. The two MP4 exports and raw recordings are ignored by Git.

### Submission remediation files

The deployment commit contains the reviewed application, Kiro, evidence, license and guide changes. [Exact deployed commit diff](https://github.com/samir-0-4/Phantom-Trace/commit/9dfa16a380545c87a5a0c240e19753eb5b828b3d)

The verification update covers `docs/DEPLOYMENT_NOTES.md`, `docs/JUDGE_GUIDE.md`, `docs/PHANTOMTRACE_KIRO_EVIDENCE_REPORT.md`, `docs/hackathon/DEVPOST_SUBMISSION.md`, `docs/hackathon/rules-verification.md`, `video/PRODUCTION_REPORT.md`, `video/SHOT_LIST.md`, and `video/submission/segments.json`. The local export also uses `video/submission/render.py` and the two local raw retakes listed above.

## Original cut and 21 November audit

### Source footage

- The browser take uses Playwright 1.65.1 and Chromium to record the deployed Vercel application. The first Render health request timed out. The backend responded on retry with its database connected, and capture proceeded against production.
- A dedicated synthetic account was registered and signed in. Credential entry took place between capture intervals. The browser sessions stayed separate from any personal account. The recording used a fictional intake case and the app’s labeled synthetic campaign.
- macOS screen recording captured the actual PhantomTrace workspace in Kiro 1.5.11. A temporary navigation helper opened the real project and native editor views. ScreenCaptureKit also produced nine fresh original screenshots. The raw hooks take ends before the desktop leaves Kiro. [Kiro evidence report](../docs/PHANTOMTRACE_KIRO_EVIDENCE_REPORT.md)
- The native Hooks panel showed six recognized definitions, disabled in the Restricted Mode capture workspace. Hook execution and custom agent selection were unverified. Both agent profile files appear in the walkthrough.

### Demonstrated application workflow

- Registration, sign-in, fictional investigation creation, and evidence submission succeeded. The built-in campaign loaded three synthetic cases. The graph shot opens a related email case and selects its evidence node to inspect provenance.
- The live analysis request attempted four agents and returned no findings after an upstream HTTP 404. The edit shows the disclosure and the actual failure. The app continued to display evidence, two related cases with two shared test indicators, and the generated dossier.
- Report generation returned HTTP 201. The shot shows the saved dossier and its classification legend. The live SHA-256 field was unverified. [Production application preflight](../docs/PHANTOMTRACE_VIDEO_PREFLIGHT_REPORT.md)

### Editing and export

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

### Original remediation audit

**Audit date** 21 November 2026 (IST)

| Result | Check | Evidence |
| --- | --- | --- |
| PASS | Live AI diagnosis | Four persisted production agent records used `llama-3.3-70b-versatile` and reported upstream HTTP 404. The checked-in client resolves to `POST https://api.groq.com/openai/v1/chat/completions`. A direct request to this endpoint with the old model returned `404 model_not_found`. The deployed app retains only the generic HTTP error. Its private Render environment and raw upstream body were unavailable. |
| PASS | Local application with live Groq | The model-only migration exposed a missing prompt schema. After adding the response contract and raising the completion budget to 3,200 tokens, an isolated browser-triggered investigation completed 4/4 agents with local rate limiting enabled. The same browser displayed nine AI assessments, the backend persisted them as `AI_INFERENCE` from source `AI`, and the regenerated dossier contained all four executions. |
| FAIL | Production AI readiness | The deployed evidence still records the retired model failure. The verified repair is local to the workspace, with no deployment or production configuration change in this audit. |
| PASS | Finding classification | The model prompt supplies the exact agent response contract. Ingestion records AI provenance and maps unsupported verification claims to `UNKNOWN`. The frontend distinguishes `UNVERIFIED`, `VERIFIED`, `AI_INFERENCE`, and `UNKNOWN`. The final source passed 225 backend and 34 frontend tests. |
| PASS | Kiro registration and trust gate | The installed IDE read and registered all seven JSON definitions. The trusted Hooks view showed the six previously filmed entries and the additional `secret-detection-before-commit` entry. In the earlier Restricted Mode recording, Kiro marked the hooks disabled. |
| UNVERIFIED | Kiro execution | At 21:49:55 IST, Kiro returned HTTP 402 in a fresh trusted session before editing the disposable Java fixture. Its comment remained unchanged, there was no matching native invocation record, and the hook wrapper never ran. There is no hook exit status. The temporary instrumentation and fixture were removed. |
| PASS | Original video integrity | The original MP4 still measured 170.000 seconds and matched the SHA-256 above. Deployed AI recovery was later verified on 22 November. |

The provider retired `llama-3.3-70b-versatile` on 16 August 2026 for free and developer tiers. Its recommended replacement for that model includes `openai/gpt-oss-120b`. Groq’s JSON object mode guarantees JSON syntax without enforcing the application's DTO schema. These two issues explain the observed HTTP 404 and the first local browser run's schema failures. [Groq model deprecations](https://console.groq.com/docs/deprecations) · [Groq structured outputs](https://console.groq.com/docs/structured-outputs)

Both ignored local `.env` copies had an explicit retired-model override. Only the `GROQ_DEFAULT_MODEL` line changed in each copy. The deployment blueprint has no model or base URL override and keeps the Groq key as a managed value. The effective model was later confirmed from the 22 November production executions. Local `.env` files and raw footage were excluded from the release commit.

The 24.466-second validation clip (`raw/09-ai-analysis-local-validation.webm`) is a genuine Playwright recording of the localhost build calling live Groq. Full video decode and privacy review passed. The clip also captured a stale risk notice. The risk service checked only the legacy `SUCCESS` status while the orchestrator stored `COMPLETED`. The final source accepts both statuses with persisted output. Regression tests verify the notice clears without changing the deterministic risk score. The localhost clip predates this notice fix. The 2:50 original still contains the observed production failure.

#### Exact files changed in the 21 November audit

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
