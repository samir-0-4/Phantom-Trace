import { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../utils/cn';

const TOAST_ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const TOAST_BORDERS = {
  success: 'border-l-epistemic-verified',
  error: 'border-l-risk-critical',
  info: 'border-l-cyan-primary',
};

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        addToast,
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
      }}
    >
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            aria-live="polite"
            className="pointer-events-none fixed inset-x-0 bottom-4 z-toast ml-auto flex w-full max-w-sm flex-col gap-2 px-4 no-print"
          >
            {toasts.map((toast) => {
              const Icon = TOAST_ICONS[toast.type] || Info;
              return (
                <div
                  key={toast.id}
                  className={cn(
                    'workstation-panel pointer-events-auto flex items-start gap-3 border-l-2 p-3 text-text-primary',
                    TOAST_BORDERS[toast.type] || TOAST_BORDERS.info
                  )}
                >
                  <Icon className="mt-1.5 size-4 shrink-0 text-text-secondary" aria-hidden="true" />
                  <p className="flex-1 break-words py-1 text-sm leading-snug">{toast.message}</p>
                  <button
                    type="button"
                    onClick={() => removeToast(toast.id)}
                    className="grid size-9 place-items-center rounded-md text-text-secondary transition-colors hover:bg-cyber-elevated hover:text-text-primary"
                    aria-label="Dismiss notification"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      addToast: () => {},
      success: () => {},
      error: () => {},
    };
  }
  return context;
};

export default ToastProvider;
