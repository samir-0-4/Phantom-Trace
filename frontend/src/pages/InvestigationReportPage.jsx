import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, FileText, Printer, AlertCircle, Fingerprint, Network } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import EmptyState from '../components/ui/EmptyState';
import { FullPageSpinner } from '../components/ui/Spinner';
import { getApiErrorMessage } from '../services/api/apiClient';
import { investigationService } from '../services/investigation/investigationService';
import { formatDate, formatDateTime, titleCase } from '../utils/format';

const parse = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const getDescriptiveEvidenceTitle = (item) => {
  if (!item) return 'Evidence Item';
  const typeStr = item.type ? String(item.type) : '';
  if (typeStr === 'EMAIL' || typeStr === 'EMAIL_MESSAGE') {
    if (item.senderAddress && item.subject) {
      return `Email from ${item.senderAddress} ("${item.subject}")`;
    }
    if (item.senderAddress) {
      return `Email from ${item.senderAddress}`;
    }
    if (item.subject) {
      return `Email: "${item.subject}"`;
    }
    return 'Email Evidence';
  }
  if (typeStr === 'URL' || item.url) {
    return item.url ? `Target URL: ${item.url}` : 'Target URL Evidence';
  }
  if (typeStr === 'TEXT_MESSAGE' || typeStr === 'SMS' || typeStr === 'MESSAGE') {
    if (item.senderAddress) {
      return `Text Message from ${item.senderAddress}`;
    }
    return 'Suspicious Text Message';
  }
  if (typeStr === 'DOCUMENT' || typeStr === 'FILE') {
    if (item.originalFilename) {
      return `File: ${item.originalFilename}`;
    }
    return 'Document / File Evidence';
  }
  if (item.originalFilename) {
    return `File: ${item.originalFilename}`;
  }
  return item.description ? `${titleCase(item.type)}: ${item.description}` : `${titleCase(item.type)} Evidence`;
};

const ReportFinding = ({ finding }) => (
  <article className="report-card rounded-2xl border border-white/[0.08] bg-[#0c101c] p-5 space-y-2.5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h3 className="font-bold text-slate-100 text-sm">
          {finding.title || 'Unknown finding'}
        </h3>
        <p className="mt-1 text-xs text-slate-400">
          {finding.description || 'No description available.'}
        </p>
      </div>
      <Badge status={finding.severity}>{titleCase(finding.severity || 'UNKNOWN')}</Badge>
    </div>
    <p className="mt-2 text-2xs leading-relaxed text-slate-400">
      {finding.explanation || 'No explanation available.'}
    </p>
    {finding.recommendedAction && (
      <p className="text-2xs text-cyan-300 font-semibold bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
        Action: {finding.recommendedAction}
      </p>
    )}
  </article>
);

