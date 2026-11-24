import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Info,
  Link2,
  Mail,
  Play,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/ui/EmptyState';
import { FullPageSpinner } from '../components/ui/Spinner';
import { getApiErrorMessage } from '../services/api/apiClient';
import evidenceService from '../services/evidence/evidenceService';
import { investigationService } from '../services/investigation/investigationService';
import { formatDate, formatDateTime, titleCase } from '../utils/format';

const riskStyles = {
  LOW: 'text-risk-low',
  MODERATE: 'text-risk-medium',
  MEDIUM: 'text-risk-medium',
  HIGH: 'text-risk-high',
  CRITICAL: 'text-risk-critical',
  INCONCLUSIVE: 'text-text-secondary',
};

const evidenceIcon = {
  TEXT_MESSAGE: FileText,
  EMAIL: Mail,
  URL: Link2,
};

const safeJson = (value) => {
  if (!value) return null;
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    return null;
  }
};

const verificationLabels = {
  VERIFIED: 'Verified',
  EXTERNAL: 'Verified by external source',
  EXTERNAL_VERIFIED: 'Verified by external source',
  EXTERNALLY_VERIFIED: 'Verified by external source',
  VERIFIED_BY_EXTERNAL_SOURCE: 'Verified by external source',
  EXTRACTED: 'Extracted from submitted evidence',
  DIRECTLY_EXTRACTED: 'Extracted from submitted evidence',
  AI: 'AI assessment',
  AI_ASSESSMENT: 'AI assessment',
  AI_INFERENCE: 'AI assessment',
  AI_SUGGESTED: 'AI assessment',
  NOT_VERIFIED: 'Unverified',
  NOT_EXTERNALLY_VERIFIED: 'Unverified',
  UNVERIFIED: 'Unverified',
};

const findingVerification = (finding) => {
  const status = String(finding?.verificationStatus ?? '').trim().toUpperCase().replace(/[\s-]+/g, '_');
  return verificationLabels[status] ?? 'Unknown';
};

const FindingCard = ({ finding }) => {
  const verification = findingVerification(finding);
  const provenance = verification === 'AI assessment'
    ? 'AI_INFERENCE'
    : verification.startsWith('Verified') || verification.startsWith('Extracted') ? 'VERIFIED' : 'UNKNOWN';

  return (
    <article className="min-w-0 space-y-3 rounded-lg border border-cyber-border bg-cyber-subtle p-4">
      <div className="flex flex-wrap items-start justify-between gap-2.5">
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-base font-semibold text-text-primary">{finding.title}</h3>
          <p className="mt-1 break-words text-sm leading-relaxed text-text-secondary">{finding.description}</p>
        </div>
        <Badge status={finding.severity}>{titleCase(finding.severity)}</Badge>
      </div>

      <dl className="grid gap-x-4 gap-y-2.5 rounded-md border border-cyber-border bg-cyber-canvas p-3 sm:grid-cols-2">
        <div>
          <dt className="section-label">Verification</dt>
          <dd className="mt-1"><Badge status={provenance}>{verification}</Badge></dd>
        </div>
        <div>
          <dt className="section-label">Confidence</dt>
          <dd className="mt-1 font-mono text-xs text-text-primary">{finding.confidence == null ? 'Not reported' : `${Math.round(finding.confidence * 100)}%`}</dd>
        </div>
        <div className="min-w-0">
          <dt className="section-label">Evidence ref</dt>
          <dd className="mt-1 break-all font-mono text-xs leading-relaxed text-text-primary">{finding.evidenceReference || 'Unknown'}</dd>
        </div>
        <div className="min-w-0">
          <dt className="section-label">Source engine</dt>
          <dd className="mt-1 break-words font-mono text-xs leading-relaxed text-text-primary">{finding.sourceType || 'Unknown'}</dd>
        </div>
      </dl>

      {finding.explanation && <p className="break-words text-sm leading-relaxed text-text-secondary">{finding.explanation}</p>}
      {finding.recommendedAction && (
        <p className="break-words border-l-2 border-cyan-primary pl-2.5 text-sm leading-relaxed text-text-primary">
          <span className="font-semibold">Recommended action:</span>{' '}
          {finding.recommendedAction}
        </p>
      )}
    </article>
  );
};

