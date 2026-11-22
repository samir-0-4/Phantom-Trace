#!/usr/bin/env node

// Run with Node and Playwright 1.65 or newer. All clips come from one live browser session.
'use strict';

const { randomBytes } = require('node:crypto');
const { constants } = require('node:fs');
const { mkdir, mkdtemp, open, realpath, stat, writeFile } = require('node:fs/promises');
const { tmpdir } = require('node:os');
const { dirname, isAbsolute, join, relative, resolve, sep } = require('node:path');
const { setTimeout: hold } = require('node:timers/promises');

const FRONTEND = 'https://phantomtrace04.vercel.app';
const BACKEND = 'https://phantomtrace-backend-vhxt.onrender.com';
const VIEWPORT = { width: 1920, height: 1080 };
const DEMO_ANALYST = 'Kiroween Demo Analyst';
const MANUAL_CASE = 'Synthetic intake exercise';
const SAFE_MESSAGE = 'Synthetic exercise only. Reference https://intake-demo.example.test/review and 192.0.2.24.';
const SMS_CASE = /Apex Campaign.*SMS Banking Alert/;
const EMAIL_CASE = /Apex Campaign.*Spear-Phishing Email/;
const CASE_RESOURCE = /^\/api\/v1\/investigations\/[^/]+/;
const ANALYSIS_ENDPOINT = /^\/api\/v1\/evidence\/[^/]+\/analysis$/;

class CaptureError extends Error {}

function requireOutcome(condition, message) {
  if (!condition) throw new CaptureError(message);
}

function describeError(error) {
  if (error instanceof CaptureError) return error.message;
  if (error?.name === 'TimeoutError') return 'Expected production response or screen did not appear before timeout.';
  return 'Browser or recorder operation failed. Sensitive browser call logs are omitted.';
}

function accountFixture() {
  return {
    email: `kiroween-${randomBytes(8).toString('hex')}@recording.test`,
    password: randomBytes(24).toString('base64url'),
  };
}

