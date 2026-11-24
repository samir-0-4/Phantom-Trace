import { cn } from '../../utils/cn';

const tones = {
  neutral: 'border-cyber-border-light bg-cyber-elevated text-text-secondary',
  accent: 'border-cyan-primary/30 bg-cyan-primary/10 text-cyan-primary',
  verified: 'border-epistemic-verified/30 bg-epistemic-verified/10 text-epistemic-verified',
  inference: 'border-epistemic-inference/30 bg-epistemic-inference/10 text-epistemic-inference',
  high: 'border-risk-high/30 bg-risk-high/10 text-risk-high',
  critical: 'border-risk-critical/30 bg-risk-critical/10 text-risk-critical',
  synthetic: 'border-dashed border-cyber-border-light text-text-secondary',
};

const statusTones = {
  VERIFIED: 'verified',
  AI_INFERENCE: 'inference',
  INFERENCE: 'inference',
  UNKNOWN: 'neutral',
  LOW: 'verified',
  MEDIUM: 'inference',
  MODERATE: 'inference',
  HIGH: 'high',
  CRITICAL: 'critical',
  COMPLETED: 'verified',
  PROCESSING: 'accent',
  PENDING: 'inference',
  FAILED: 'critical',
  ACCENT: 'accent',
  PURPLE: 'synthetic',
  SYNTHETIC_DEMO: 'synthetic',
  SYNTHETIC_DEMO_CAMPAIGN: 'synthetic',
  SYNTHETIC_TEST_INDICATOR: 'synthetic',
};

export const Badge = ({ status, children, variant, dot = false, className = '' }) => {
  const key = (variant || status || '').toUpperCase();

  return (
    <span
      className={cn(
        'inline-flex max-w-full items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-2xs font-medium',
        tones[statusTones[key] || 'neutral'],
        className
      )}
    >
      {dot && <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-current" />}
      <span className="min-w-0 break-all">{children ?? status}</span>
    </span>
  );
};

export default Badge;
