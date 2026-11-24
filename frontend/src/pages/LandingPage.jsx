import { Link } from 'react-router-dom';
import { ArrowRight, FileCheck, FileInput, FileText, GitFork, Link2, ScanLine } from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { useAuth } from '../hooks/useAuth';

const workflow = [
  { icon: FileInput, title: 'Collect evidence', description: 'Record suspicious messages, emails, links or files in one investigation.' },
  { icon: ScanLine, title: 'Inspect indicators', description: 'Review extracted indicators and request external checks or AI analysis when needed.' },
  { icon: GitFork, title: 'Reconstruct campaigns', description: 'Follow shared indicators across cases and inspect the source of each relationship.' },
  { icon: FileText, title: 'Share a dossier', description: 'Generate a printable snapshot of the investigation and its findings.' },
];

const verification = [
  { status: 'VERIFIED', description: 'A fact backed by recorded evidence or a verification source.' },
  { status: 'AI_INFERENCE', description: 'An interpretation from an analysis agent for an analyst to review.' },
  { status: 'UNKNOWN', description: 'A question the available evidence or sources have yet to resolve.' },
];

const EvidenceModel = () => (
  <figure className="min-w-0 overflow-hidden rounded-lg border border-cyber-border bg-cyber-subtle">
    <figcaption className="flex items-center gap-2 border-b border-cyber-border px-4 py-3 text-sm font-medium sm:px-5">
      <GitFork className="size-4 text-cyan-primary" aria-hidden="true" />
      How evidence connects
    </figcaption>
    <ol className="space-y-0 p-4 sm:p-5">
      <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
        <span className="grid size-8 place-items-center rounded-md border border-cyber-border bg-cyber-surface text-text-secondary">
          <FileInput className="size-4" aria-hidden="true" />
        </span>
        <div className="rounded-md border border-cyber-border bg-cyber-surface px-3 py-2">
          <p className="text-sm font-semibold">Submitted evidence</p>
          <p className="mt-1 text-xs text-text-secondary">Message, email or file</p>
        </div>
      </li>
      <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
        <span aria-hidden="true" className="mx-auto h-full w-px bg-cyber-border-light" />
        <p className="section-label py-2">Extracts</p>
      </li>
      <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
        <span className="grid size-8 place-items-center rounded-md border border-cyan-primary/40 bg-cyan-primary/10 text-cyan-primary">
          <Link2 className="size-4" aria-hidden="true" />
        </span>
        <div className="rounded-md border border-cyan-primary/40 bg-cyan-primary/10 px-3 py-2">
          <p className="text-sm font-semibold text-cyan-primary">Shared indicator</p>
          <p className="mt-1 text-xs text-text-secondary">URL, domain or IP address</p>
        </div>
      </li>
      <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
        <span aria-hidden="true" className="mx-auto h-full w-px border-l border-dashed border-cyan-primary/60" />
        <p className="section-label py-2">Links to</p>
      </li>
      <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
        <span className="grid size-8 place-items-center rounded-md border border-cyber-border bg-cyber-surface text-text-secondary">
          <FileCheck className="size-4" aria-hidden="true" />
        </span>
        <div className="rounded-md border border-cyber-border bg-cyber-surface px-3 py-2">
          <p className="text-sm font-semibold">Related investigation</p>
          <p className="mt-1 text-xs text-text-secondary">Trace the relationship back to its source</p>
        </div>
      </li>
    </ol>
  </figure>
);

export const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const primaryHref = isAuthenticated ? '/investigations/new' : '/register';
  const secondaryHref = isAuthenticated ? '/dashboard' : '/login';

  return (
    <div>
      <section className="grid min-w-0 items-center gap-8 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16 lg:py-16">
        <div className="max-w-4xl min-w-0">
          <p className="section-label text-cyan-primary">Forensic intelligence workstation</p>
          <h1 className="mt-3 max-w-[12ch] text-4xl font-semibold leading-[1.08] tracking-[-0.04em] text-text-primary sm:text-5xl lg:text-6xl">
            Investigate Before You Trust
          </h1>
          <p className="mt-4 max-w-[46ch] text-base leading-relaxed text-text-secondary">
            Connect suspicious messages, URLs and domains across cases. Follow each link back to its source and share what the evidence supports.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button as={Link} to={primaryHref} size="lg">
              {isAuthenticated ? 'New Investigation' : 'Create Account'} <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button as={Link} to={secondaryHref} size="lg" variant="secondary">
              {isAuthenticated ? 'Open Dashboard' : 'Sign In'}
            </Button>
          </div>
        </div>
        <EvidenceModel />
      </section>

      <section className="border-t border-cyber-border py-8 sm:py-10" aria-labelledby="workflow">
        <h2 id="workflow" className="text-2xl font-semibold tracking-tight">From intake to report</h2>
        <ol className="mt-5 grid gap-y-5 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4">
          {workflow.map(({ icon: Icon, title, description }) => (
            <li className="border-t border-cyber-border pt-4" key={title}>
              <Icon className="size-5 text-cyan-primary" aria-hidden="true" />
              <h3 className="mt-2 text-sm font-semibold">{title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-text-secondary">{description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid gap-4 border-t border-cyber-border py-8 sm:py-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] md:gap-8" aria-labelledby="verification">
        <div>
          <h2 id="verification" className="text-2xl font-semibold tracking-tight">Know what the evidence supports</h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">Trace what each conclusion is based on when you review a case or share a report.</p>
        </div>
        <dl className="workstation-panel divide-y divide-cyber-border">
          {verification.map(({ status, description }) => (
            <div key={status} className="grid gap-2 px-4 py-3 sm:grid-cols-[9rem_minmax(0,1fr)] sm:items-start">
              <dt><Badge status={status} /></dt>
              <dd className="text-sm leading-relaxed text-text-secondary">{description}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-t border-cyber-border py-8 sm:py-10" aria-labelledby="handling">
        <h2 id="handling" className="text-2xl font-semibold tracking-tight">Evidence handling</h2>
        <p className="mt-2 max-w-prose text-sm leading-relaxed text-text-secondary">
          Uploaded files are handled as evidence. Optional external AI analysis requires consent. Feed results that cannot be verified retain an unknown status.
        </p>
      </section>
    </div>
  );
};

export default LandingPage;
