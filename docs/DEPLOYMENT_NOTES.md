# PhantomTrace deployment and judge access

The production frontend runs on Vercel. The Spring Boot backend and PostgreSQL database run on Render. The repository includes a Render Blueprint and the application setup instructions. [Frontend](https://phantomtrace04.vercel.app) · [Backend health](https://phantomtrace-backend-vhxt.onrender.com/api/v1/health) · [Render Blueprint](../render.yaml) · [Local setup](../README.md)

## Verified production release

On 22 November 2026, Render ran the exact GitHub `main` revision `9dfa16a`. In a production browser session, all four agents selected for the fictional case completed with `openai/gpt-oss-120b` and produced 11 findings labeled `AI_INFERENCE`. Risk refresh succeeded. Report generation returned HTTP 201 with all four fresh executions, and the dossier's SHA-256 digest matched an independent calculation. A read-only query to the existing `phantomtrace-db` confirmed that it stored those four executions and the report. [Production verification](../video/PRODUCTION_REPORT.md)

Vercel subsequently deployed the same revision with its project root set to `frontend`. The public homepage and `/dashboard` both returned HTTP 200. The served bundle contained the reserved `billing.example.test` fixture and the production Render API origin. The recorded browser retake used the public application and already-updated Render backend before this frontend deployment switched over. [Frontend](https://phantomtrace04.vercel.app) · [GitHub revision](https://github.com/samir-0-4/Phantom-Trace/commit/9dfa16a380545c87a5a0c240e19753eb5b828b3d)

On 23 November, a browser check on the updated frontend signed in after the Render health endpoint responded. It loaded the same four saved executions, 11 AI assessments, and report with a matching digest. [Production verification](../video/PRODUCTION_REPORT.md)

The first production recording on 21 November captured the retired model's HTTP 404. The 22 November check verified the replacement model on the deployed backend. Recheck the effective model and access for the managed key after any configuration change. A deployment environment override takes precedence over the repository default. Keep API keys and database credentials in the deployment service's secret configuration. [Groq model deprecations](https://console.groq.com/docs/deprecations)

An HTTP 200 from `/api/v1/health` with `dbConnected` confirms that the app can reach its database at that moment. The `groqConfigured` flag identifies a configured integration. Use a clean browser account and the fictional demo fixture to check actual agent completion, displayed finding provenance, and the generated report before treating production AI as verified. [Judge walkthrough](JUDGE_GUIDE.md)

```bash
curl --fail --silent --show-error --max-time 90 \
  https://phantomtrace-backend-vhxt.onrender.com/api/v1/health
```

## Keep judge access available

The rules require free testing and evaluation for judges through **29 January 2027 at 1:00 p.m. Pacific time**, which is **30 January at 2:30 a.m. IST**. On 22 November, Render showed PhantomTrace still using `phantomtrace-db` on the free plan with expiry on **14 December 2026 at 3:02 p.m. IST**, before judging starts. Database continuity remains open. Keep its connection configured only on the Render backend. [Official testing requirement](https://kiroween.devpost.com/rules)

- Render's free PostgreSQL expires after 30 days. Its 14-day grace period allows conversion to a paid compute plan after expiry. If the current database expires during the required period, arrange a durable database plan or migrate to another database, then verify judge access against the new connection before expiry. An uptime check cannot extend the database lifetime. [Render free plan limits](https://render.com/docs/free#free-postgres)
- Render free web services can spin down after 15 minutes without traffic. A cold request can take around a minute. Document that wait in judge instructions and check the workspace's running-hour quota if using a monitor. [Render free web service limits](https://render.com/docs/free#free-web-services)
- The demo uses text evidence and the built-in fictional campaign. If reviewers will upload files that must survive a restart or redeploy, verify persistent storage for the actual deployment. A free Render web service does not support persistent disks. [Render storage limits](https://render.com/docs/free#free-web-services)
- After any change, test registration or the designated judge access route, seeding, graph selection, campaign results, AI completion, and reporting. Keep any required judge credentials in the private Devpost testing field. [Judge walkthrough](JUDGE_GUIDE.md)
