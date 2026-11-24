import { useEffect, useState } from 'react';
import { Server, Shield, AlertCircle, Cpu, Radio } from 'lucide-react';
import Card from '../components/common/Card';
import { FullPageSpinner } from '../components/ui/Spinner';
import { authService } from '../services/auth/authService';

const integrations = [
  { name: 'VirusTotal', note: 'Threat reputation for submitted indicators', icon: Radio },
  { name: 'URLhaus', note: 'Matches submitted URLs against malware distribution records', icon: Server },
  { name: 'Groq AI', note: 'Produces AI assessments for investigation evidence', icon: Cpu },
];

export const SettingsPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    authService
      .getCurrentUser()
      .then((res) => setProfile(res.data))
      .catch(() => setError('Could not load your profile. Please try again.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <FullPageSpinner label="Loading settings & configuration…" />;

  return (
    <div className="min-w-0 max-w-4xl space-y-5">
      <header>
        <h1 className="page-heading">Settings</h1>
        <p className="page-lede">Your analyst profile and the integrations managed by the server.</p>
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

      <Card title="Analyst profile" padded={false}>
        <dl className="divide-y divide-cyber-border text-sm">
          {[
            { label: 'Full name', value: profile?.fullName },
            { label: 'Email', value: profile?.email },
            { label: 'Role', value: profile?.role?.replace('ROLE_', '') },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="grid gap-1 px-4 py-3 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-3"
            >
              <dt className="text-text-secondary">{label}</dt>
              <dd className="min-w-0 break-words font-medium text-text-primary">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <Card
        title="Intelligence feeds & AI engine"
        subtitle="External verification results appear in the evidence workspace."
        padded={false}
        footer={(
          <p className="field-note flex items-start gap-2">
            <Shield className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" />
            Integration credentials are managed by the server.
          </p>
        )}
      >
        <ul className="divide-y divide-cyber-border text-sm">
          {integrations.map(({ name, note, icon: Icon }) => (
            <li
              key={name}
              className="flex items-start gap-3 px-4 py-3"
            >
              <Icon className="mt-0.5 size-4 shrink-0 text-text-muted" aria-hidden="true" />
              <div className="min-w-0 space-y-0.5">
                <p className="font-semibold text-text-primary">{name}</p>
                <p className="field-note">{note}</p>
              </div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
};

export default SettingsPage;
