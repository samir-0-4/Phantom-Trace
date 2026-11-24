import { useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Select = ({
  label,
  id,
  error,
  hint,
  options = [],
  children,
  className = '',
  required = false,
  disabled = false,
  ...props
}) => {
  const autoId = useId();
  const selectId = id || autoId;
  const errorId = `${selectId}-error`;
  const hintId = `${selectId}-hint`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="input-label">
          {label} {required && <span aria-hidden="true" className="text-text-muted">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        <select
          id={selectId}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            'input-field appearance-none pr-10 cursor-pointer',
            error && 'border-risk-critical',
            className
          )}
          {...props}
        >
          {children ||
            options.map((o) => (
              <option key={o.value} value={o.value} className="bg-cyber-canvas text-text-primary">
                {o.label}
              </option>
            ))}
        </select>
        <ChevronDown className="absolute right-3.5 w-4 h-4 text-text-muted pointer-events-none transition-transform duration-150" />
      </div>
      {error ? (
        <p id={errorId} className="mt-1.5 text-xs text-risk-critical font-medium flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-risk-critical" />
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
};

export default Select;
