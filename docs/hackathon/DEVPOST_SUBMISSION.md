# PhantomTrace Devpost submission draft

Complete bracketed fields after verification. Submit the private testing instructions in Devpost's testing field.

## Project fields

| Field | Entry |
| --- | --- |
| Project name | PhantomTrace |
| Tagline | Trace how separate scam reports connect through shared evidence. |
| Category | Frankenstein |
| Bonus category | `[Select only the applicable bonus categories, or leave blank.]` |
| Functional application | [PhantomTrace](https://phantomtrace04.vercel.app) |
| Public source repository | [PhantomTrace on GitHub](https://github.com/samir-0-4/Phantom-Trace) |
| Public YouTube video | [PhantomTrace Demo Walkthrough](https://youtu.be/Xlnl08geuQg) |
| Built with | Kiro IDE, React, React Flow, Java, Spring Boot, PostgreSQL, Flyway, Groq, jqwik |

## Project description

Fraud responders often receive the pieces of a single scam as separate reports. PhantomTrace gives analysts a place to file those reports, inspect the evidence behind each indicator, and see where investigations share infrastructure. It preserves the path from a graph node to its source evidence, shows the shared indicators in a campaign, and saves a print-ready case dossier.

For Frankenstein, we combined three ways of working with evidence. Deterministic parsing identifies what appears in submitted material. Optional AI analysis adds hypotheses after the analyst reviews a disclosure and consents. Graph correlation connects overlapping indicators across cases and preserves their provenance. Evidence, inferences, and unknowns retain distinct labels throughout the workflow.

The built-in Apex exercise starts with three fictional reports across SMS, email, and a vishing follow-up. It uses reserved indicators so judges can inspect shared infrastructure without mistaking the exercise for a real threat report.

## How we used Kiro

We used Kiro IDE to organize the project around requirements, design, and tasks. For the evidence graph, the requirements limited the graph to authenticated backend records, the design mapped those records into React Flow, and the tasks separated API integration, visual rendering, provenance inspection, and verification. That gave us a clear boundary to test when working on the graph UI. In the live demo, selecting the fictional email node shows its source evidence and verification state. The project steering files document that provenance rule and the difference between verified evidence, AI inference, and unknowns. [Evidence graph spec](https://github.com/samir-0-4/Phantom-Trace/tree/main/.kiro/specs/evidence-relationship-graph) · [Graph tests](https://github.com/samir-0-4/Phantom-Trace/blob/main/frontend/tests/EvidenceGraphPage.test.jsx)

The trusted IDE registered seven hook definitions, including Java tests on save and frontend linting on save. A separate check of the backend save hook stopped before the edit, so the evidence establishes registration. The Test Writer and Threat Analyst profiles are in the workspace, and PostgreSQL and GitHub MCP servers are configured for development. Their execution or use was outside the verified walkthrough. Four jqwik suites exercise extraction, reserved-indicator classification, sanitization, and risk bounds. [Detailed Kiro write-up](https://github.com/samir-0-4/Phantom-Trace/blob/main/docs/KIRO_USAGE.md)

## Private testing instructions

1. Open [PhantomTrace](https://phantomtrace04.vercel.app) in a browser. Select **Get Started**, create a separate test account, and sign in. Use an invented display name and a unique test email and password. No shared credentials are needed for self-registration.
2. On the dashboard, select **Load Demo Campaign**. Open the **Apex Campaign** email case and select **Graph**. Click the email evidence node to see its source. Open the SMS case and select **Campaign** to inspect the related cases and shared reserved indicators.
3. From the SMS case choose **View Results**, then **Run analysis**. Consent only for the fictional fixture if you want to try the external analysis. If it is unavailable, you can still choose **Report** and **Generate report**. Use **Print / Save PDF** to view the print layout.
4. If the backend or database is waking, wait for the health endpoint to respond, then retry. The judge guide includes a fictional evidence intake example. [Backend health](https://phantomtrace-backend-vhxt.onrender.com/api/v1/health) · [Judge guide](https://github.com/samir-0-4/Phantom-Trace/blob/main/docs/JUDGE_GUIDE.md)

## Before entering the draft

Production switched to Neon on 23 November. The post-cutover browser checks verified access to a restored synthetic case and its original dossier. They also verified fresh AI analysis, risk refresh, and report generation on a seeded email case. The 14 December expiry applies to the former Render database. GitHub recognizes Apache-2.0 on public `main`. Add the public video link after approval and publication. [Production verification](../PHANTOMTRACE_PRODUCTION_STABILITY_REPORT.md) · [Rules checklist](rules-verification.md)
