import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Input = ({
  label,
  id,
  type = 'text',
  error,
  hint,
  icon: Icon,
  className = '',
  required = false,
  disabled = false,
  ...props
}) => {
  const autoId = useId();
  const inputId = id || autoId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const [visible, setVisible] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword && visible ? 'text' : type;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label} {required && <span aria-hidden="true" className="text-text-muted">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3 flex items-center pointer-events-none text-text-muted">
            <Icon className="size-4" aria-hidden="true" />
          </div>
        )}
        <input
          id={inputId}
          type={effectiveType}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={cn(
            'input-field',
            Icon && 'pl-10',
            isPassword && 'pr-11',
            error && 'border-risk-critical',
            className
          )}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            disabled={disabled}
            className="absolute right-1 grid size-10 place-items-center rounded-md text-text-muted transition-colors hover:bg-cyber-elevated hover:text-text-primary"
            aria-label={visible ? 'Hide password' : 'Show password'}
          >
            {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
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

export default Input;
