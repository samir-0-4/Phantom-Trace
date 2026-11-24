import { cn } from '../../utils/cn';

export const EmptyState = ({
  icon: Icon,
  title,
  message,
  action,
  className = '',
}) => (
  <div className={cn('min-w-0 px-4 py-8 text-center sm:px-6', className)}>
    {Icon && <Icon className="mx-auto mb-3 size-6 text-text-muted" aria-hidden="true" />}
    {title && <h3 className="text-base font-semibold text-text-primary">{title}</h3>}
    {message && <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-text-secondary">{message}</p>}
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export default EmptyState;
