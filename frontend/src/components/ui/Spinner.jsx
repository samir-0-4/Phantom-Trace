import { cn } from '../../utils/cn';

export const Spinner = ({ className = '', label }) => (
  <span className="inline-flex items-center gap-2" role={label ? 'status' : undefined}>
    <svg
      className={cn('animate-spin', className || 'size-5 text-cyan-primary')}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
    {label && <span className="text-sm text-text-secondary">{label}</span>}
  </span>
);

export const FullPageSpinner = ({ label = 'Loading…' }) => (
  <div className="flex min-h-56 items-center justify-center" aria-label={label}>
    <Spinner label={label} />
  </div>
);

export default Spinner;