const ProviderResults = ({ results }) => (
  <div className="space-y-3">
    {results.length === 0 ? (
      <p className="text-sm text-text-secondary">No external lookups have been recorded.</p>
    ) : (
      results.map((result) => (
        <div
          key={result.id}
          className="space-y-2 rounded-md border border-cyber-border bg-cyber-subtle p-3"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-medium text-text-primary">
              {result.provider}
            </span>
            <div className="flex items-center gap-1.5">
              <Badge status={result.threatStatus}>{titleCase(result.threatStatus)}</Badge>
              {(result.providerReference === 'SYNTHETIC_TEST_INDICATOR' ||
                result.resultDetails?.includes('SYNTHETIC_TEST_INDICATOR')) && (
                <Badge variant="SYNTHETIC_TEST_INDICATOR">Synthetic Test Indicator</Badge>
              )}
            </div>
          </div>
          <p className="break-all font-mono text-xs text-text-primary">{result.indicator}</p>
          <p className="break-words text-xs leading-relaxed text-text-secondary">
            {result.errorMessage ||
              result.resultDetails ||
              'No additional provider details reported.'}
          </p>
          <p className="break-all font-mono text-xs text-text-muted">
            {formatDateTime(result.lookupTimestamp)}
            {result.providerReference ? ` · Ref: ${result.providerReference}` : ''}
          </p>
        </div>
      ))
    )}
  </div>
);

