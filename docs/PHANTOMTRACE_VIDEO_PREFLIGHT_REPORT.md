# PhantomTrace video preflight report

**21 November 2026, India Standard Time**

Playwright recorded the production PhantomTrace frontend and backend after Render recovered from an initial timeout. The production walkthrough verified registration, sign-in, investigation creation, evidence intake, demo campaign loading, graph interaction, campaign reconstruction, and report generation. The AI analysis request reached production, but the upstream provider returned HTTP 404 and produced zero findings.

## Environment

| Tool | Observed result |
| --- | --- |
| OBS Studio | No installation found in `/Applications`, `~/Applications`, or the Homebrew Caskroom. |
| QuickTime Player | Installed at `/System/Applications/QuickTime Player.app`. |
| Playwright | Version 1.65.1 with cached Chromium. A headless launch inside the shell sandbox hit macOS Mach port permissions. The approved launch recorded the live app. |
| FFmpeg and ffprobe | FFmpeg 8.0.1 and ffprobe available through Homebrew. |
| macOS capture | Native capture test produced a 3.008-second 1600 × 900 clip. ScreenCaptureKit also captured the Kiro window for the IDE recording phase. |

## Availability

- The first Playwright health request reached its 90-second timeout. A separate bounded check to the same health route received zero bytes in 22 seconds. The Vercel frontend returned HTTP 200 in about 0.33 seconds during those checks.
- Render then returned HTTP 200 in about 0.32 seconds through `/actuator/health`, reporting `UP`, database connected, and Groq configured. The Playwright capture immediately verified HTTP 200 from both production services and loaded the real application.

## Verified production interactions

| Step | Observed result |
| --- | --- |
| Registration and sign-in | Actual form submissions returned HTTP 201 and HTTP 200, respectively. The account name was an invented demo alias. Credential entry occurred between clips. Sampled authentication frames show the empty credential fields. |
| Investigation and evidence | Created a new synthetic intake exercise and attached a fictional message containing a reserved `.test` domain and a TEST-NET address. Both UI submissions returned HTTP 201. |
| Demo campaign | **Load Demo Campaign** returned HTTP 200 and three synthetic investigations. The selected SMS case independently returned `syntheticDemo: true`. |
| AI analysis | The recording shows the third-party disclosure, consent for the synthetic case, and the actual result. PhantomTrace returned HTTP 200 with four agent attempts, zero completions, and zero findings. The captured error identified upstream HTTP 404. The available evidence did not identify the provider-side cause. |
| Evidence graph | The SMS graph returned two nodes and one relationship. A separate read-only capture opened the existing **Apex Campaign — Spear-Phishing Email & KYC Lure** synthetic case. Its graph linked the investigation to the email evidence in two nodes and one relationship. Clicking the email node opened the source-evidence panel with Direct verification. |
| Campaign reconstruction | The SMS case returned `SYNTHETIC_DEMO_CAMPAIGN`, two related investigations, and two shared reserved indicators. The three-case footprint is a demonstration fixture. |
| Report generation | **Generate report** returned HTTP 201 and displayed the persisted dossier, the `VERIFIED`, `AI_INFERENCE`, and `UNKNOWN` legend, and synthetic campaign details. The live integrity field did not meet the capture's 64-hex-digit check, so SHA-256 verification was not established. |

## Capture checks

- The application clips were recorded from the live Chromium viewport at 1920 × 1080 and 30 fps. ffprobe confirmed VP9 source clips. The browser clips carry picture only, with audio handled in the final edit.
- Response codes and visible UI assertions verified the workflow. Browser-console logging was outside the capture instrumentation.
- The capture script is [`video/recording/phantomtrace-demo.spec.js`](../video/recording/phantomtrace-demo.spec.js). The sanitized report records aggregate outcomes. Authentication credentials and session data were kept outside project artifacts.
