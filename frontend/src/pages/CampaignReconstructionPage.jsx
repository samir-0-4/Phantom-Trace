import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Network,
  Share2,
  ShieldAlert,
  ArrowLeft,
  GitBranch,
  FileText,
  Info,
  Layers,
  FolderSearch,
  ExternalLink,
  Fingerprint,
  Sparkles,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { Spinner } from '../components/ui/Spinner';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge, CategoryBadge } from '../components/ui/StatusBadge';
import investigationService from '../services/investigation/investigationService';

const classificationStyles = {
  SYNTHETIC_DEMO_CAMPAIGN: {
    border: 'border-l-text-muted',
    badgeVariant: 'SYNTHETIC_DEMO_CAMPAIGN',
    badgeText: 'SYNTHETIC DEMO CAMPAIGN',
    iconColor: 'text-text-secondary',
    description: 'Simulated demonstration campaign using RFC 2606 (.test) and RFC 5737 (TEST-NET) test fixtures. Demonstrates multi-case correlation without real-world threat attribution.',
  },
  CONFIRMED: {
    border: 'border-l-risk-critical',
    badgeVariant: 'CRITICAL',
    badgeText: 'CONFIRMED CAMPAIGN',
    iconColor: 'text-risk-critical',
    description: 'Shared infrastructure is confirmed malicious by external threat intelligence or identical cryptographic payload matches.',
  },
  PROBABLE: {
    border: 'border-l-risk-medium',
    badgeVariant: 'MEDIUM',
    badgeText: 'PROBABLE CAMPAIGN',
    iconColor: 'text-risk-medium',
    description: 'Multiple distinct indicators (e.g. domain, IP, sender identity) converge across independent evidence items or investigations.',
  },
  POSSIBLE: {
    border: 'border-l-cyan-primary',
    badgeVariant: 'ACCENT',
    badgeText: 'POSSIBLE CAMPAIGN',
    iconColor: 'text-cyan-primary',
    description: 'Single indicator overlap or heuristic correlation observed across artifacts; further evidence required for attribution.',
  },
  ISOLATED_INCIDENT: {
    border: 'border-l-text-muted',
    badgeVariant: 'secondary',
    badgeText: 'ISOLATED INCIDENT',
    iconColor: 'text-text-secondary',
    description: 'No cross-evidence or cross-investigation footprint identified. The submitted evidence appears isolated.',
  },
};

const caseAction = 'inline-flex min-h-9 shrink-0 items-center gap-2 rounded-md border border-cyber-border bg-cyber-surface px-3 text-sm font-medium text-text-primary hover:bg-cyber-elevated';

const CampaignMetric = ({ label, value, detail = false }) => (
  <div className="min-w-0 bg-cyber-surface px-4 py-3">
    <dt className="section-label text-text-secondary">{label}</dt>
    <dd className={detail ? 'mt-1.5 break-all font-mono text-xs text-text-primary' : 'mt-1 font-mono text-xl font-semibold tabular-nums text-text-primary'}>
      {value}
    </dd>
  </div>
);

