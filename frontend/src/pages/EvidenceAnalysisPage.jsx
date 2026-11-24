import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Image,
  Link2,
  Mail,
  Paperclip,
  Trash2,
  Upload,
  AlertCircle,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import { EVIDENCE_TYPES, EVIDENCE_TYPE_OPTIONS } from '../constants';
import { getApiErrorMessage } from '../services/api/apiClient';
import evidenceService from '../services/evidence/evidenceService';
import { investigationService } from '../services/investigation/investigationService';
import { formatDateTime } from '../utils/format';

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const FILE_ACCEPT = {
  IMAGE: 'image/png,image/jpeg,image/webp',
  PDF: 'application/pdf',
};

const initialFields = {
  evidenceType: EVIDENCE_TYPES.TEXT_MESSAGE,
  textContent: '',
  url: '',
  senderAddress: '',
  subject: '',
  emailBody: '',
  emailHeaders: '',
  description: '',
};

const validateUrl = (value) => {
  try {
    const parsed = new URL(value);
    return ['http:', 'https:'].includes(parsed.protocol) && Boolean(parsed.hostname);
  } catch {
    return false;
  }
};

const validateFields = (fields) => {
  const errors = {};
  if (fields.evidenceType === EVIDENCE_TYPES.TEXT_MESSAGE && !fields.textContent.trim()) {
    errors.textContent = 'Message content is required';
  }
  if (fields.evidenceType === EVIDENCE_TYPES.URL) {
    if (!fields.url.trim()) errors.url = 'URL is required';
    else if (!validateUrl(fields.url.trim())) errors.url = 'Enter a valid HTTP or HTTPS URL';
  }
  if (fields.evidenceType === EVIDENCE_TYPES.EMAIL) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.senderAddress.trim())) {
      errors.senderAddress = 'Enter a valid sender address';
    }
    if (!fields.subject.trim()) errors.subject = 'Subject is required';
    if (!fields.emailBody.trim()) errors.emailBody = 'Email body is required';
  }
  return errors;
};

const typeIcon = {
  TEXT_MESSAGE: FileText,
  URL: Link2,
  EMAIL: Mail,
  IMAGE: Image,
  PDF: Paperclip,
};

const EvidenceRow = ({ item, onRemove, removing }) => {
  const Icon = typeIcon[item.evidenceType] || Paperclip;
  const contentDisplay =
    item.originalFilename || item.url || item.subject || item.textContent || item.extractedContent || 'Evidence item';

  return (
    <li className="flex items-start justify-between gap-2 px-4 py-3">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Icon className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" />
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold text-text-primary">
              {item.evidenceType?.replaceAll('_', ' ') || 'Evidence'}
            </p>
            {item.status && <Badge status={item.status} />}
          </div>
          <p className="truncate font-mono text-xs text-text-secondary" title={contentDisplay}>
            {contentDisplay}
          </p>
          <time className="field-note block" dateTime={item.createdAt}>
            Submitted {formatDateTime(item.createdAt)}
          </time>
        </div>
      </div>
      <Button
        variant="ghost"
        size="xs"
        onClick={() => onRemove(item.id)}
        loading={removing === item.id}
        aria-label={`Remove ${item.evidenceType}`}
        title="Remove evidence"
        className="shrink-0 text-text-muted hover:text-risk-critical"
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </Button>
    </li>
  );
};

