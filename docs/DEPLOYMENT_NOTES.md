# PhantomTrace deployment and judge access

The production frontend runs on Vercel. The Spring Boot backend and PostgreSQL database run on Render. The repository includes a Render Blueprint and the application setup instructions. [Frontend](https://phantomtrace04.vercel.app) · [Backend health](https://phantomtrace-backend-vhxt.onrender.com/api/v1/health) · [Render Blueprint](../render.yaml) · [Local setup](../README.md)

## Observed deployment and release candidate

The 21 November 2026 production capture verified registration, sign-in, evidence intake, the synthetic campaign, graph exploration, campaign reconstruction, and report generation. The first Render health check timed out and a later retry succeeded. The AI request reached the deployed application and recorded four upstream HTTP 404 failures on the retired model. A local release candidate subsequently completed four agents against live Groq, persisted nine AI findings, and saved a report. Confirm those results on the live deployment after release. [Production and remediation audit](../video/PRODUCTION_REPORT.md)

Before releasing the candidate, confirm the effective Groq model configuration and access for the managed key. The repository defaults to `openai/gpt-oss-120b`. A deployment environment override takes precedence over the default. Keep API keys and database credentials in the deployment service's secret configuration. [Groq model deprecations](https://console.groq.com/docs/deprecations)

An HTTP 200 from `/api/v1/health` with `dbConnected` confirms that the app can reach its database at that moment. The `groqConfigured` flag identifies a configured integration. Use a clean browser account and the fictional demo fixture to check actual agent completion, displayed finding provenance, and the generated report before treating production AI as verified. [Judge walkthrough](JUDGE_GUIDE.md)

```bash
curl --fail --silent --show-error --max-time 90 \
  https://phantomtrace-backend-vhxt.onrender.com/api/v1/health
```

## Keep judge access available

The rules require free testing and evaluation for judges through **29 January 2027 at 1:00 p.m. Pacific time**, which is **30 January at 2:30 a.m. IST**. On 22 November, Render showed `phantomtrace-db` available on its free plan with expiry on **14 December 2026 at 3:02 p.m. IST**, before judging starts. PhantomTrace uses this database. Keep its connection configured only on the Render backend. [Official testing requirement](https://kiroween.devpost.com/rules)

- Render's free PostgreSQL expires after 30 days. Its 14-day grace period allows conversion to a paid compute plan after expiry. If the current database expires during the required period, arrange a durable database plan or migrate to another database, then verify judge access against the new connection before expiry. An uptime check cannot extend the database lifetime. [Render free plan limits](https://render.com/docs/free#free-postgres)
- Render free web services can spin down after 15 minutes without traffic. A cold request can take around a minute. Document that wait in judge instructions and check the workspace's running-hour quota if using a monitor. [Render free web service limits](https://render.com/docs/free#free-web-services)
- The demo uses text evidence and the built-in fictional campaign. If reviewers will upload files that must survive a restart or redeploy, verify persistent storage for the actual deployment. A free Render web service does not support persistent disks. [Render storage limits](https://render.com/docs/free#free-web-services)
- After any change, test registration or the designated judge access route, seeding, graph selection, campaign results, AI completion, and reporting. Keep any required judge credentials in the private Devpost testing field. [Judge walkthrough](JUDGE_GUIDE.md)
