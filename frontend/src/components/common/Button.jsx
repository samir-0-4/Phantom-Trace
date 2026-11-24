import { cn } from '../../utils/cn';
import { Spinner } from '../ui/Spinner';

const base = 'inline-flex shrink-0 items-center justify-center gap-2 rounded-md border font-semibold transition-colors duration-fast disabled:cursor-not-allowed disabled:opacity-50';

const sizes = {
  xs: 'min-h-8 px-2 text-xs',
  sm: 'min-h-9 px-3 text-xs',
  md: 'min-h-10 px-4 text-sm',
  lg: 'min-h-11 px-4 text-sm',
  icon: 'h-10 w-10',
};

const variants = {
  primary: 'border-transparent bg-cyan-primary text-cyber-canvas hover:bg-cyan-muted',
  secondary: 'border-cyber-border-light bg-cyber-surface text-text-primary hover:bg-cyber-elevated',
  danger: 'border-risk-critical/45 bg-risk-critical/10 text-risk-critical hover:bg-risk-critical/20',
  ghost: 'border-transparent text-text-secondary hover:bg-cyber-elevated hover:text-text-primary',
  outline: 'border-cyber-border-light text-text-primary hover:border-cyan-primary/60 hover:bg-cyan-primary/10',
};

export const Button = ({
  as: Element = 'button',
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) => (
  <Element
    {...(Element === 'button' ? { type, disabled: disabled || loading } : {})}
    aria-busy={loading || undefined}
    className={cn(base, sizes[size] || sizes.md, variants[variant] || variants.primary, className)}
    {...props}
  >
    {loading && <Spinner className="size-4 shrink-0 text-current" />}
    {children}
  </Element>
);

export default Button;