export const CampaignReconstructionPage = () => {
  const { id } = useParams();
  const [investigation, setInvestigation] = useState(null);
  const [campaignData, setCampaignData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seedingDemo, setSeedingDemo] = useState(false);

  const fetchCampaign = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [caseRes, campaignRes] = await Promise.all([
        investigationService.getById(id),
        investigationService.getCampaign(id),
      ]);
      setInvestigation(caseRes);
      setCampaignData(campaignRes);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load campaign reconstruction');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  const handleSeedDemo = async () => {
    setSeedingDemo(true);
    try {
      await investigationService.seedDemoCampaign();
      await fetchCampaign();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load demo campaign.');
    } finally {
      setSeedingDemo(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Spinner size="lg" />
        <p className="text-center text-sm text-text-secondary">
          Reconstructing Campaign Footprint & Cross-Case Attribution…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Campaign Reconstruction Unavailable"
          message={error}
          onRetry={fetchCampaign}
        />
      </div>
    );
  }

  const sharedIndicators = campaignData?.sharedIndicators || [];
  const campaignSignals = campaignData?.campaignSignals || [];
  const connectedInvestigations = campaignData?.connectedInvestigations || [];
  const classification = campaignData?.campaignClassification || (sharedIndicators.length > 0 ? 'POSSIBLE' : 'ISOLATED_INCIDENT');
  const attributionSummary = campaignData?.attributionSummary || 'Heuristic correlation completed across persisted records.';
  const classStyle = classificationStyles[classification] || classificationStyles.ISOLATED_INCIDENT;

  const verification = classification === 'CONFIRMED'
    ? 'EXTERNAL_INTEL'
    : classification === 'SYNTHETIC_DEMO_CAMPAIGN' ? 'SYNTHETIC_FIXTURE' : 'DETERMINISTIC';

  return (
    <div className="min-w-0 space-y-6 pb-10">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <Link to={`/investigations/${id}`} className="text-link mb-2 inline-flex items-center gap-1.5 text-sm">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Investigation Dossier
          </Link>
          <h1 className="page-heading break-words">{investigation?.title || 'Campaign Reconstruction'}</h1>
          <p className="page-lede mt-1">
            Campaign reconstruction <span className="font-mono text-xs text-text-muted">/ Case #{id?.slice(0, 8)}</span>
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {investigation?.status && <StatusBadge status={investigation.status} />}
          <Link to={`/investigations/${id}/graph`} className={caseAction}>
            <GitBranch className="h-4 w-4 text-cyan-primary" aria-hidden="true" /> Evidence Graph
          </Link>
          <Link to={`/investigations/${id}/report`} className={caseAction}>
            <FileText className="h-4 w-4 text-text-secondary" aria-hidden="true" /> Audit Report
          </Link>
        </div>
      </header>

      <section className={`workstation-panel overflow-hidden border-l-2 ${classStyle.border}`}>
        <div className="px-4 py-5 sm:px-5">
          <div className="flex flex-wrap items-center gap-2">
            <Network className={`h-5 w-5 ${classStyle.iconColor}`} aria-hidden="true" />
            <h2 className="text-lg font-semibold text-text-primary">Scam Campaign Footprint Reconstruction</h2>
            <Badge variant={classStyle.badgeVariant}>{classStyle.badgeText}</Badge>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-secondary">{classStyle.description}</p>
        </div>
        <dl className="grid gap-px border-y border-cyber-border bg-cyber-border sm:grid-cols-3">
          <CampaignMetric label="Connected Cases" value={connectedInvestigations.length} />
          <CampaignMetric label="Shared Indicators" value={sharedIndicators.length} />
          <CampaignMetric label="Verification" value={verification} detail />
        </dl>
        <div className="px-4 py-4 sm:px-5">
          <h3 className="section-label flex items-center gap-2 text-text-secondary">
            <Fingerprint className="h-4 w-4 text-cyan-primary" aria-hidden="true" />
            Attribution &amp; Relationship Narrative
          </h3>
          <p className="mt-2 break-words text-sm leading-relaxed text-text-primary">{attributionSummary}</p>
        </div>
      </section>

      <section className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
            <FolderSearch className="h-4 w-4 shrink-0 text-cyan-primary" aria-hidden="true" />
            Cross-Investigation Campaign Dossiers ({connectedInvestigations.length})
          </h2>
          <span className="text-xs text-text-muted">Isolated by Tenant Boundaries</span>
        </div>
        {connectedInvestigations.length > 0 ? (
          <ul className="workstation-panel divide-y divide-cyber-border overflow-hidden">
            {connectedInvestigations.map((inv) => (
              <li key={inv.id} className="grid min-w-0 gap-3 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:px-5">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <CategoryBadge category={inv.category} />
                    <Badge variant={inv.confidence === 'CONFIRMED' ? 'CRITICAL' : inv.confidence === 'SYNTHETIC_DEMO' ? 'SYNTHETIC_DEMO' : 'MEDIUM'}>
                      {inv.confidence === 'SYNTHETIC_DEMO' ? 'SYNTHETIC DEMO' : inv.confidence}
                    </Badge>
                  </div>
                  <h3 className="mt-2 break-words text-sm font-semibold text-text-primary">{inv.title}</h3>
                  <p className="mt-1 break-words text-sm leading-relaxed text-text-secondary">{inv.relationshipExplanation}</p>
                  {inv.sharedIndicatorValues?.length > 0 && (
                    <ul className="mt-2 flex flex-wrap gap-1.5">
                      {inv.sharedIndicatorValues.slice(0, 3).map((value, index) => (
                        <li key={`${value}-${index}`} className="max-w-full break-all rounded-md border border-cyber-border bg-cyber-subtle px-2 py-0.5 font-mono text-xs text-text-primary">
                          {value}
                        </li>
                      ))}
                      {inv.sharedIndicatorValues.length > 3 && (
                        <li className="px-1 font-mono text-xs text-text-muted">+{inv.sharedIndicatorValues.length - 3} more</li>
                      )}
                    </ul>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary sm:flex-col sm:items-end sm:gap-1.5">
                  <span className="font-mono">{inv.sharedIndicatorCount} Shared</span>
                  <span>Status: {inv.status}</span>
                  <Link to={`/investigations/${inv.id}`} className="text-link inline-flex items-center gap-1.5 text-sm font-medium">
                    Inspect Case <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <Card>
            <p className="flex items-start gap-2 text-sm text-text-secondary">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-primary" aria-hidden="true" />
              No other investigations in your organization share indicators with this case.
            </p>
            <p className="mt-2 text-sm text-text-muted">
              Submit related phishing emails or SMS alerts, or load the synthetic demo dataset to evaluate multi-case campaign correlation.
            </p>
          </Card>
        )}
      </section>

      <section className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
            <ShieldAlert className="h-4 w-4 shrink-0 text-cyan-primary" aria-hidden="true" />
            Campaign Detection Signals ({campaignSignals.length})
          </h2>
          <span className="break-all text-xs text-text-muted">Epistemic: DETERMINISTIC_CORRELATION</span>
        </div>
        {campaignSignals.length > 0 ? (
          <ol className="workstation-panel divide-y divide-cyber-border">
            {campaignSignals.map((signal, index) => (
              <li key={index} className="grid min-w-0 gap-2 px-4 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:px-5">
                <div className="min-w-0">
                  <span className="section-label text-text-secondary">Signal #{index + 1}</span>
                  <p className="mt-1 break-words text-sm leading-relaxed text-text-primary">{signal.description}</p>
                  <p className="mt-2 text-xs text-text-secondary">
                    Linked Artifacts: <strong className="font-mono font-medium text-text-primary">{signal.supportingEvidenceIds?.length || 0} Evidence Items</strong>
                  </p>
                </div>
                <Badge
                  variant={signal.confidence === 'CONFIRMED' ? 'CRITICAL' : signal.confidence === 'SYNTHETIC_DEMO_CAMPAIGN' ? 'SYNTHETIC_DEMO_CAMPAIGN' : signal.confidence === 'PROBABLE' ? 'MEDIUM' : 'ACCENT'}
                  className="w-fit"
                >
                  {signal.confidence?.replace(/_/g, ' ') || 'Unknown'}
                </Badge>
              </li>
            ))}
          </ol>
        ) : (
          <Card>
            <p className="flex items-start gap-2 text-sm text-text-secondary">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-primary" aria-hidden="true" />
              No aggregated multi-artifact signals identified yet.
            </p>
          </Card>
        )}
      </section>

      <section className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h2 className="flex items-center gap-2 text-base font-semibold text-text-primary">
            <Share2 className="h-4 w-4 shrink-0 text-cyan-primary" aria-hidden="true" />
            Shared Campaign Indicators ({sharedIndicators.length})
          </h2>
          <span className="text-xs text-text-muted">Requires Evidence or Cross-Case Convergence</span>
        </div>

        {sharedIndicators.length > 0 ? (
          <div className="workstation-panel overflow-hidden">
            <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Shared campaign indicators">
              <table className="w-full min-w-[620px] text-left text-sm">
                <thead className="border-b border-cyber-border bg-cyber-elevated text-text-secondary">
                  <tr className="section-label">
                    <th scope="col" className="px-4 py-3 sm:pl-5">Indicator Value</th>
                    <th scope="col" className="px-4 py-3">Type</th>
                    <th scope="col" className="px-4 py-3">Scope</th>
                    <th scope="col" className="px-4 py-3">Crossings</th>
                    <th scope="col" className="px-4 py-3">Verification Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyber-border">
                  {sharedIndicators.map((item, index) => (
                    <tr key={`${item.type}-${item.value}-${index}`} className="hover:bg-cyber-elevated">
                      <th scope="row" className="max-w-xs break-all px-4 py-3.5 font-mono text-xs font-medium text-text-primary sm:pl-5">{item.value}</th>
                      <td className="px-4 py-3.5"><Badge variant="secondary">{item.type}</Badge></td>
                      <td className="px-4 py-3.5 text-xs text-text-secondary">
                        {item.crossInvestigation ? 'Multi-Case Campaign' : 'Single-Case Evidence'}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1.5 whitespace-nowrap font-mono text-xs text-text-secondary">
                          <Layers className="h-3.5 w-3.5 text-cyan-primary" aria-hidden="true" /> {item.count} Artifacts
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant={item.verificationStatus === 'VERIFIED_MALICIOUS' ? 'CRITICAL' : item.verificationStatus === 'SYNTHETIC_TEST_INDICATOR' ? 'SYNTHETIC_TEST_INDICATOR' : 'ACCENT'}>
                          {item.verificationStatus || 'DETERMINISTIC'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <Card padded={false}>
            <EmptyState
              icon={Network}
              title="No Shared Campaign Footprint Yet"
              message="Campaign reconstruction correlates indicators across at least two distinct evidence submissions or across separate cases. Add more evidence items to this investigation or seed the synthetic demonstration campaign to evaluate cross-case attribution."
              action={
                <div className="flex flex-wrap items-center justify-center gap-3">
                  <Link to={`/investigations/${id}/analysis`} className={caseAction}>
                    <Share2 className="h-4 w-4 text-cyan-primary" aria-hidden="true" />
                    Add Evidence
                  </Link>
                  <Button variant="secondary" size="sm" onClick={handleSeedDemo} loading={seedingDemo}>
                    <Sparkles className="h-4 w-4 text-cyan-primary" aria-hidden="true" />
                    Load Demo Campaign
                  </Button>
                </div>
              }
            />
          </Card>
        )}
      </section>
    </div>
  );
};

export default CampaignReconstructionPage;