export const AnalysisResultsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [showConsentModal, setShowConsentModal] = useState(false);

  const load = useCallback(async () => {
    const investigation = await investigationService.getById(id);
    const evidence = await evidenceService.list(id);
    const risk = await investigationService.getRiskAssessment(id).catch(() => null);
    const graph = await investigationService.getGraph(id).catch(() => null);
    const details = await Promise.all(
      evidence.map(async (item) => {
        const [indicators, threats, analysis] = await Promise.all([
          evidenceService.listIndicators(item.id).catch(() => []),
          evidenceService.listThreatLookups(item.id).catch(() => []),
          evidenceService.listAnalysis(item.id).catch(() => []),
        ]);
        return { item, indicators, threats, analysis };
      })
    );
    setData({ investigation, evidence, risk, graph, details });
  }, [id]);

  useEffect(() => {
    load()
      .catch((err) =>
        setError(getApiErrorMessage(err, 'Could not load investigation results.'))
      )
      .finally(() => setLoading(false));
  }, [load]);

  const runAnalysis = async () => {
    setProcessing(true);
    setError('');
    try {
      const items = data?.evidence || [];
      await Promise.all(items.map((item) => evidenceService.analyze(item.id)));
      await Promise.all(
        items
          .filter((item) => item.evidenceType === 'URL' || item.url)
          .map((item) => evidenceService.lookupThreats(item.id).catch(() => []))
      );
      await investigationService.assessRisk(id);
      await load();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'Analysis could not be completed. Existing results remain available.'
        )
      );
    } finally {
      setProcessing(false);
    }
  };

  const findings = useMemo(
    () =>
      (data?.details || []).flatMap(({ analysis }) =>
        analysis.flatMap((execution) => {
          const output = safeJson(execution.outputJson);
          return (output?.findings || []).map((finding) => ({
            ...finding,
            agentName: execution.agentName,
          }));
        })
      ),
    [data]
  );

  const summary = useMemo(() => {
    const outputs = (data?.details || [])
      .flatMap(({ analysis }) => analysis)
      .map((execution) => safeJson(execution.outputJson))
      .filter(Boolean);

    // Prefer dedicated investigation report summary if present
    const reportSummary = outputs.find(
      (output) => output?.agentName === 'INVESTIGATION_REPORT' && output.summary
    )?.summary;
    if (reportSummary) return { text: reportSummary, source: 'AI assessment' };

    // Fallback to any detective agent structured summary (Text, URL, Email, File)
    const agentSummary = outputs.find((output) => output?.summary)?.summary;
    if (agentSummary) return { text: agentSummary, source: 'AI assessment' };

    // Fallback to heuristic risk assessment explanation
    return data?.risk?.explanation ? { text: data.risk.explanation, source: 'Heuristic assessment' } : null;
  }, [data]);

  const actions = useMemo(() => {
    const text = findings
      .map((item) => `${item.title} ${item.description}`)
      .join(' ')
      .toLowerCase();
    const result = [];
    if (text.includes('payment') || text.includes('fee') || text.includes('money')) {
      result.push(
        'Do not pay an upfront registration fee before independently verifying the organization.'
      );
      result.push(
        'If financial fraud occurred in India, contact your bank and official cybercrime reporting channels, including 1930 where applicable.'
      );
    }
    if (text.includes('otp') || text.includes('password') || text.includes('credential')) {
      result.push('Never share OTPs, passwords, passcodes, or login credentials.');
    }
    if (text.includes('impersonat') || text.includes('support') || text.includes('bank')) {
      result.push(
        'Contact the organization using contact details from its official website, not the message.'
      );
    }
    if ((data?.evidence || []).some((item) => ['IMAGE', 'PDF'].includes(item.evidenceType))) {
      result.push(
        'Avoid opening suspicious attachments until their source is independently verified.'
      );
    }
    return result;
  }, [findings, data]);

  if (loading) return <FullPageSpinner label="Loading investigation results…" />;
  if (!data) {
    return (
      <div
        role="alert"
        className="rounded-lg border border-risk-critical/35 bg-risk-critical/10 p-4 text-sm text-text-primary"
      >
        {error}
      </div>
    );
  }

  const { investigation, evidence, risk, details } = data;
  const category = risk?.category || 'INCONCLUSIVE';
  const executions = details.flatMap((item) => item.analysis);
  const failed = executions.filter((item) => item.executionStatus === 'FAILED');
  const hasResults = executions.length > 0 || Boolean(risk);

  return (
    <div className="mx-auto min-w-0 max-w-7xl space-y-4">
      <header className="flex min-w-0 flex-col gap-4 pb-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            to={`/investigations/${id}`}
            className="text-link mb-2 inline-flex items-center gap-1.5 text-sm"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to investigation
          </Link>
          <h1 className="page-heading">
            {investigation.title}
          </h1>
          <p className="page-lede mt-1">
            Investigation results · created {formatDate(investigation.createdAt)}
          </p>
        </div>
        <Button
          onClick={() => setShowConsentModal(true)}
          loading={processing}
          disabled={evidence.length === 0}
          className="w-fit shrink-0"
        >
          <Play className="h-4 w-4" />{' '}
          {processing ? 'Processing analysis' : hasResults ? 'Refresh analysis' : 'Run analysis'}
        </Button>
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-lg border border-risk-critical/35 bg-risk-critical/10 p-4 text-sm text-text-primary"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-risk-critical" />
          <span>{error}</span>
        </div>
      )}
      {processing && (
        <div
          className="flex items-center gap-3 rounded-lg border border-cyan-primary/35 bg-cyan-primary/10 p-4 text-sm text-text-primary"
          role="status"
        >
          <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-cyan-primary" />
          <span>Analysis is processing. No progress estimate is shown because the backend does not provide one.</span>
        </div>
      )}

      <section className="workstation-panel overflow-hidden" aria-label="Investigation overview">
        <dl className="grid grid-cols-2 gap-px bg-cyber-border sm:grid-cols-4 xl:grid-cols-[1.3fr_repeat(4,minmax(0,1fr))]">
          <div className="col-span-2 bg-cyber-surface px-4 py-3.5 sm:col-span-4 xl:col-span-1">
            <dt className="section-label">Risk assessment</dt>
            <dd className={`mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-1 ${riskStyles[category] || riskStyles.INCONCLUSIVE}`}>
              <span className="font-mono text-2xl font-semibold tabular-nums">{risk ? `${risk.score}/100` : '—'}</span>
              <span className="text-xs font-medium">{titleCase(category)}</span>
            </dd>
          </div>
          {[
            ['Status', titleCase(investigation.status)],
            ['Confidence', risk ? `${Math.round(risk.confidence * 100)}%` : '—'],
            ['Evidence', evidence.length],
            ['Findings', findings.length],
          ].map(([label, value]) => (
            <div key={label} className="min-w-0 bg-cyber-surface px-4 py-3.5">
              <dt className="section-label">{label}</dt>
              <dd className="mt-1 break-words font-mono text-lg font-semibold tabular-nums text-text-primary">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      {risk && (
        <Card
          title="Overall assessment"
          subtitle="Transparent heuristic assessment, not a mathematically proven probability of fraud."
        >
          <p className="break-words text-sm leading-relaxed text-text-primary">{risk.explanation}</p>
          {risk.missingInformation && (
            <p className="mt-3 flex items-start gap-2.5 rounded-md border border-epistemic-unknown/35 bg-cyber-subtle p-3 text-sm leading-relaxed text-text-primary">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-epistemic-unknown" /> Unknown: {risk.missingInformation}
            </p>
          )}
          {risk.contributingSignals?.length > 0 && (
            <div className="mt-5 space-y-2.5">
              <p className="section-label">
                Contributing Signals
              </p>
              {risk.contributingSignals.map((signal) => (
                <div
                  key={signal.id}
                  className="space-y-1.5 rounded-md border border-cyber-border bg-cyber-subtle p-3"
                >
                  <div className="flex items-start justify-between gap-3 text-sm">
                    <span className="break-words font-medium text-text-primary">{signal.signal}</span>
                    <span className="shrink-0 font-mono font-semibold text-cyan-primary">+{signal.weight}</span>
                  </div>
                  <p className="break-words text-xs leading-relaxed text-text-secondary">
                    {signal.explanation} · Evidence: {signal.evidenceReferences}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      <Card title="Executive summary" subtitle="Based on structured report output when available.">
        {summary ? (
          <div className="space-y-2">
            <Badge status={summary.source === 'AI assessment' ? 'AI_INFERENCE' : 'UNKNOWN'}>{summary.source}</Badge>
            <p className="break-words text-sm leading-relaxed text-text-primary">{summary.text}</p>
          </div>
        ) : (
          <EmptyState
            icon={Sparkles}
            title="Summary not available"
            message={hasResults ? 'A report agent summary was not returned.' : 'Run analysis to generate a structured summary.'}
          />
        )}
      </Card>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card
          title={`Findings (${findings.length})`}
          subtitle="Each finding shows its source, evidence reference, and verification state."
        >
          {findings.length ? (
            <div className="space-y-3">
              {findings.map((finding, index) => (
                <FindingCard key={`${finding.title}-${index}`} finding={finding} />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ShieldCheck}
              title="No findings returned"
              message={failed.length
                ? `Analysis failed: ${failed[0]?.errorMessage || 'External AI provider credentials unconfigured or timed out.'}`
                : 'No structured findings are available yet.'
              }
            />
          )}
        </Card>

        <div className="min-w-0 space-y-4">
          <Card title="Evidence breakdown" subtitle={`${evidence.length} submitted item${evidence.length === 1 ? '' : 's'}.`}>
            {evidence.length ? (
              <div className="space-y-3">
                {details.map(({ item, indicators, threats, analysis }) => {
                  const Icon = evidenceIcon[item.evidenceType] || FileText;
                  return (
                    <article key={item.id} className="space-y-3 rounded-lg border border-cyber-border bg-cyber-subtle p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="flex min-w-0 flex-1 items-start gap-2">
                          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-primary" aria-hidden="true" />
                          <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-text-primary">{titleCase(item.evidenceType)}</h4>
                            <p className="mt-0.5 break-words text-xs leading-relaxed text-text-secondary">
                              {item.description || item.url || item.subject || item.originalFilename || 'Submitted evidence'}
                            </p>
                          </div>
                        </div>
                        <Badge>
                          {analysis.length ? 'Analyzed' : 'Not analyzed'}
                        </Badge>
                      </div>
                      {indicators.length > 0 && (
                        <ul className="flex flex-wrap gap-1.5">
                          {indicators.map((indicator) => (
                            <li key={indicator.id} className="max-w-full break-all rounded-md border border-cyber-border bg-cyber-elevated px-2 py-0.5 font-mono text-xs text-text-primary">
                              {titleCase(indicator.indicatorType)}: {indicator.normalizedValue}
                            </li>
                          ))}
                        </ul>
                      )}
                      {threats.length > 0 && <ProviderResults results={threats} />}
                    </article>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon={FileText} title="No evidence submitted" message="Submit evidence before running analysis." />
            )}
          </Card>

          <Card title="Threat intelligence" subtitle="External results are never treated as clean when unavailable.">
            <ProviderResults results={details.flatMap((item) => item.threats)} />
          </Card>

          <Card title="Recommended actions" subtitle="Actions are shown only when supported by returned findings or evidence.">
            {actions.length ? (
              <ul className="space-y-3">
                {actions.map((action) => (
                  <li key={action} className="flex items-start gap-2.5 text-sm text-text-primary">
                    <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-cyan-primary" aria-hidden="true" />
                    <span className="leading-relaxed">{action}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState
                icon={CheckCircle2}
                title="No specific actions returned"
                message="Review the unknown information and verify any request independently."
              />
            )}
          </Card>
        </div>
      </div>

      {showConsentModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="ai-disclosure-modal-title"
          className="fixed inset-0 z-modal flex items-center justify-center overflow-y-auto bg-black/75 p-4"
        >
          <div className="workstation-panel relative w-full max-w-lg space-y-4 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-epistemic-inference/30 bg-epistemic-inference/10 text-epistemic-inference">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 id="ai-disclosure-modal-title" className="text-base font-semibold text-text-primary">
                  External AI Analysis Disclosure
                </h3>
                <p className="text-xs text-text-secondary">Third-Party Data Transmission Confirmation</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed text-text-primary">
              Extracted text (message text, email body/headers, PDF text, OCR text) is sent to Groq (third-party) for AI threat analysis.
            </p>

            <p className="break-words text-xs leading-relaxed text-text-secondary">
              Do not proceed if your evidence contains unredacted Personally Identifiable Information (PII), confidential credentials, or legally restricted internal communications.
            </p>

            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-cyber-border pt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowConsentModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setShowConsentModal(false);
                  runAnalysis();
                }}
              >
                I understand, continue
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalysisResultsPage;
