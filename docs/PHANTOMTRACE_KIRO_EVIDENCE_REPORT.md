# PhantomTrace Kiro evidence

**Inspection date** 21 November 2026 (IST)

**Workspace** PhantomTrace repository root

**Installed Kiro IDE** 1.5.11, verified from `/Applications/Kiro.app/Contents/Info.plist`

## Repository inspection

- The checkout’s Git origin is `samir-0-4/Phantom-Trace`. The `.kiro/` directory was tracked at the repository root at the start of inspection and is explicitly included by `.gitignore`.
- All 15 specification folders contain nonempty requirements, design, and tasks files. The campaign reconstruction, evidence graph, and report specifications correspond to features in the React frontend and Java backend.
- Seven steering files cover architecture, coding standards, the Frankenstein theme, project rules, security, technology stack, and testing.
- The `test-writer` profile covers property-based and component testing. The `threat-analyst` profile covers evidence classification, correlation, and integration security. Both existing role documents received the YAML front matter specified by Kiro IDE 1.x. [Kiro custom agent configuration](https://kiro.dev/docs/custom-agents/configuration-reference/)
- `.kiro/settings/mcp.json` parses as JSON and declares PostgreSQL and GitHub integrations. Connection details and runtime sessions are excluded from the recording plan.

## Hook configuration

The repository contained two v1 definitions under the older `.kiro.hook` extension and a third that duplicated the frontend lint hook. The backend and extraction-review definitions were moved to the documented standalone `.json` format. The existing standalone frontend lint definition was retained. The hook JSON parsed successfully, the names were unique, and the file matcher expressions compiled. Enabled in this table means the configuration does not set `enabled: false`. [Kiro hook format](https://kiro.dev/docs/hooks/)

| File | Trigger | Matcher | Action | Enabled in file |
| --- | --- | --- | --- | --- |
| `api-contract-validation.json` | `Stop` | Any | Run `scripts/validate-api-contract.sh` | Yes |
| `backend-tests-on-save.json` | `PostFileSave` | `^backend/src/.*\.java$` | Run `cd backend && mvn test` | Yes |
| `backend-tests.json` | `Stop` | Any | Run `cd backend && mvn test` | Yes |
| `extraction-privacy-review-on-save.json` | `PostFileSave` | Extraction service or synthetic indicator detector Java file | Prompt a review of tests and privacy disclosures | Yes |
| `frontend-build.json` | `Stop` | Any | Run `cd frontend && npm run build` | Yes |
| `frontend-lint.json` | `PostFileSave` | `^frontend/src/.*\.(js\|jsx)$` | Run `cd frontend && npm run lint -- --no-warn-ignored` | Yes |
| `secret-detection.json` | `PreToolUse` | `git` tool selector | Run `.kiro/hooks/pre-commit-check.sh` | Yes |

The backend’s save and stop hooks share an action and target different events. The extraction review also applies to its two Java files. The staged-secret check’s `git` selector has not been verified against an actual Kiro tool ID. [Kiro hook triggers and tool selectors](https://kiro.dev/docs/hooks/types/)

## Fresh Kiro captures

macOS Screen & System Audio Recording access was verified with a 3.008-second, 1600 × 900 test clip. macOS continued denying keyboard automation to the command runner after Accessibility was enabled. A temporary Kiro extension development window opened the actual PhantomTrace folder with native editor commands. The helper navigated the editor without invoking agents, hooks, or spec tasks. ScreenCaptureKit captured the genuine Kiro window. The nine original PNGs were visually reviewed for their contents and for private data before they were copied to `docs/evidence/`.

| Screenshot | Visible evidence |
| --- | --- |
| `kiro-workspace.png` | PhantomTrace project explorer and README |
| `kiro-specifications.png` | Campaign reconstruction requirements and native spec navigation |
| `kiro-spec-design.png` | Campaign reconstruction design and architecture |
| `kiro-development-workflow.png` | Native spec task list and the real tasks file |
| `kiro-steering-files.png` | Frankenstein theme steering, including evidence synthesis and accessibility |
| `kiro-custom-agents.png` | Threat Analyst profile and responsibilities |
| `kiro-custom-agent-test-writer.png` | Test Writer profile and responsibilities |
| `kiro-hooks.png` | Native Agent Hooks panel |
| `kiro-backend-hook-config.png` | Java file-save trigger, matcher, Maven command, and timeout |

Kiro’s Agent Hooks panel recognized six definitions in the capture window: `api-contract-validation-on-stop`, `backend-test-on-save`, `backend-tests-on-stop`, `extraction-privacy-review-on-save`, `frontend-build-on-stop`, and `frontend-lint-on-save`. The panel displayed those entries as disabled in Restricted Mode. `secret-detection-before-commit` is the seventh configuration on disk and was absent from the visible panel. The custom agent evidence shows both profiles in the editor. Their availability in the agent selector remains unverified. Genuine hook execution remains unverified, so the capture set omits an execution screenshot.

Native macOS screen recording also preserved three live Kiro takes under `video/raw/`. The hooks take was trimmed before being saved there so the footage ends inside Kiro. The takes show the same workspace, spec navigation, steering, profile definitions, and hook configuration as the stills.

The existing `docs/evidence/kiro-phantomtrace-demo.mp4` decodes end to end. It is 23.97 seconds at 3420 × 2224, H.264, 30 fps, with no audio. It shows genuine Kiro workspace, spec, steering, role, and hook-file views. The assistant pane includes a personal shell prompt and build output that does not establish hook execution. The archival clip remains local and ignored by Git.

## Trusted workspace audit

On 21 November 2026 (IST), the original trusted PhantomTrace workspace in Kiro 1.5.11 showed all seven definitions enabled in the native Agent Hooks view. Kiro’s runtime registry independently reported seven read and seven registered. The seventh entry is `secret-detection-before-commit`, which was below the six rows visible in the Restricted Mode capture. Registration of its `git` selector does not establish that it matches a shell invocation. [Trusted view, top](evidence/kiro-hooks-trusted-top.png) · [Trusted view, bottom](evidence/kiro-hooks-trusted-bottom.png)

In Restricted Mode the native panel marked the hooks disabled. The installed Kiro trigger handlers gate execution on workspace trust. Neither the config’s default enabled state nor registration is evidence of execution.

For the execution check, a new trusted Kiro chat was asked to edit one comment in `backend/src/test/java/com/phantomtrace/KiroHookCapture.java`. The temporary test-only instrumentation would have checked the event name and file path from native hook stdin, run the original `cd backend && mvn test` command, and recorded its exit status. Kiro returned HTTP 402 at 21:49:55 IST before it made the edit. The comment remained `BEFORE`, there was no matching native invocation record, and no exit status was produced. The original hook configuration was restored byte for byte and the disposable file was removed. The standalone regression test run reported in the production report is separate from the Kiro hook check.
