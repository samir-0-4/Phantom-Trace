import { cn } from '../../utils/cn';

export const Card = ({
  children,
  title,
  subtitle,
  className = '',
  headerAction,
  footer,
  padded = true,
  interactive = false,
  ...props
}) => (
  <div
    className={cn(
      'workstation-panel',
      interactive && 'transition-colors hover:border-cyber-border-light focus-within:border-cyan-primary',
      className
    )}
    {...props}
  >
    {(title || subtitle || headerAction) && (
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-cyber-border px-4 py-3 sm:px-5">
        <div className="min-w-0 flex-1">
          {title && <h3 className="break-words text-sm font-semibold text-text-primary">{title}</h3>}
          {subtitle && <p className="mt-1 text-xs leading-relaxed text-text-secondary">{subtitle}</p>}
        </div>
        {headerAction && <div className="shrink-0">{headerAction}</div>}
      </div>
    )}
    <div className={cn('min-w-0', padded && 'p-4 sm:p-5')}>{children}</div>
    {footer && <div className="border-t border-cyber-border px-4 py-3 sm:px-5">{footer}</div>}
  </div>
);

export default Card;