async function prepareAccount(fileOption) {
  if (!fileOption) return { credentials: accountFixture() };

  const destination = resolve(fileOption);
  const parent = await realpath(dirname(destination));
  const project = await realpath(resolve(__dirname, '../..'));
  const relativeToProject = relative(project, parent);
  requireOutcome(relativeToProject === '..' || relativeToProject.startsWith(`..${sep}`) || isAbsolute(relativeToProject),
    'Keep the optional account file outside the project.');

  try {
    const handle = await open(destination, constants.O_RDONLY | constants.O_NOFOLLOW);
    try {
      const info = await handle.stat();
      requireOutcome(info.isFile() && (info.mode & 0o777) === 0o600 && info.size < 1024,
        'The optional account file must be a regular file with mode 0600.');
      const credentials = JSON.parse(await handle.readFile('utf8'));
      requireOutcome(/^kiroween-[0-9a-f]{16}@recording\.test$/.test(credentials.email)
        && /^[A-Za-z0-9_-]{32}$/.test(credentials.password),
      'The account file must contain a dedicated recording fixture from this script.');
      return { credentials, reused: true };
    } finally {
      await handle.close();
    }
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  return { credentials: accountFixture(), destination };
}

async function observeClick(page, locator, method, path) {
  const matchingResponse = page.waitForResponse((response) => {
    const url = new URL(response.url());
    const pathMatches = typeof path === 'string' ? url.pathname === path : path.test(url.pathname);
    return url.origin === BACKEND && response.request().method() === method && pathMatches;
  }, { timeout: 42_000 });
  const [response] = await Promise.all([matchingResponse, locator.click()]);
  return response;
}

async function clickAndCheck(page, locator, path, expectedStatus, action) {
  const response = await observeClick(page, locator, 'POST', path);
  requireOutcome(response.status() === expectedStatus, `${action} returned HTTP ${response.status()}.`);
  return response;
}

async function show(locator) {
  await locator.evaluate((element) => {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
  await hold(600);
}

async function preflight(context, page, checks) {
  console.log('Checking production backend health');
  let health = await context.request.get(`${BACKEND}/actuator/health`, { timeout: 35_000 });
  if ([502, 503, 504].includes(health.status())) {
    console.log(`Production health returned HTTP ${health.status()}. Retrying after the service has time to start.`);
    await hold(3_000);
    health = await context.request.get(`${BACKEND}/api/v1/health`, { timeout: 45_000 });
  }
  checks.backendHttp = health.status();
  requireOutcome(health.ok(), `Production backend health returned HTTP ${health.status()}.`);
  const metadata = await health.json();
  checks.databaseConnected = metadata.dbConnected === true;
  checks.aiProviderConfigured = metadata.groqConfigured === true;
  requireOutcome(checks.databaseConnected, 'Production health did not report a database connection.');

  console.log('Checking production frontend rendering');
  const homepage = await page.goto(FRONTEND, { waitUntil: 'domcontentloaded', timeout: 45_000 });
  checks.frontendHttp = homepage?.status();
  requireOutcome(homepage?.ok(), 'Production frontend did not return a successful HTTP response.');
  await page.getByRole('heading', { name: /^Phantom\s*Trace$/ }).waitFor();
  await page.evaluate(() => document.fonts.ready);
}

function createCapture(page, output, manifest) {
  return async (name, actions) => {
    const file = `${name}.webm`;
    const scene = { file, status: 'started' };
    manifest.scenes.push(scene);
    console.log(`Capturing ${name}`);
    try {
      await page.screencast.start({ path: join(output, file), size: VIEWPORT, quality: 92, fps: 30 });
      try {
        await page.screencast.showActions({ cursor: 'pointer', duration: 500, style: { title: 'display: none' } });
        await actions();
        scene.status = 'complete';
      } finally {
        await page.screencast.hideActions().catch(() => {});
        await page.screencast.stop();
      }
    } catch (error) {
      scene.status = 'partial';
      scene.issue = describeError(error);
      throw error;
    } finally {
      scene.bytes = (await stat(join(output, file)).catch(() => null))?.size || 0;
      await saveManifest(output, manifest);
    }
  };
}

async function saveManifest(output, manifest) {
  await writeFile(join(output, 'capture-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, { mode: 0o600 });
}

async function authenticate(page, capture, account, checks) {
  await capture('00-landing-registration', async () => {
    await hold(5_200);
    await page.getByRole('button', { name: 'Get Started', exact: true }).click();
    await page.getByRole('heading', { name: 'Create Account', exact: true }).waitFor();
    await hold(4_100);
  });

  // Keep both credentials and native password form interaction outside the recorded intervals.
  if (account.reused) {
    checks.registration = 'reused recording fixture';
    await page.getByRole('link', { name: /Sign In/ }).click();
  } else {
    await page.getByLabel(/^Full name/).fill(DEMO_ANALYST);
    await page.getByLabel(/^Email address/).fill(account.credentials.email);
    await page.getByLabel(/^Password/).fill(account.credentials.password);
    const registration = await clickAndCheck(page, page.getByRole('button', { name: 'Create Account', exact: true }),
      '/api/v1/auth/register', 201, 'Registration');
    checks.registrationHttp = registration.status();
    if (account.destination) {
      await writeFile(account.destination, JSON.stringify(account.credentials), { flag: 'wx', mode: 0o600 });
    }
    await page.waitForURL(/\/login\?registered=1$/);
  }

  await page.getByRole('heading', { name: 'Sign In', exact: true }).waitFor();
  await capture('01-sign-in', async () => {
    await hold(900);
    await page.getByRole('button', { name: 'Sign In', exact: true }).hover();
    await hold(3_400);
  });
  await signIn(page, account, checks);
}

async function signIn(page, account, checks) {
  await page.getByLabel(/^Email address/).fill(account.credentials.email);
  await page.getByLabel(/^Password/).fill(account.credentials.password);
  const login = await clickAndCheck(page, page.getByRole('button', { name: 'Sign In', exact: true }),
    '/api/v1/auth/login', 200, 'Login');
  checks.loginHttp = login.status();
  await page.waitForURL('**/dashboard');
  await page.getByRole('heading', { name: /Welcome back, Kiroween/ }).waitFor();
}

async function recordManualIntake(page, capture, checks) {
  await capture('02-investigation', async () => {
    await hold(3_700);
    await page.getByRole('button', { name: 'New Investigation', exact: true }).click();
    await page.getByRole('heading', { name: 'New Investigation', exact: true }).waitFor();
    await hold(1_400);
    await page.getByLabel(/^Investigation title/).fill(MANUAL_CASE);
    await page.getByLabel(/^Category/).selectOption('SUSPICIOUS_COMMUNICATION');
    await page.getByLabel(/^Description & context/).fill('A fictional intake exercise using reserved indicators.');
    await hold(2_000);
    const response = await clickAndCheck(page, page.getByRole('button', { name: 'Initialize Case' }),
      '/api/v1/investigations', 201, 'Create investigation');
    checks.investigationHttp = response.status();
    await page.getByRole('heading', { name: MANUAL_CASE, exact: true }).waitFor();
    await hold(4_000);
  });

  await capture('03-evidence-intake', async () => {
    await page.getByRole('button', { name: 'Add Evidence', exact: true }).click();
    await page.getByRole('heading', { name: 'Evidence workspace' }).waitFor();
    await hold(1_500);
    await page.getByLabel(/^Message content/).fill(SAFE_MESSAGE);
    await page.getByLabel(/^Description \(optional\)/).fill('Fictional text fixture with a reserved domain and IP address.');
    await hold(3_000);
    const response = await clickAndCheck(page, page.getByRole('button', { name: 'Add evidence', exact: true }),
      new RegExp(`${CASE_RESOURCE.source}/evidence$`), 201, 'Submit synthetic evidence');
    checks.evidenceHttp = response.status();
    await page.getByText('Evidence submitted (1)', { exact: true }).waitFor();
    await page.getByText(SAFE_MESSAGE, { exact: true }).waitFor();
    await hold(5_200);
  });
}

async function recordCampaignSeed(page, capture, checks) {
  await page.getByRole('link', { name: 'Dashboard', exact: true }).click();
  await page.getByRole('heading', { name: /Welcome back, Kiroween/ }).waitFor();
  const caseLink = page.getByRole('link', { name: SMS_CASE });
  let caseUrl;

  await capture('04-load-synthetic-campaign', async () => {
    await hold(1_900);
    if (!await caseLink.isVisible()) {
      const response = await clickAndCheck(page, page.getByRole('button', { name: 'Load Demo Campaign' }),
        '/api/v1/demo/seed', 200, 'Load synthetic campaign');
      const seeded = (await response.json()).data;
      requireOutcome(Array.isArray(seeded) && seeded.length === 3 && seeded.every((item) => item.syntheticDemo === true),
        'The seed response did not confirm three synthetic investigations.');
      checks.seedHttp = response.status();
      checks.seededCases = seeded.length;
    } else {
      checks.seed = 'existing synthetic fixture';
    }
    await caseLink.waitFor();
    await page.getByRole('link', { name: /Apex Campaign.*Spear-Phishing Email/ }).waitFor();
    await page.getByRole('link', { name: /Apex Campaign.*Vishing Follow-up/ }).waitFor();
    await show(caseLink);
    await hold(5_000);
    const selectedCase = await observeClick(page, caseLink, 'GET', new RegExp(`${CASE_RESOURCE.source}$`));
    requireOutcome(selectedCase.ok() && (await selectedCase.json()).data?.syntheticDemo === true,
      'The selected case did not confirm its synthetic classification.');
    checks.selectedCaseSynthetic = true;
    await page.getByRole('heading', { name: SMS_CASE }).waitFor();
    caseUrl = page.url();
    requireOutcome(new URL(caseUrl).origin === FRONTEND, 'Unexpected investigation origin.');
    await hold(4_200);
  });

  return caseUrl;
}

async function recordAnalysis(page, capture, checks) {
  await capture('05-ai-analysis', async () => {
    await page.getByRole('button', { name: 'View Results', exact: true }).click();
    const run = page.getByRole('button', { name: /^(Run|Refresh) analysis$/ });
    await run.waitFor();
    await hold(2_200);
    await run.click();
    await page.getByRole('dialog', { name: 'External AI Analysis Disclosure' }).waitFor();
    await hold(5_000);
    const response = await clickAndCheck(page, page.getByRole('button', { name: 'I understand, continue' }),
      ANALYSIS_ENDPOINT, 200, 'Run AI analysis');
    checks.analysisHttp = response.status();
    const agents = (await response.json()).data;
    requireOutcome(Array.isArray(agents) && agents.length > 0, 'No agent outcome was returned.');
    checks.ai = {
      completed: agents.filter((agent) => agent.status === 'COMPLETED').length,
      attempted: agents.length,
      findings: agents.reduce((count, agent) => count + (agent.result?.findings?.length || 0), 0),
    };
    await run.waitFor({ timeout: 45_000 });
    await hold(4_000);
    const findings = page.getByText(/^Findings \(\d+\)$/).last();
    await show(findings);
    await hold(6_000);
  });
}

async function recordEvidenceGraph(page, capture, checks) {
  await capture('06-evidence-graph', async () => {
    const response = await observeClick(page, page.getByRole('button', { name: 'Graph', exact: true }),
      'GET', new RegExp(`${CASE_RESOURCE.source}/graph$`));
    requireOutcome(response.ok(), `Evidence graph returned HTTP ${response.status()}.`);
    const graph = (await response.json()).data;
    checks.graph = { nodes: graph.nodes.length, relationships: graph.edges.length };
    requireOutcome(checks.graph.relationships > 0, 'The synthetic investigation graph did not contain relationships.');
    const canvas = page.getByTestId('relationship-graph');
    await canvas.waitFor();
    await hold(4_000);
    const entity = graph.nodes.find((node) => node.type === 'DOMAIN')
      || graph.nodes.find((node) => node.type !== 'INVESTIGATION');
    requireOutcome(entity, 'The graph did not contain a selectable evidence entity.');
    await canvas.getByTestId(`graph-node-${entity.id}`).click();
    await page.getByText('Entity value', { exact: true }).waitFor();
    checks.graph.detailInspected = true;
    await hold(8_000);
  });
}

async function resumeGraph(page, capture, account, checks) {
  requireOutcome(account.reused, 'Graph recovery requires the same existing recording fixture account.');
  await page.goto(`${FRONTEND}/login`, { waitUntil: 'domcontentloaded' });
  await signIn(page, account, checks);
  const caseLink = page.getByRole('link', { name: EMAIL_CASE });
  const response = await observeClick(page, caseLink, 'GET', new RegExp(`${CASE_RESOURCE.source}$`));
  requireOutcome(response.ok() && (await response.json()).data?.syntheticDemo === true,
    'The email case did not confirm its synthetic classification.');
  await page.getByRole('heading', { name: EMAIL_CASE }).waitFor();
  checks.graphCase = 'Synthetic Apex spear-phishing email investigation';
  await recordEvidenceGraph(page, capture, checks);
}

async function recordReconstruction(page, capture, checks) {
  await capture('07-campaign-reconstruction', async () => {
    const campaignLink = page.getByRole('link', { name: 'Campaign Signals', exact: true });
    const control = await campaignLink.isVisible() ? campaignLink : page.getByRole('button', { name: 'Campaign', exact: true });
    const response = await observeClick(page, control, 'GET', new RegExp(`${CASE_RESOURCE.source}/campaign$`));
    requireOutcome(response.ok(), `Campaign reconstruction returned HTTP ${response.status()}.`);
    const campaign = (await response.json()).data;
    checks.campaign = {
      classification: campaign.campaignClassification,
      relatedCases: campaign.connectedInvestigations.length,
      sharedIndicators: campaign.sharedIndicators.length,
    };
    requireOutcome(campaign.campaignClassification === 'SYNTHETIC_DEMO_CAMPAIGN' && checks.campaign.relatedCases >= 2,
      'The campaign response did not identify the expected synthetic case relationships.');
    await page.getByRole('heading', { name: 'Scam Campaign Footprint Reconstruction' }).waitFor();
    await hold(4_900);
    await show(page.getByRole('heading', { name: /Cross-Investigation Campaign Dossiers/ }));
    await hold(4_200);
    await show(page.getByRole('heading', { name: /Shared Campaign Indicators/ }));
    await hold(6_000);
  });
}

async function recordReport(page, capture, checks) {
  await capture('08-report-generation', async () => {
    const auditReport = page.getByRole('button', { name: 'Audit Report', exact: true });
    if (await auditReport.isVisible()) {
      await auditReport.click();
    } else {
      await page.getByRole('button', { name: 'Report', exact: true }).click();
    }
    await page.getByRole('heading', { name: 'Investigation report', exact: true }).waitFor();
    await hold(2_800);
    const response = await clickAndCheck(page, page.getByRole('button', { name: /^(re)?generate report$/i }).first(),
      new RegExp(`${CASE_RESOURCE.source}/reports$`), 201, 'Generate report');
    checks.reportHttp = response.status();
    await page.getByText('PhantomTrace Digital Forensics Dossier', { exact: true }).waitFor();
    await hold(5_000);
    await show(page.getByText('INTEGRITY DIGEST:', { exact: true }));
    checks.reportSha256Visible = await page.getByText(/^SHA256:[a-f0-9]{64}$/).isVisible();
    requireOutcome(checks.reportSha256Visible, 'The generated report did not show a SHA-256 digest.');
    await hold(6_000);
  });
}

async function main() {
  if (!process.argv.includes('--capture-production')) {
    console.log('Usage: node phantomtrace-demo.spec.js --capture-production [--resume-graph]');
    return;
  }

  // Playwright call logging can include arguments supplied to form fields.
  delete process.env.DEBUG;
  delete process.env.PWDEBUG;
  const { chromium } = require(process.env.PHANTOMTRACE_PLAYWRIGHT || 'playwright');
  const account = await prepareAccount(process.env.PHANTOMTRACE_DEMO_ACCOUNT_FILE);
  const output = process.env.PHANTOMTRACE_DEMO_OUTPUT
    ? resolve(process.env.PHANTOMTRACE_DEMO_OUTPUT)
    : await mkdtemp(join(tmpdir(), 'phantomtrace-capture-'));
  if (process.env.PHANTOMTRACE_DEMO_OUTPUT) await mkdir(output, { mode: 0o700 });

  const manifest = {
    capturedAt: new Date().toISOString(),
    frontend: FRONTEND,
    backend: BACKEND,
    source: 'Actual Chromium viewport recorded by Playwright screencast',
    viewport: VIEWPORT,
    credentialsEnteredOffCamera: true,
    scenes: [],
    checks: {},
    issues: [],
  };
  await saveManifest(output, manifest);
  console.log(`Capture directory ${output}`);

  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: VIEWPORT });
    const page = await context.newPage();
    requireOutcome(page.screencast, 'This Playwright version lacks the per-scene screencast API.');
    page.setDefaultTimeout(20_000);
    await preflight(context, page, manifest.checks);
    const capture = createCapture(page, output, manifest);
    if (process.argv.includes('--resume-graph')) {
      await resumeGraph(page, capture, account, manifest.checks);
      return;
    }
    await authenticate(page, capture, account, manifest.checks);

    const attempt = async (label, work) => {
      try {
        await work();
      } catch (error) {
        const message = `${label}. ${describeError(error)}`;
        manifest.issues.push(message);
        console.error(message);
      }
    };

    await attempt('Manual intake', () => recordManualIntake(page, capture, manifest.checks));
    const caseUrl = await recordCampaignSeed(page, capture, manifest.checks);
    await attempt('AI analysis', () => recordAnalysis(page, capture, manifest.checks));
    await page.goto(caseUrl, { waitUntil: 'domcontentloaded' });
    await attempt('Evidence graph', () => recordEvidenceGraph(page, capture, manifest.checks));
    if (!page.url().endsWith('/graph')) await page.goto(caseUrl, { waitUntil: 'domcontentloaded' });
    await attempt('Campaign reconstruction', () => recordReconstruction(page, capture, manifest.checks));
    if (!page.url().endsWith('/campaign')) await page.goto(caseUrl, { waitUntil: 'domcontentloaded' });
    await attempt('Report generation', () => recordReport(page, capture, manifest.checks));
  } catch (error) {
    const message = describeError(error);
    manifest.issues.push(message);
    console.error(message);
  } finally {
    await browser?.close().catch(() => {});
    await saveManifest(output, manifest);
  }

  if (manifest.issues.length) process.exitCode = 1;
  console.log(`Saved capture manifest ${join(output, 'capture-manifest.json')}`);
}

main().catch((error) => {
  console.error(describeError(error));
  process.exitCode = 1;
});
