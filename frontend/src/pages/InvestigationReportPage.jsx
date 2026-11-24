import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, FileText, Fingerprint, Printer } from 'lucide-react';
import Button from '../components/common/Button';
import { FullPageSpinner } from '../components/ui/Spinner';
import { getApiErrorMessage } from '../services/api/apiClient';
import { investigationService } from '../services/investigation/investigationService';
import { formatDate, formatDateTime, titleCase } from '../utils/format';
import '../styles/report.css';

const parse = (value) => {
  try {
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};

const formatConfidence = (confidence) => (
  confidence == null ? 'Unknown' : `${Math.round(confidence * 100)}%`
);

const getDescriptiveEvidenceTitle = (item) => {
  const type = String(item.type || '');
  if (type === 'EMAIL' || type === 'EMAIL_MESSAGE') {
    if (item.senderAddress && item.subject) return `Email from ${item.senderAddress} ("${item.subject}")`;
    if (item.senderAddress) return `Email from ${item.senderAddress}`;
    if (item.subject) return `Email: "${item.subject}"`;
    return 'Email Evidence';
  }
  if (type === 'URL' || item.url) {
    return item.url ? `Target URL: ${item.url}` : 'Target URL Evidence';
  }
  if (type === 'TEXT_MESSAGE' || type === 'SMS' || type === 'MESSAGE') {
    return item.senderAddress ? `Text Message from ${item.senderAddress}` : 'Text Message Evidence';
  }
  if (item.originalFilename) return `File: ${item.originalFilename}`;
  if (type === 'DOCUMENT' || type === 'FILE') return 'Document / File Evidence';
  if (type && item.description) return `${titleCase(type)}: ${item.description}`;
  return type ? `${titleCase(type)} Evidence` : 'Evidence Item';
};

const provenanceLabels = [
  { value: 'VERIFIED', description: 'Deterministic extraction, a cryptographic hash, or a positive provider lookup.' },
  { value: 'AI_INFERENCE', description: 'An assessment from structured evidence that requires corroboration.' },
  { value: 'UNKNOWN', description: 'Missing, unavailable, or inconclusive information.' },
];

const DossierTag = ({ value, children }) => (
  <span className="dossier-tag" data-value={value || 'UNKNOWN'}>{children || value || 'UNKNOWN'}</span>
);

const ReportSection = ({ title, children, action }) => (
  <section className="dossier-section">
    <div className="dossier-section-heading">
      <h3>{title}</h3>
      {action}
    </div>
    {children}
  </section>
);

const ReportFinding = ({ finding, agentName }) => (
  <li className="dossier-entry">
    <div className="dossier-entry-heading">
      <h4>{finding.title || 'Unknown finding'}</h4>
      <DossierTag value={finding.severity}>{titleCase(finding.severity || 'UNKNOWN')} severity</DossierTag>
    </div>
    <p>{finding.description || 'No description available.'}</p>
    <div className="dossier-finding-source">
      <DossierTag value={finding.verificationStatus} />
      {agentName && <span>{titleCase(agentName)}</span>}
      <span>Confidence {formatConfidence(finding.confidence)}</span>
    </div>
    {finding.evidenceReference && <p className="dossier-meta-line">Evidence reference {finding.evidenceReference}</p>}
    <p>{finding.explanation || 'No explanation available.'}</p>
    {finding.recommendedAction && <p><strong>Recommended action</strong> {finding.recommendedAction}</p>}
  </li>
);

const CampaignDetails = ({ reconstruction }) => {
  const sharedIndicators = reconstruction.sharedIndicators || [];
  const campaignSignals = reconstruction.campaignSignals || [];
  const connectedInvestigations = reconstruction.connectedInvestigations || [];

  return (
    <div className="dossier-campaign">
      {reconstruction.campaignClassification === 'SYNTHETIC_DEMO_CAMPAIGN' && (
        <p className="dossier-notice dossier-synthetic">
          <strong>Synthetic demonstration dataset.</strong> This footprint comes from demonstration fixtures
          with reserved <code>.test</code> domains and TEST-NET addresses.
        </p>
      )}
      {reconstruction.attributionSummary && (
        <p>{reconstruction.attributionSummary}</p>
      )}
      {connectedInvestigations.length > 0 && (
        <div className="dossier-subsection">
          <h4>Connected cases ({connectedInvestigations.length})</h4>
          <ul className="dossier-entries">
            {connectedInvestigations.map((connected) => (
              <li key={connected.id} className="dossier-entry">
                <h5>{connected.title}</h5>
                <p>{connected.relationshipExplanation}</p>
                <p className="dossier-meta-line">
                  Confidence {titleCase(connected.confidence || 'UNKNOWN')} · {connected.sharedIndicatorCount ?? 0} shared indicators
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {campaignSignals.length > 0 && (
        <div className="dossier-subsection">
          <h4>Campaign signals ({campaignSignals.length})</h4>
          <ul className="dossier-entries">
            {campaignSignals.map((signal, index) => (
              <li key={index} className="dossier-entry">
                <p>{signal.description || 'Unspecified coordination signal.'}</p>
                <p className="dossier-meta-line">
                  Confidence {titleCase(signal.confidence || 'UNKNOWN')} · Supporting evidence {signal.supportingEvidenceIds?.length ?? 0}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
      {sharedIndicators.length > 0 && (
        <div className="dossier-subsection">
          <h4>Shared indicators ({sharedIndicators.length})</h4>
          <ul className="dossier-indicators">
            {sharedIndicators.map((indicator, index) => (
              <li key={index}>
                <code>{indicator.value || 'Unknown value'}</code>
                <span>
                  {titleCase(indicator.type || 'UNKNOWN')} · {indicator.count ?? 0} evidence items
                  {indicator.crossInvestigation ? ' · Multiple cases' : ''}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {!campaignSignals.length && !sharedIndicators.length && (
        <p className="dossier-muted">No cross-evidence campaign signals were detected.</p>
      )}
    </div>
  );
};

const ForensicDossier = ({ report, content, id }) => {
  const investigation = content?.investigation;
  const evidence = content?.evidence || [];
  const risk = content?.riskAssessment;
  const relationships = content?.relationships || [];
  const reconstruction = content?.campaignReconstruction;
  const executions = evidence.flatMap((item) =>
    (item.analysis || []).map((execution) => ({
      agentName: execution.agentName,
      output: parse(execution.outputJson),
    }))
  );
  const findings = executions.flatMap(({ agentName, output }) =>
    (output?.findings || []).map((finding) => ({ finding, agentName }))
  );
  const summary = executions.find(({ output }) => output?.summary);
  const indicatorCount = evidence.reduce((count, item) => count + (item.indicators?.length || 0), 0);
  const digest = /^[a-f0-9]{64}$/i.test(content?.integrityDigest || '') ? content.integrityDigest : null;

  return (
    <article className="forensic-dossier" aria-labelledby="dossier-title">
      <header className="dossier-masthead">
        <p className="dossier-wordmark"><FileText size={16} aria-hidden="true" /> PhantomTrace Digital Forensics Dossier</p>
        <h2 id="dossier-title">{investigation?.title || 'Untitled investigation'}</h2>
        <dl className="dossier-case-meta">
          <div>
            <dt>Case ID</dt>
            <dd><code>{investigation?.id || id}</code></dd>
          </div>
          <div>
            <dt>Category</dt>
            <dd>{titleCase(investigation?.category || 'UNKNOWN')}</dd>
          </div>
          <div>
            <dt>Case opened</dt>
            <dd><time dateTime={investigation?.createdAt || undefined}>{formatDate(investigation?.createdAt)}</time></dd>
          </div>
          <div>
            <dt>Report generated</dt>
            <dd><time dateTime={report.createdAt || undefined}>{formatDateTime(report.createdAt)}</time></dd>
          </div>
        </dl>
      </header>

      <ReportSection title="Executive summary">
        {summary ? (
          <div className="dossier-summary">
            <div className="dossier-finding-source">
              <DossierTag value="AI_INFERENCE" />
              {summary.agentName && <span>{titleCase(summary.agentName)}</span>}
            </div>
            <p>{summary.output.summary}</p>
          </div>
        ) : (
          <p className="dossier-muted">
            No structured agent summary was saved in this report.
            {investigation?.overallRiskLevel && !risk && (
              <> The case recorded {titleCase(investigation.overallRiskLevel)} risk{investigation.riskScore != null && ` with a score of ${investigation.riskScore}/100`}.</>
            )}
          </p>
        )}
        <dl className="dossier-metrics">
          <div><dt>Evidence items</dt><dd>{evidence.length}</dd></div>
          <div><dt>Extracted indicators</dt><dd>{indicatorCount}</dd></div>
          <div><dt>Findings</dt><dd>{findings.length}</dd></div>
        </dl>
      </ReportSection>

      <ReportSection title="Evidence provenance">
        <dl className="dossier-provenance">
          {provenanceLabels.map(({ value, description }) => (
            <div key={value}>
              <dt><DossierTag value={value} /></dt>
              <dd>{description}</dd>
            </div>
          ))}
        </dl>
      </ReportSection>

      <ReportSection title="Overall risk assessment">
        {risk ? (
          <div className="dossier-risk">
            <div className="dossier-risk-readout">
              <p className="dossier-risk-score">
                {risk.score ?? 'Unknown'}
                {risk.score != null && <span> / 100</span>}
              </p>
              <DossierTag value={risk.category}>{titleCase(risk.category || 'UNKNOWN')}</DossierTag>
              <p className="dossier-meta-line">Confidence {formatConfidence(risk.confidence)}</p>
            </div>
            {risk.explanation && <p>{risk.explanation}</p>}
            {risk.disclaimer && <p className="dossier-muted">{risk.disclaimer}</p>}
            {risk.contributingSignals?.length > 0 && (
              <div className="dossier-subsection">
                <h4>Itemized risk contributions ({risk.contributingSignals.length})</h4>
                <ul className="dossier-entries">
                  {risk.contributingSignals.map((signal, index) => (
                    <li className="dossier-risk-signal" key={signal.id || index}>
                      <strong>{signal.weight > 0 ? '+' : ''}{signal.weight}</strong>
                      <span>{signal.signal}</span>
                      <DossierTag value={signal.epistemicBasis} />
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="dossier-muted">No risk assessment was available when this report was generated.</p>
        )}
      </ReportSection>

      <ReportSection title={`Evidence (${evidence.length})`}>
        {evidence.length ? (
          <ul className="dossier-entries">
            {evidence.map((item) => (
              <li key={item.id} className="dossier-entry">
                <h4>{getDescriptiveEvidenceTitle(item)}</h4>
                <p>{item.description || 'No description provided.'}</p>
                {item.indicators?.length > 0 && (
                  <ul className="dossier-indicators">
                    {item.indicators.map((indicator) => (
                      <li key={indicator.id}>
                        <code>{indicator.normalizedValue || indicator.originalValue || 'Unknown value'}</code>
                        <span>
                          {titleCase(indicator.type || 'UNKNOWN')}
                          {indicator.extractionMethod && ` · ${titleCase(indicator.extractionMethod)}`}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="dossier-muted">No evidence was attached when this report was generated.</p>
        )}
      </ReportSection>

      <ReportSection title={`Findings (${findings.length})`}>
        {findings.length ? (
          <ul className="dossier-entries">
            {findings.map(({ finding, agentName }, index) => (
              <ReportFinding key={index} finding={finding} agentName={agentName} />
            ))}
          </ul>
        ) : (
          <p className="dossier-muted">No structured findings were persisted.</p>
        )}
      </ReportSection>

      <ReportSection title={`Evidence relationships (${relationships.length})`}>
        {relationships.length ? (
          <ul className="dossier-entries">
            {relationships.map((relationship) => (
              <li key={relationship.id} className="dossier-entry">
                <h4>{titleCase(relationship.type || relationship.relationshipType || 'UNKNOWN')}</h4>
                <p>{relationship.explanation || 'No explanation available.'}</p>
                <div className="dossier-finding-source">
                  <DossierTag value={relationship.verificationStatus} />
                  <span>Confidence {formatConfidence(relationship.confidence)}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="dossier-muted">No supported relationships were found.</p>
        )}
      </ReportSection>

      <ReportSection
        title="Campaign reconstruction"
        action={reconstruction?.campaignClassification && (
          <DossierTag value={reconstruction.campaignClassification}>
            {titleCase(reconstruction.campaignClassification)}
          </DossierTag>
        )}
      >
        {reconstruction ? (
          <CampaignDetails reconstruction={reconstruction} />
        ) : (
          <p className="dossier-muted">No campaign reconstruction was saved in this snapshot.</p>
        )}
      </ReportSection>

      <ReportSection title="Report integrity">
        <div className="dossier-integrity">
          <Fingerprint size={23} aria-hidden="true" />
          <div>
            <h4>SHA-256 snapshot digest</h4>
            {digest ? (
              <>
                <code>SHA256:{digest}</code>
                <p>This fingerprint covers the canonical report JSON before the digest field was added.</p>
              </>
            ) : (
              <p className="dossier-muted">No SHA-256 digest was recorded.</p>
            )}
          </div>
        </div>
        <dl className="dossier-case-meta dossier-record-meta">
          <div>
            <dt>Report ID</dt>
            <dd>{report.id ? <code>{report.id}</code> : 'Unknown'}</dd>
          </div>
          <div>
            <dt>Generating system</dt>
            <dd>PhantomTrace Automated Engine</dd>
          </div>
        </dl>
        <div className="dossier-signature">
          <p>Investigator signature</p>
          <p>Date</p>
        </div>
      </ReportSection>

      <footer className="dossier-footer">
        <h3>Limitations</h3>
        {content?.limitations?.length > 0 && (
          <ul>
            {content.limitations.map((limitation) => <li key={limitation}>{limitation}</li>)}
          </ul>
        )}
        <p>
          {content?.disclaimer || 'This report supports investigation and verification.'}
          {' '}A qualified examiner should review the findings before any use in legal proceedings.
        </p>
      </footer>
    </article>
  );
};

const InvestigationReport = ({ id }) => {
  const [report, setReport] = useState(null);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const currentCampaign = typeof investigationService.getCampaign === 'function'
      ? investigationService.getCampaign(id).catch(() => null)
      : Promise.resolve(null);

    Promise.all([investigationService.listReports(id), currentCampaign])
      .then(([reports, campaignData]) => {
        if (!active) return;
        setReport(reports[0] || null);
        setCampaign(campaignData);
      })
      .catch((err) => {
        if (!active) return;
        setReport(null);
        setCampaign(null);
        setError(getApiErrorMessage(err, 'Could not load reports.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [id]);

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
  const reconstruction = content?.campaignReconstruction;
  const hasDifferentCurrentCampaign = campaign && JSON.stringify(campaign) !== JSON.stringify(reconstruction);

  return (
    <div className="report-workspace">
      <header className="report-workspace-header no-print">
        <div>
          <Link to={`/investigations/${id}`} className="text-link report-back-link">
            <ArrowLeft size={16} aria-hidden="true" /> Back to investigation
          </Link>
          <h1 className="page-heading">Investigation report</h1>
          <p className="page-lede">Generate a saved snapshot of the case evidence and analysis.</p>
        </div>
        <div className="report-toolbar">
          <Button variant="secondary" onClick={() => window.print()} disabled={!content}>
            <Printer size={16} aria-hidden="true" />
            Print / Save PDF
          </Button>
          <Button onClick={generate} loading={generating}>
            <FileText size={16} aria-hidden="true" />
            {report ? 'Regenerate report' : 'Generate report'}
          </Button>
        </div>
      </header>

      {(error || (report && !content)) && (
        <div role="alert" className="report-alert no-print">
          <AlertCircle size={18} aria-hidden="true" />
          <p>{error || 'The saved report could not be read. Regenerate the report to create a new snapshot.'}</p>
        </div>
      )}

      {report && content ? (
        <>
          <ForensicDossier report={report} content={content} id={id} />
          {hasDifferentCurrentCampaign && (
            <details className="report-live-campaign workstation-panel no-print" open={!reconstruction || undefined}>
              <summary>Live campaign reconstruction</summary>
              <div className="forensic-dossier">
                <p className="dossier-notice">This live view is separate from the saved dossier and its SHA-256 digest.</p>
                <CampaignDetails reconstruction={campaign} />
              </div>
            </details>
          )}
        </>
      ) : !error && !report && (
        <section className="workstation-panel report-empty no-print">
          <FileText size={24} aria-hidden="true" />
          <h2>No report generated</h2>
          <p>Submit and analyze case evidence, then generate the report.</p>
        </section>
      )}
    </div>
  );
};

export const InvestigationReportPage = () => {
  const { id } = useParams();
  return <InvestigationReport key={id} id={id} />;
};

export default InvestigationReportPage;