export const InvestigationReportPage = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const [reports, campaignData] = await Promise.all([
      investigationService.listReports(id),
      typeof investigationService.getCampaign === 'function'
        ? investigationService.getCampaign(id).catch(() => null)
        : Promise.resolve(null),
    ]);
    setReport(reports[0] || null);
    setCampaign(campaignData);
  }, [id]);

  useEffect(() => {
    load()
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load reports.')))
      .finally(() => setLoading(false));
  }, [load]);

  const generate = async () => {
    setGenerating(true);
    setError('');
    try {
      const created = await investigationService.createReport(id);
      setReport(created);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Report could not be generated.'));
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <FullPageSpinner label="Loading investigation report…" />;
  const content = parse(report?.contentJson);
  const investigation = content?.investigation;
  const risk = content?.riskAssessment;
  const evidence = content?.evidence || [];
  const findings = evidence.flatMap((item) =>
    (item.analysis || []).flatMap((execution) => parse(execution.outputJson)?.findings || [])
  );
  const summaries = evidence
    .flatMap((item) => (item.analysis || []).map((execution) => parse(execution.outputJson)))
    .filter((item) => item?.summary);
  const relationships = content?.relationships || [];
  const campaignReconstruction = campaign || content?.campaignReconstruction;
  const sharedIndicators = campaignReconstruction?.sharedIndicators || [];
  const campaignSignals = campaignReconstruction?.campaignSignals || [];
  const connectedInvestigations = campaignReconstruction?.connectedInvestigations || [];
  const campaignClassification = campaignReconstruction?.campaignClassification || (sharedIndicators.length > 0 ? 'POSSIBLE' : 'ISOLATED_INCIDENT');
  const attributionSummary = campaignReconstruction?.attributionSummary;

  return (
    <div className="report-page mx-auto max-w-5xl space-y-6 min-w-0">
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6 min-w-0">
        <div>
          <Link
            to={`/investigations/${id}`}
            className="mb-2 inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-mono transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to investigation
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Investigation report
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 font-mono">
            Persisted forensic report snapshot · browser print &amp; PDF export supported
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
            disabled={!report}
            className="font-semibold inline-flex items-center gap-2 shadow-sm"
          >
            <Printer className="h-4 w-4" /> <span>Print / Save PDF</span>
          </Button>
          <Button
            onClick={generate}
            loading={generating}
            size="sm"
            className="font-semibold inline-flex items-center gap-2 shadow-md"
          >
            <FileText className="h-4 w-4" />
            <span>{report ? 'Regenerate report' : 'Generate report'}</span>
          </Button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="no-print rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs sm:text-sm text-rose-300 flex items-start gap-2.5 shadow-sm"
        >
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!report ? (
        <Card className="shadow-card">
          <EmptyState
            icon={FileText}
            title="No report generated"
            message="Generate a report after submitting and analyzing evidence."
            action={
              <Button onClick={generate} loading={generating} size="sm" className="shadow-md font-semibold">
                Generate report
              </Button>
            }
          />
        </Card>
      ) : (
        <article className="space-y-6 print:bg-white print:text-black">
          <header className="report-card border-b border-white/[0.08] pb-6 print:border-slate-300">
            <p className="text-2xs font-mono font-bold uppercase tracking-[0.2em] text-cyan-400 print:text-slate-600">
              PhantomTrace Digital Forensics Dossier
            </p>
            <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white print:text-black tracking-tight">
              {investigation?.title || 'Untitled investigation'}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-400 print:text-slate-600 font-mono">
              ID: {investigation?.id || id} · Created: {formatDate(investigation?.createdAt)} ·
              Category: {titleCase(investigation?.category || 'UNKNOWN')}
            </p>
            <p className="mt-1 text-2xs text-slate-400 print:text-slate-600 font-mono">
              Report generated {formatDateTime(report.createdAt)} · Epistemic Truth Standard
            </p>
          </header>

          {/* Epistemic Truth Standard Section */}
          <section className="grid gap-3 sm:grid-cols-3 text-xs font-mono print:text-black">
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3.5 space-y-1 print:border-slate-300 print:bg-slate-50">
              <span className="font-bold text-emerald-300 print:text-emerald-700 flex items-center gap-1.5">
                ● VERIFIED
              </span>
              <p className="text-2xs text-slate-300 print:text-slate-600 font-sans">
                Deterministic regex extraction, cryptographic hashes, and positive threat intelligence hits.
              </p>
            </div>
            <div className="rounded-xl border border-purple-500/30 bg-purple-950/20 p-3.5 space-y-1 print:border-slate-300 print:bg-slate-50">
              <span className="font-bold text-purple-300 print:text-purple-700 flex items-center gap-1.5">
                ▲ AI_INFERENCE
              </span>
              <p className="text-2xs text-slate-300 print:text-slate-600 font-sans">
                Bounded hypotheses generated by specialized AI agents from structured evidence.
              </p>
            </div>
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5 space-y-1 print:border-slate-300 print:bg-slate-50">
              <span className="font-bold text-amber-300 print:text-amber-700 flex items-center gap-1.5">
                ? UNKNOWN
              </span>
              <p className="text-2xs text-slate-300 print:text-slate-600 font-sans">
                Missing, unconfigured, or inconclusive intelligence feeds (never assumed safe).
              </p>
            </div>
          </section>

          <Card title="Executive summary" className="report-card shadow-card">
            {summaries[0]?.summary ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge status="AI_INFERENCE">AI_INFERENCE</Badge>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-200 print:text-slate-800 whitespace-pre-wrap font-sans">
                  {summaries[0].summary}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-800 border border-slate-700 px-2 py-0.5 text-2xs font-mono text-slate-400">
                    AI analysis not run
                  </span>
                  <Badge status="VERIFIED">VERIFIED / DETERMINISTIC</Badge>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-200 print:text-slate-800 font-sans">
                  {content?.deterministicExecutiveSummary ||
                    `Deterministic forensic baseline: ${evidence.length} evidence artifact(s) evaluated. Overall risk level assessed as ${investigation?.overallRiskLevel || 'UNKNOWN'} (score: ${investigation?.riskScore || 0}/100). Campaign reconstruction classified footprint as ${campaignClassification}. AI multi-agent reasoning was not executed; all metrics derive strictly from deterministic parsing rules, cryptographic digests, and threat intelligence feeds.`}
                </p>
              </div>
            )}
          </Card>

          <Card title="Overall risk assessment" className="report-card shadow-card">
            {risk ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-3xl sm:text-4xl font-mono font-extrabold text-white print:text-black">
                    {risk.score}/100
                  </span>
                  <Badge status={risk.category}>{titleCase(risk.category)}</Badge>
                  <span className="text-xs font-mono text-slate-400">
                    Confidence: {Math.round((risk.confidence || 0) * 100)}%
                  </span>
                </div>
                <p className="text-xs sm:text-sm leading-relaxed text-slate-200 print:text-slate-800">
                  {risk.explanation}
                </p>
                {risk.disclaimer && (
                  <p className="text-2xs font-mono text-amber-300 print:text-slate-600 bg-amber-950/20 p-3 rounded-xl border border-amber-900/40">
                    {risk.disclaimer}
                  </p>
                )}
                {risk.contributingSignals?.length > 0 && (
                  <div className="mt-4 space-y-2 border-t border-white/[0.08] pt-4 print:border-slate-300">
                    <h4 className="text-2xs font-mono font-bold uppercase tracking-wider text-slate-400 print:text-slate-700">
                      Itemized Risk Contributions ({risk.contributingSignals.length} signals)
                    </h4>
                    <div className="space-y-1.5">
                      {risk.contributingSignals.map((sig, idx) => (
                        <div
                          key={sig.id || idx}
                          className="flex items-center justify-between gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] p-2 text-xs font-mono print:border-slate-300 print:bg-slate-50"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-bold text-amber-400 print:text-amber-800">
                              +{sig.weight}
                            </span>
                            <span className="text-slate-200 print:text-black truncate">
                              {sig.signal}
                            </span>
                          </div>
                          <div className="shrink-0">
                            <Badge status={sig.epistemicBasis || (sig.signalKey?.startsWith('IMPERSONATION') ? 'AI_INFERENCE' : 'VERIFIED')}>
                              {sig.epistemicBasis || (sig.signalKey?.startsWith('IMPERSONATION') ? 'AI_INFERENCE' : 'VERIFIED')}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-400">
                Unknown — no risk assessment was available when this report was generated.
              </p>
            )}
          </Card>

          <Card title={`Evidence (${evidence.length})`} className="report-card shadow-card">
            {evidence.length ? (
              <div className="space-y-3">
                {evidence.map((item) => (
                  <div
                    key={item.id}
                    className="report-card rounded-2xl border border-white/[0.08] bg-[#090e1a] p-4 space-y-2"
                  >
                    <h3 className="font-bold text-slate-100 print:text-black text-sm">
                      {getDescriptiveEvidenceTitle(item)}
                    </h3>
                    <p className="text-xs text-slate-400 font-mono">
                      {item.description || 'No description provided.'}
                    </p>
                    {item.indicators?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {item.indicators.map((indicator) => (
                          <span
                            key={indicator.id}
                            className="rounded-full bg-[#111728] px-2.5 py-0.5 text-2xs font-mono text-slate-300 border border-white/[0.08]"
                          >
                            {titleCase(indicator.type)}:{' '}
                            {indicator.normalizedValue || indicator.originalValue}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-400">Unknown — no evidence was attached.</p>
            )}
          </Card>

          <Card title={`Findings (${findings.length})`} className="shadow-card">
            {findings.length ? (
              <div className="space-y-3.5">
                {findings.map((finding, index) => (
                  <ReportFinding key={`${finding.title}-${index}`} finding={finding} />
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-400">
                Unknown — no structured findings were persisted.
              </p>
            )}
          </Card>

          <Card title={`Evidence relationships (${relationships.length})`} className="shadow-card">
            {relationships.length ? (
              <div className="space-y-3">
                {relationships.map((relationship) => (
                  <div
                    key={relationship.id}
                    className="report-card rounded-2xl border border-white/[0.08] bg-[#090e1a] p-3.5 text-xs space-y-1.5"
                  >
                    <p className="font-bold text-slate-100">
                      {titleCase(relationship.type || relationship.relationshipType)}
                    </p>
                    <p className="text-slate-300">
                      {relationship.explanation || 'No explanation available.'}
                    </p>
                    <p className="text-2xs font-mono text-slate-400">
                      Verification: {titleCase(relationship.verificationStatus || 'UNKNOWN')} ·
                      Confidence:{' '}
                      {relationship.confidence == null
                        ? 'Unknown'
                        : `${Math.round(relationship.confidence * 100)}%`}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs sm:text-sm text-slate-400">
                Unknown — no supported relationships were found.
              </p>
            )}
          </Card>

          <Card
            title="Campaign reconstruction"
            subtitle="Cross-case provenance and infrastructure attribution"
            className="shadow-card"
            headerAction={
              <Badge status={campaignClassification === 'CONFIRMED' ? 'HIGH' : campaignClassification === 'SYNTHETIC_DEMO_CAMPAIGN' ? 'SYNTHETIC_DEMO' : campaignClassification === 'PROBABLE' ? 'MEDIUM' : 'LOW'}>
                {campaignClassification.replace(/_/g, ' ')}
              </Badge>
            }
          >
            {campaignReconstruction ? (
              <div className="space-y-5">
                {campaignClassification === 'SYNTHETIC_DEMO_CAMPAIGN' && (
                  <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-3 text-xs text-purple-300 font-mono">
                    <strong>DEMONSTRATION DATASET:</strong> This campaign footprint is reconstructed from synthetic demonstration fixtures using RFC 2606 (.test) and RFC 5737 (TEST-NET) indicators. It illustrates cross-case correlation mechanics and does not represent real-world threat actor attribution.
                  </div>
                )}
                {attributionSummary && (
                  <div className="rounded-xl border border-white/[0.08] bg-[#0c101c] p-4 text-xs text-slate-300 leading-relaxed font-sans print:border-slate-300 print:text-black">
                    <span className="font-mono text-2xs uppercase tracking-wider text-cyan-400 block mb-1">
                      Attribution Assessment
                    </span>
                    {attributionSummary}
                  </div>
                )}

                {connectedInvestigations.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
                      <Network className="h-4 w-4" aria-hidden="true" />
                      Connected Campaign Dossiers ({connectedInvestigations.length})
                    </h3>
                    <div className="grid gap-2.5 md:grid-cols-2">
                      {connectedInvestigations.map((inv) => (
                        <div
                          key={inv.id}
                          className="report-card rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.06] p-3.5 space-y-1.5"
                        >
                          <p className="text-xs font-bold text-white print:text-black">
                            {inv.title}
                          </p>
                          <p className="text-2xs text-slate-300 print:text-slate-700">
                            {inv.relationshipExplanation}
                          </p>
                          <p className="text-2xs font-mono text-cyan-400">
                            Confidence: {inv.confidence} · {inv.sharedIndicatorCount} Shared Indicator(s)
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {campaignSignals.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
                      <Network className="h-4 w-4" aria-hidden="true" />
                      Campaign signals
                    </h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {campaignSignals.map((signal, index) => (
                        <div
                          key={`${signal.description || 'signal'}-${index}`}
                          className="report-card rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.06] p-4 space-y-2"
                        >
                          <p className="text-xs leading-relaxed text-slate-200 print:text-black">
                            {signal.description || 'Unspecified coordination signal.'}
                          </p>
                          <p className="text-2xs font-mono text-cyan-300">
                            Confidence: {titleCase(signal.confidence || 'UNKNOWN')} ·
                            Supporting evidence: {signal.supportingEvidenceIds?.length || 0}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {sharedIndicators.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-violet-300">
                      <Fingerprint className="h-4 w-4" aria-hidden="true" />
                      Shared indicators
                    </h3>
                    <div className="grid gap-2 md:grid-cols-2">
                      {sharedIndicators.map((indicator, index) => (
                        <div
                          key={`${indicator.type || 'indicator'}-${indicator.value || index}`}
                          className="rounded-xl border border-white/[0.08] bg-[#090e1a] p-3 print:border-slate-300 print:bg-white"
                        >
                          <p className="break-all text-xs font-mono text-slate-200 print:text-black font-semibold">
                            {indicator.value || 'Unknown value'}
                          </p>
                          <p className="mt-1 text-2xs font-mono text-slate-400 print:text-slate-600">
                            {titleCase(indicator.type || 'UNKNOWN')} · seen in {indicator.count || 0} evidence items
                            {indicator.crossInvestigation ? ' (Multi-Case)' : ''}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {!campaignSignals.length && !sharedIndicators.length && (
                  <p className="text-xs text-slate-400">
                    No cross-evidence campaign signals were detected.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Campaign reconstruction is unavailable for this investigation.
              </p>
            )}
          </Card>

          {/* Forensic Sign-Off Box for print and official record */}
          <div className="report-card rounded-2xl border border-white/[0.1] bg-[#0c101c] p-5 font-mono text-xs space-y-3 print:border-slate-300 print:bg-slate-50 print:text-black">
            <p className="font-bold uppercase tracking-wider text-slate-300 print:text-slate-800">
              Forensic Examiner Verification &amp; Chain of Custody
            </p>
            <div className="grid grid-cols-2 gap-4 pt-2 text-2xs text-slate-400 print:text-slate-700">
              <div>
                <span className="block text-slate-500">EXAMINER IDENTIFIER:</span>
                <span className="font-semibold text-slate-200 print:text-black">PhantomTrace Automated Engine v0.1.0</span>
              </div>
              <div>
                <span className="block text-slate-500">INTEGRITY DIGEST:</span>
                <span className="font-semibold text-slate-200 print:text-black truncate block font-mono text-2xs">
                  {content?.integrityDigest
                    ? `SHA256:${content.integrityDigest}`
                    : (investigation?.id ? `REPORT:${investigation.id}` : 'UNKNOWN')}
                </span>
              </div>
            </div>
            <div className="border-t border-dashed border-white/10 pt-4 mt-2 print:border-slate-300">
              <span className="text-2xs text-slate-500 block">INVESTIGATOR SIGNATURE: ___________________________________ &nbsp;&nbsp;&nbsp;&nbsp; DATE: _______________</span>
            </div>
          </div>

          <footer className="report-card rounded-2xl border border-amber-900/40 bg-amber-950/20 p-4 text-2xs text-amber-300 font-mono leading-relaxed print:border-slate-300 print:bg-white print:text-slate-600">
            ⚠️ <strong>Disclaimer:</strong> This report is AI-assisted analysis generated by PhantomTrace. It is <strong>not a certified legal forensic report</strong> and should not be used as sole evidence in legal proceedings. All AI-generated findings are labelled <strong>AI_INFERENCE</strong> and reflect probabilistic assessments only. Consult a qualified digital forensics professional for legally admissible investigations.
          </footer>
        </article>
      )}
    </div>
  );
};

export default InvestigationReportPage;
