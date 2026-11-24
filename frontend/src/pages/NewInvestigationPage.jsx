import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Textarea from '../components/ui/Textarea';
import { INVESTIGATION_CATEGORY_LIST, categoryLabel } from '../constants';
import { investigationService } from '../services/investigation/investigationService';
import { getApiErrorMessage } from '../services/api/apiClient';

const categoryOptions = [
  { value: '', label: 'Select a category…' },
  ...INVESTIGATION_CATEGORY_LIST.map((c) => ({ value: c, label: categoryLabel(c) })),
];

const categoryDescriptions = {
  JOB_SCAM: 'Fake recruitment, remote task commissions, interview deposit schemes.',
  PAYMENT_SCAM: 'Fraudulent wire requests, QR scams, fake invoices, peer-to-peer demands.',
  PHISHING: 'Credential harvesting, lookalike domains, SMS / WhatsApp spoofing.',
  INVESTMENT_SCAM: 'Pig butchering, crypto trading yield schemes, fraudulent brokers.',
  SHOPPING_SCAM: 'Counterfeit storefronts, non-delivery of goods, payment redirect.',
  IDENTITY_FRAUD: 'Impersonation of authorities, KYC theft, unauthorized account access.',
  SUSPICIOUS_COMMUNICATION: 'Unsolicited threats, extortion emails, cold social contact.',
  OTHER: 'General digital threat or emerging fraudulent vectors.',
};

const validate = ({ title, category }) => {
  const errors = {};
  if (!title || title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
  if (title && title.trim().length > 255) errors.title = 'Title must be under 255 characters';
  if (!category) errors.category = 'Category is required';
  return errors;
};

export const NewInvestigationPage = () => {
  const [fields, setFields] = useState({ title: '', description: '', category: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = (k) => (e) => {
    setFields((f) => ({ ...f, [k]: e.target.value }));
    setErrors((er) => ({ ...er, [k]: '' }));
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const created = await investigationService.create({
        title: fields.title.trim(),
        description: fields.description || undefined,
        category: fields.category,
      });
      navigate(`/investigations/${created.id}`, { replace: true });
    } catch (err) {
      setServerError(getApiErrorMessage(err, 'Failed to create the investigation.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-5 min-w-0">
      <header>
        <Link
          to="/investigations"
          className="text-link mb-3 inline-flex items-center gap-1.5 text-xs"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          <span>Back to investigations</span>
        </Link>
        <h1 className="page-heading">New Investigation</h1>
        <p className="page-lede">Name and categorize the case before attaching evidence.</p>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card title="Case details">
          {serverError && (
            <div
              role="alert"
              className="mb-4 flex items-start gap-2 rounded border border-risk-critical/35 bg-risk-critical/10 px-3 py-2.5 text-sm text-text-primary"
            >
              <AlertCircle className="mt-0.5 size-4 shrink-0 text-risk-critical" aria-hidden="true" />
              <span>{serverError}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label="Investigation title"
              required
              value={fields.title}
              onChange={set('title')}
              placeholder="e.g. Suspicious recruitment messages"
              error={errors.title}
            />
            <div className="space-y-2">
              <Select
                label="Category"
                required
                value={fields.category}
                onChange={set('category')}
                options={categoryOptions}
                error={errors.category}
              />
              {fields.category && categoryDescriptions[fields.category] && (
                <p className="field-note border-l border-cyber-border pl-3">
                  {categoryDescriptions[fields.category]}
                </p>
              )}
            </div>
            <Textarea
              label="Description & context (optional)"
              value={fields.description}
              onChange={set('description')}
              rows={4}
              placeholder="Summarize what was reported and where it was observed…"
            />
            <div className="flex flex-wrap items-center justify-end gap-2 border-t border-cyber-border pt-4">
              <Button as={Link} to="/investigations" variant="secondary">Cancel</Button>
              <Button type="submit" loading={loading} size="md">
                Initialize Case
              </Button>
            </div>
          </form>
        </Card>

        <Card title="After creation">
          <p className="text-sm leading-relaxed text-text-secondary">
            The case opens as a draft. You can then attach messages, emails, URLs, screenshots, or PDFs.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default NewInvestigationPage;
