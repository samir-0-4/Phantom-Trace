# PhantomTrace judge guide

PhantomTrace is a browser-based investigation workspace for security analysts and fraud responders. Use the built-in fictional campaign to review evidence provenance, links across investigations, and the saved dossier in about five minutes. [Open PhantomTrace](https://phantomtrace04.vercel.app)

## Test the deployed application

1. Open PhantomTrace and select **Get Started**. On **Create Account**, use a new test account with an invented display name, a unique email address for testing, and a unique password of at least eight characters. After registration, use **Sign In** to reach the dashboard. The backend and database can take a moment to wake after inactivity. If the first request stalls, wait for the health endpoint to respond and retry. [Backend health](https://phantomtrace-backend-vhxt.onrender.com/api/v1/health)
2. Select **Load Demo Campaign** on the dashboard. If your account already has the campaign, open one of its **Apex Campaign** cases. The three fictional cases cover an SMS alert, a spear-phishing email, and a vishing follow-up. The shared `.test` domain and TEST-NET address `198.51.100.42` are reserved demonstration indicators.
3. Open the spear-phishing email case and select **Graph**. Select the email evidence node to inspect its source and verification state. From the SMS case, select **Campaign** to see **Cross-Investigation Campaign Dossiers** and **Shared Campaign Indicators**. The `SYNTHETIC_DEMO_CAMPAIGN` classification marks the exercise.
4. In the SMS case, choose **View Results**, then **Run analysis** or **Refresh analysis**. Read the external AI disclosure and choose **I understand, continue** if you want the fictional evidence sent to the configured provider. Review agent outcomes and any `AI_INFERENCE` findings returned. If analysis is unavailable, continue with the deterministic evidence and campaign views.
5. From the case select **Report**, or use **Audit Report** from the campaign view. Select **Generate report** or **Regenerate report**. The saved dossier displays evidence, interpretations, and availability or verification status. Select **Print / Save PDF** for the browser's print view.

The 22 November production check completed all four agents selected for the fictional case and displayed 11 `AI_INFERENCE` findings. It refreshed the risk assessment and saved a report containing all four new executions. The report's SHA-256 digest matched an independent calculation. Outputs can vary between analysis runs. [Production verification](PHANTOMTRACE_PRODUCTION_STABILITY_REPORT.md)

After the 23 November switch to Neon, the restored SMS case still showed its four saved runs and original dossier. A fresh analysis of the seeded email case completed four agents, returned eight `AI_INFERENCE` findings, and produced a new report with a verified digest. [Deployment notes](DEPLOYMENT_NOTES.md#postgresql-cutover-verification)

## Try evidence intake

From the dashboard choose **New Investigation**, set a title such as `Fictional account notice`, select **Suspicious Communication**, and select **Initialize Case**. Open **Add Evidence**, enter the sample in **Message content**, and submit with **Add evidence**.

```text
Fictional test notice. An account review is pending. The exercise references
https://account-review.internal-demo.test/check and 198.51.100.42.
```

Use fictional evidence throughout the review. Inspect the extracted indicators in PhantomTrace. The case report distinguishes stored evidence and relationships from AI analysis and unavailable information.

## Review the source

- Reproduce the application locally using the prerequisites and configuration in the [repository README](../README.md).
- Review the requirements, design, task list, and implementation example in the [Kiro usage write-up](KIRO_USAGE.md).
- Check deployment readiness and cold-start behavior in the [deployment notes](DEPLOYMENT_NOTES.md).
