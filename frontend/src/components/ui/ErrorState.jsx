import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../common/Button';
import { cn } from '../../utils/cn';

export const ErrorState = ({
  title = 'Failed to load content',
  message = 'The server could not complete the request.',
  onRetry,
  className = '',
}) => (
  <div role="alert" className={cn('workstation-panel border-l-2 border-l-risk-critical p-4 sm:p-5', className)}>
    <div className="flex items-start gap-3">
      <AlertTriangle className="mt-0.5 size-5 shrink-0 text-risk-critical" aria-hidden="true" />
      <div className="min-w-0">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <p className="mt-1 break-words text-sm text-text-secondary">{message}</p>
        {onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry} className="mt-3">
            <RefreshCw className="size-4" aria-hidden="true" /> Retry
          </Button>
        )}
      </div>
    </div>
  </div>
);

export default ErrorState;
