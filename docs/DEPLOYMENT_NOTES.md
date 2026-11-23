# PhantomTrace deployment and judge access

Vercel hosts the frontend, Render hosts the Spring Boot backend, and Neon hosts the production PostgreSQL database. The backend connects through Render's `DATABASE_URL` secret. [Frontend](https://phantomtrace04.vercel.app) · [Backend health](https://phantomtrace-backend-vhxt.onrender.com/api/v1/health) · [Render Blueprint](../render.yaml) · [Local setup](../README.md)

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

## PostgreSQL cutover verification

On 23 November 2026, the copy to Neon PostgreSQL 18 Free in Oregon was verified before cutover. Checks covered 12 tables and 624 rows, including comparison of the 10 Flyway history entries. Full application-row fingerprints matched the Render source. The Neon branch had no expiry configured. A connection check with the application's pgJDBC 42.7.5 verified the TLS certificate and server hostname. [Production verification](../video/PRODUCTION_REPORT.md)

Render deployment `dep-dc27dqgn74is73897j1g` went live at **10:57:23 p.m. IST on 23 November** with the same application revision, `9dfa16a`. Startup logs confirmed the Neon JDBC target. Repeated comparisons before and after cutover found that both databases matched the 12-table, 624-row baseline, including all 10 Flyway entries. These checks ran without pausing writes. The Render source remained available with unchanged rows. [Production verification](../video/PRODUCTION_REPORT.md)

Two post-cutover Playwright checks passed. The restored account signed in and loaded the original SMS case with four saved runs, 11 AI assessments, and its dossier. A new analysis of the seeded email case completed all four agents, returned eight `AI_INFERENCE` findings from source `AI`, refreshed risk, and saved a new report containing the four new executions. Independent SHA-256 calculations matched both dossiers. [Post-cutover browser results](../video/PRODUCTION_REPORT.md#23-november-database-cutover-check)

For new Blueprint provisioning, supply the external PostgreSQL connection as `DATABASE_URL` in Render. The local Blueprint's `sync: false` setting preserves manual secret configuration on an existing service. Configure the secret and deploy through Render when changing its value. The former Render database is managed separately after the Blueprint change is synced. [Render secret configuration](https://render.com/docs/blueprint-spec#prompting-for-secret-values) · [Render resource retention](https://render.com/docs/infrastructure-as-code#deleting-resources)

## Keep judge access available

The rules require free testing and evaluation for judges through **29 January 2027 at 1:00 p.m. Pacific time**, which is **30 January at 2:30 a.m. IST**. The original Render source `phantomtrace-db` is scheduled to expire on **14 December 2026 at 3:02 p.m. IST**. That date applies to the Render source. [Official testing requirement](https://kiroween.devpost.com/rules) · [Render free plan limits](https://render.com/docs/free#free-postgres)

- Render free web services can spin down after 15 minutes without traffic. A cold request can take around a minute. Neon Free suspends idle compute after five minutes and applies monthly compute and network transfer limits and a storage cap. Check service usage through judging. The backend health endpoint queries PostgreSQL, so frequent monitoring requests can keep the database awake and consume compute allowance. [Render free web service limits](https://render.com/docs/free#free-web-services) · [Neon Free limits](https://neon.com/docs/introduction/plans)
- The demo uses text evidence and the built-in fictional campaign. If reviewers will upload files that must survive a restart or redeploy, verify persistent storage for the actual deployment. A free Render web service does not support persistent disks. [Render storage limits](https://render.com/docs/free#free-web-services)
- After any change, test registration or the designated judge access route, seeding, graph selection, campaign results, AI completion, and reporting. Keep any required judge credentials in the private Devpost testing field. [Judge walkthrough](JUDGE_GUIDE.md)
