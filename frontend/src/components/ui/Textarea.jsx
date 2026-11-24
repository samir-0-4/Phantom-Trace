import { useId } from 'react';
import { cn } from '../../utils/cn';

export const Textarea = ({
  label,
  id,
  error,
  hint,
  className = '',
  rows = 4,
  required = false,
  disabled = false,
  ...props
}) => {
  const autoId = useId();
  const areaId = id || autoId;
  const errorId = `${areaId}-error`;
  const hintId = `${areaId}-hint`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={areaId} className="input-label">
          {label} {required && <span aria-hidden="true" className="text-text-muted">*</span>}
        </label>
      )}
      <textarea
        id={areaId}
        rows={rows}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={cn(
          'input-field resize-y min-h-[90px]',
          error && 'border-risk-critical',
          className
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs text-risk-critical font-medium flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-risk-critical" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
};

export default Textarea;
