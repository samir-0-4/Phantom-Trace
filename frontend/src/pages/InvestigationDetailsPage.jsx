import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileSearch,
  FileText,
  GitBranch,
  Network,
  ShieldCheck,
  Trash2,
  Calendar,
  Hash,
  Image,
  Link2,
  Mail,
  Paperclip,
  Clock,
  CheckCircle,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { StatusBadge, RiskBadge, CategoryBadge } from '../components/ui/StatusBadge';
import { FullPageSpinner, Spinner } from '../components/ui/Spinner';
import { useToast } from '../components/ui/Toast';
import { getApiErrorMessage } from '../services/api/apiClient';
import evidenceService from '../services/evidence/evidenceService';
import { investigationService } from '../services/investigation/investigationService';
import { formatDateTime, formatRelative } from '../utils/format';

const evidenceIcons = {
  TEXT_MESSAGE: FileText,
  URL: Link2,
  EMAIL: Mail,
  IMAGE: Image,
  PDF: Paperclip,
};

export const InvestigationDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [investigation, setInvestigation] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [evidenceLoading, setEvidenceLoading] = useState(true);
  const [evidenceError, setEvidenceError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus) => {
    if (!newStatus || !investigation || newStatus === investigation.status) return;
    setUpdatingStatus(true);
    try {
      const updated = await investigationService.update(investigation.id, { status: newStatus });
      setInvestigation((prev) => ({
        ...prev,
        status: updated?.status || newStatus,
        completedAt:
          updated?.completedAt ||
          (newStatus === 'COMPLETED' ? new Date().toISOString() : prev?.completedAt),
      }));
      toast.success(`Case status updated to ${newStatus}`);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update case status'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    investigationService
      .getById(id)
      .then((inv) => {
        setInvestigation(inv);
        setError('');
      })
      .catch((err) => {
        const status = err?.response?.status;
        if (status === 404) setError('Investigation not found.');
        else if (status === 403) setError("You don't have permission to view this investigation.");
        else setError('Failed to load investigation. Please try again.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setEvidenceLoading(true);
    evidenceService
      .list(id)
      .then((items) => {
        setEvidence(items || []);
        setEvidenceError('');
      })
      .catch((err) => setEvidenceError(getApiErrorMessage(err, 'Could not load evidence.')))
      .finally(() => setEvidenceLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this investigation? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await investigationService.remove(id);
      navigate('/investigations', { replace: true });
    } catch {
      setError('Failed to delete the investigation.');
      setDeleting(false);
    }
  };

  if (loading) return <FullPageSpinner label="Loading investigation dossier…" />;

  if (error) {
    return (
      <div className="mx-auto min-w-0 max-w-2xl space-y-4 py-12 text-center">
        <p role="alert" className="font-medium text-text-secondary">{error}</p>
        <Button as={Link} to="/investigations" variant="secondary" size="sm">
          <ArrowLeft className="size-4" aria-hidden="true" /> Back to investigations
        </Button>
      </div>
    );
  }

  const inv = investigation;

  return (
    <div className="min-w-0 max-w-6xl space-y-5">
      <header className="space-y-4">
        <div className="min-w-0">
          <Link
            to="/investigations"
            className="text-link mb-3 inline-flex items-center gap-1.5 text-xs"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" /> All investigations
          </Link>
          <h1 className="page-heading break-words">{inv.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {inv.title?.startsWith('[DEMO]') && <Badge variant="SYNTHETIC_DEMO">Synthetic demo</Badge>}
            <StatusBadge status={inv.status} />
            <RiskBadge level={inv.overallRiskLevel} />
            {inv.category && <CategoryBadge category={inv.category} />}
          </div>
        </div>

        <nav aria-label="Investigation actions" className="flex flex-wrap items-center gap-2 border-y border-cyber-border py-2.5">
          <Button as={Link} to={`/investigations/${id}/analysis`} size="sm">
            <FileSearch className="size-4" aria-hidden="true" /> Add Evidence
          </Button>
          <Button as={Link} to={`/investigations/${id}/results`} variant="secondary" size="sm">
            <ShieldCheck className="size-4" aria-hidden="true" /> View Results
          </Button>
          <Button as={Link} to={`/investigations/${id}/graph`} variant="outline" size="sm">
            <GitBranch className="size-4" aria-hidden="true" /> Graph
          </Button>
          <Button as={Link} to={`/investigations/${id}/campaign`} variant="outline" size="sm">
            <Network className="size-4" aria-hidden="true" /> Campaign
          </Button>
          <Button as={Link} to={`/investigations/${id}/report`} variant="outline" size="sm">
            <FileText className="size-4" aria-hidden="true" /> Report
          </Button>
        </nav>
      </header>

      <div className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,0.47fr)]">
        <div className="min-w-0 space-y-4">
          {inv.description && (
            <Card title="Case Description & Context">
              <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-text-secondary">
                {inv.description}
              </p>
            </Card>
          )}

          <Card
            title={`Evidence dossier${evidence.length ? ` (${evidence.length})` : ''}`}
            padded={false}
          >
            {evidenceLoading ? (
              <div className="flex justify-center py-8">
                <Spinner className="size-5 text-cyan-primary" label="Loading evidence…" />
              </div>
            ) : evidenceError ? (
              <p role="alert" className="p-4 text-sm text-risk-critical">
                {evidenceError}
              </p>
            ) : evidence.length === 0 ? (
              <div className="space-y-3 px-4 py-6 text-center text-text-secondary">
                <FileSearch className="mx-auto size-5 text-text-muted" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-text-primary">No evidence submitted yet.</p>
                  <p className="field-note">Add messages, URLs, or files to begin analysis.</p>
                </div>
                <Button as={Link} to={`/investigations/${id}/analysis`} variant="outline" size="xs">
                  Add first evidence item
                </Button>
              </div>
            ) : (
              <ul className="divide-y divide-cyber-border">
                {evidence.map((item) => {
                  const Icon = evidenceIcons[item.evidenceType] || Paperclip;
                  const label =
                    item.originalFilename ||
                    item.url ||
                    item.subject ||
                    item.textContent ||
                    item.extractedContent ||
                    'Evidence item';
                  return (
                    <li key={item.id} className="flex items-start gap-3 px-4 py-3">
                      <Icon className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" />
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-xs font-semibold text-text-primary">
                            {item.evidenceType?.replaceAll('_', ' ') || 'Evidence'}
                          </p>
                          {item.status && <Badge status={item.status} />}
                        </div>
                        <p className="truncate font-mono text-xs text-text-secondary" title={label}>
                          {label}
                        </p>
                        <time className="field-note block" dateTime={item.createdAt}>
                          Submitted {formatDateTime(item.createdAt)}
                        </time>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>

        <Card
          title="Case metadata"
          padded={false}
          footer={(
            <div className="flex flex-wrap items-center gap-2">
              {inv.status !== 'COMPLETED' && (
                <Button
                  variant="outline"
                  size="sm"
                  loading={updatingStatus}
                  onClick={() => handleStatusChange('COMPLETED')}
                  title="Mark investigation as completed"
                >
                  <CheckCircle className="size-4" aria-hidden="true" /> Mark Complete
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                loading={deleting}
                onClick={handleDelete}
                title="Delete investigation"
                aria-label="Delete investigation"
                className="text-risk-critical hover:text-risk-critical"
              >
                <Trash2 className="size-4" aria-hidden="true" /> Delete
              </Button>
            </div>
          )}
        >
          <dl className="divide-y divide-cyber-border text-xs sm:text-sm">
            <div className="space-y-1 px-4 py-2.5">
              <dt className="flex items-center gap-1.5 text-text-secondary">
                <Hash className="size-3.5 text-text-muted" aria-hidden="true" /> Case ID
              </dt>
              <dd className="break-all font-mono text-2xs text-text-primary">{inv.id}</dd>
            </div>

            <div className="flex items-center justify-between gap-2 px-4 py-2.5">
              <dt className="text-text-secondary">Status</dt>
              <dd className="flex items-center gap-2">
                <select
                  value={inv.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={updatingStatus}
                  aria-label="Update investigation status"
                  className="cursor-pointer rounded border border-cyber-border bg-cyber-subtle px-2 py-1.5 font-mono text-xs text-text-primary"
                >
                  <option value="DRAFT">DRAFT</option>
                  <option value="PENDING">PENDING</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
                {updatingStatus && <Spinner className="size-3.5 text-cyan-primary" />}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-2 px-4 py-2.5">
              <dt className="text-text-secondary">Risk Assessment</dt>
              <dd>
                <RiskBadge level={inv.overallRiskLevel} />
              </dd>
            </div>

            <div className="flex items-center justify-between gap-2 px-4 py-2.5">
              <dt className="text-text-secondary">Risk Score</dt>
              <dd className="font-mono font-semibold text-text-primary">
                {inv.riskScore != null ? `${inv.riskScore}/100` : '—'}
              </dd>
            </div>

            <div className="flex items-center justify-between gap-2 px-4 py-2.5">
              <dt className="text-text-secondary">Evidence Count</dt>
              <dd className="font-mono text-text-primary">{inv.evidenceCount || 0} items</dd>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-4 py-2.5">
              <dt className="flex items-center gap-1.5 text-text-secondary">
                <Calendar className="size-3.5 text-text-muted" aria-hidden="true" /> Created
              </dt>
              <dd className="text-xs tabular-nums text-text-primary">
                <time dateTime={inv.createdAt}>{formatDateTime(inv.createdAt)}</time>
              </dd>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-4 py-2.5">
              <dt className="flex items-center gap-1.5 text-text-secondary">
                <Clock className="size-3.5 text-text-muted" aria-hidden="true" /> Last updated
              </dt>
              <dd className="text-xs tabular-nums text-text-primary">
                <time dateTime={inv.updatedAt} title={formatDateTime(inv.updatedAt)}>{formatRelative(inv.updatedAt)}</time>
              </dd>
            </div>

            {inv.completedAt && (
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1 px-4 py-2.5">
                <dt className="text-text-secondary">Completed at</dt>
                <dd className="text-xs tabular-nums text-text-primary">
                  <time dateTime={inv.completedAt}>{formatDateTime(inv.completedAt)}</time>
                </dd>
              </div>
            )}
          </dl>
        </Card>
      </div>
    </div>
  );
};

export default InvestigationDetailsPage;