export const EvidenceAnalysisPage = () => {
  const { id } = useParams();
  const fileInputRef = useRef(null);
  const [investigation, setInvestigation] = useState(null);
  const [evidence, setEvidence] = useState([]);
  const [fields, setFields] = useState(initialFields);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [removing, setRemoving] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [threatResults, setThreatResults] = useState([]);
  const [threatLoading, setThreatLoading] = useState(false);

  const load = useCallback(async () => {
    const [caseData, evidenceData] = await Promise.all([
      investigationService.getById(id),
      evidenceService.list(id),
    ]);
    setInvestigation(caseData);
    setEvidence(evidenceData || []);
  }, [id]);

  useEffect(() => {
    load()
      .catch((err) => setError(getApiErrorMessage(err, 'Could not load this investigation.')))
      .finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    if (!file || fields.evidenceType !== EVIDENCE_TYPES.IMAGE) {
      setPreviewUrl('');
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file, fields.evidenceType]);

  const updateField = (name) => (event) => {
    setFields((current) => ({ ...current, [name]: event.target.value }));
    setFieldErrors((current) => ({ ...current, [name]: '' }));
    setError('');
  };

  const selectFile = (selected) => {
    const next = selected?.[0];
    if (!next) return;
    const allowed =
      fields.evidenceType === EVIDENCE_TYPES.IMAGE
        ? ['image/png', 'image/jpeg', 'image/webp']
        : ['application/pdf'];
    if (!allowed.includes(next.type)) {
      setError('Unsupported file type for the selected evidence type.');
      setFile(null);
      return;
    }
    if (next.size > MAX_FILE_SIZE) {
      setError('Files must be 25 MB or smaller.');
      setFile(null);
      return;
    }
    setError('');
    setFile(next);
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors =
      fields.evidenceType === EVIDENCE_TYPES.IMAGE || fields.evidenceType === EVIDENCE_TYPES.PDF
        ? !file
          ? { file: 'Select a file to upload' }
          : {}
        : validateFields(fields);
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors);
      return;
    }
    setSubmitting(true);
    setProgress(0);
    setError('');
    try {
      const metadata = { ...fields };
      if (fields.evidenceType === EVIDENCE_TYPES.IMAGE || fields.evidenceType === EVIDENCE_TYPES.PDF) {
        await evidenceService.createFile(id, metadata, file, (e) => {
          if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
        });
      } else {
        await evidenceService.create(id, metadata);
      }
      await investigationService.generateGraph(id);
      setEvidence(await evidenceService.list(id));
      setFields(initialFields);
      setFile(null);
      setFieldErrors({});
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setError(getApiErrorMessage(err, 'Evidence could not be submitted.'));
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (evidenceId) => {
    setRemoving(evidenceId);
    setError('');
    try {
      await evidenceService.remove(evidenceId);
      setEvidence((items) => items.filter((item) => item.id !== evidenceId));
    } catch (err) {
      setError(getApiErrorMessage(err, 'Evidence could not be removed.'));
    } finally {
      setRemoving('');
    }
  };

  const runThreatLookups = async () => {
    setThreatLoading(true);
    setError('');
    try {
      const urlEvidence = evidence.filter(
        (item) => item.evidenceType === EVIDENCE_TYPES.URL || item.url
      );
      const results = await Promise.all(
        urlEvidence.map((item) => evidenceService.lookupThreats(item.id))
      );
      setThreatResults(results.flat());
    } catch (err) {
      setError(getApiErrorMessage(err, 'External verification is currently unavailable.'));
    } finally {
      setThreatLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24 min-w-0">
        <Spinner className="size-6 text-cyan-primary" label="Loading evidence workspace…" />
      </div>
    );
  }

  return (
    <div className="min-w-0 max-w-6xl space-y-5">
      <header>
        <Link
          to={`/investigations/${id}`}
          className="text-link mb-3 inline-flex items-center gap-1.5 text-xs"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" /> Back to investigation
        </Link>
        <h1 className="page-heading">Evidence workspace</h1>
        {investigation?.title && <p className="page-lede break-words">{investigation.title}</p>}
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded border border-risk-critical/35 bg-risk-critical/10 p-3 text-sm text-text-primary"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-risk-critical" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      <section
        aria-label="Evidence intake and submissions"
        className="grid min-w-0 items-start gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
      >
        <div className="min-w-0">
          <Card title="Add evidence">
            <form onSubmit={submit} className="space-y-4" noValidate>
              <Select
                label="Evidence type"
                value={fields.evidenceType}
                onChange={(event) => {
                  setFields({ ...initialFields, evidenceType: event.target.value });
                  setFile(null);
                  setPreviewUrl('');
                  setFieldErrors({});
                  setError('');
                }}
                options={EVIDENCE_TYPE_OPTIONS}
              />

              {fields.evidenceType === EVIDENCE_TYPES.TEXT_MESSAGE && (
                <Textarea
                  label="Message content"
                  required
                  rows={5}
                  value={fields.textContent}
                  onChange={updateField('textContent')}
                  error={fieldErrors.textContent}
                  placeholder="Paste the message as received…"
                />
              )}

              {fields.evidenceType === EVIDENCE_TYPES.URL && (
                <Input
                  label="URL"
                  required
                  type="url"
                  value={fields.url}
                  onChange={updateField('url')}
                  error={fieldErrors.url}
                  placeholder="https://example.com/link"
                />
              )}

              {fields.evidenceType === EVIDENCE_TYPES.EMAIL && (
                <div className="space-y-3">
                  <Input
                    label="Sender address"
                    required
                    type="email"
                    value={fields.senderAddress}
                    onChange={updateField('senderAddress')}
                    error={fieldErrors.senderAddress}
                    placeholder="sender@example.com"
                  />
                  <Input
                    label="Subject"
                    required
                    value={fields.subject}
                    onChange={updateField('subject')}
                    error={fieldErrors.subject}
                    placeholder="Subject from the original email"
                  />
                  <Textarea
                    label="Email body"
                    required
                    rows={5}
                    value={fields.emailBody}
                    onChange={updateField('emailBody')}
                    error={fieldErrors.emailBody}
                    placeholder="Paste the email body as received…"
                  />
                  <Textarea
                    label="Headers (optional)"
                    rows={3}
                    value={fields.emailHeaders}
                    onChange={updateField('emailHeaders')}
                    placeholder="Received: from mail.example.com..."
                  />
                </div>
              )}

              {(fields.evidenceType === EVIDENCE_TYPES.IMAGE ||
                fields.evidenceType === EVIDENCE_TYPES.PDF) && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault();
                      selectFile(event.dataTransfer.files);
                    }}
                    className="w-full min-w-0 rounded border border-dashed border-cyber-border bg-cyber-subtle p-4 text-center transition-colors hover:border-cyan-primary hover:bg-cyber-elevated"
                  >
                    <Upload className="mx-auto mb-2 size-5 text-text-muted" aria-hidden="true" />
                    <span className="block break-words text-sm font-semibold text-text-primary">
                      {file ? file.name : 'Drop or select a file'}
                    </span>
                    <span className="field-note mt-1 block">
                      {fields.evidenceType === EVIDENCE_TYPES.PDF
                        ? 'PDF document'
                        : 'PNG, JPG, JPEG, or WEBP'}{' '}
                      · max 25 MB
                    </span>
                    {previewUrl && (
                      <img
                        src={previewUrl}
                        alt="Selected evidence preview"
                        className="mx-auto mt-3 max-h-36 rounded border border-cyber-border object-contain"
                      />
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    aria-label="Select evidence file"
                    accept={FILE_ACCEPT[fields.evidenceType]}
                    onChange={(event) => selectFile(event.target.files)}
                    className="hidden"
                  />
                  {fieldErrors.file && (
                    <p role="alert" className="text-xs font-medium text-risk-critical">{fieldErrors.file}</p>
                  )}
                </div>
              )}

              <Textarea
                label="Description (optional)"
                rows={2}
                value={fields.description}
                onChange={updateField('description')}
                placeholder="Where and how was this item received?"
              />

              {submitting && progress > 0 && (
                <div
                  role="progressbar"
                  aria-label="Evidence upload"
                  aria-valuenow={progress}
                  className="h-1.5 overflow-hidden rounded-full bg-cyber-elevated"
                >
                  <div
                    className="h-full bg-cyan-primary transition-[width] duration-fast"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}

              <div className="flex justify-end border-t border-cyber-border pt-4">
                <Button type="submit" loading={submitting}>Add evidence</Button>
              </div>
            </form>
          </Card>
        </div>

        <div className="min-w-0">
          <Card
            title={`Evidence submitted (${evidence.length})`}
            padded={false}
          >
            {evidence.length === 0 ? (
              <EmptyState
                icon={Paperclip}
                title="No evidence yet"
                message="Submitted items will appear here with their source type and intake time."
              />
            ) : (
              <ul className="divide-y divide-cyber-border">
                {evidence.map((item) => (
                  <EvidenceRow
                    key={item.id}
                    item={item}
                    onRemove={remove}
                    removing={removing}
                  />
                ))}
              </ul>
            )}
          </Card>
        </div>
      </section>

      <Card
        title="Threat intelligence"
        subtitle="Optional external verification. Unavailable providers are never treated as clean."
        padded={false}
        headerAction={
          <Button
            variant="secondary"
            size="sm"
            onClick={runThreatLookups}
            loading={threatLoading}
          >
            Verify URLs
          </Button>
        }
      >
        {threatResults.length === 0 ? (
          <EmptyState
            icon={Link2}
            title="No external results yet"
            message="Run verification for submitted URL evidence when provider credentials are configured."
          />
        ) : (
          <ul className="divide-y divide-cyber-border">
            {threatResults.map((result) => (
              <li key={result.id} className="space-y-2 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-text-primary">
                    {result.provider}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant={result.threatStatus}>
                      {result.threatStatus?.replaceAll('_', ' ')}
                    </Badge>
                    {(result.providerReference === 'SYNTHETIC_TEST_INDICATOR' ||
                      result.resultDetails?.includes('SYNTHETIC_TEST_INDICATOR')) && (
                      <Badge variant="SYNTHETIC_TEST_INDICATOR">Synthetic Test Indicator</Badge>
                    )}
                  </div>
                </div>
                <p className="break-all font-mono text-xs text-text-primary">{result.indicator}</p>
                <p className="field-note break-words">
                  {result.errorMessage ||
                    result.resultDetails ||
                    'No additional provider details were reported.'}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default EvidenceAnalysisPage;
