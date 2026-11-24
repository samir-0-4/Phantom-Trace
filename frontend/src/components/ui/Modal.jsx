import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Modal = ({
  open,
  onClose,
  title,
  description,
  children,
  className = '',
  maxWidth = 'max-w-lg',
}) => {
  const dialogRef = useRef(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!open) return undefined;

    const dialog = dialogRef.current;
    const previouslyFocused = document.activeElement;
    if (dialog.showModal) dialog.showModal();
    else dialog.setAttribute('open', '');

    return () => {
      if (dialog.close) dialog.close();
      else dialog.removeAttribute('open');
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-label={title ? undefined : 'Confirmation'}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose?.();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
      className={cn(
        'workspace-modal m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] overflow-y-auto overscroll-contain rounded-lg border border-cyber-border-light bg-cyber-surface p-0 text-text-primary',
        maxWidth,
        className
      )}
    >
      <div className="relative p-5 sm:p-6">
        <button
          type="button"
          autoFocus
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-2 top-2 grid size-11 place-items-center rounded-md text-text-secondary hover:bg-cyber-elevated hover:text-text-primary"
        >
          <X className="size-4" aria-hidden="true" />
        </button>

        {(title || description) && (
          <div className="mb-5 space-y-2 pr-8">
            {title && <h2 id={titleId} className="text-lg font-semibold">{title}</h2>}
            {description && <p id={descriptionId} className="page-lede">{description}</p>}
          </div>
        )}

        <div className="min-w-0">{children}</div>
      </div>
    </dialog>,
    document.body
  );
};

export default Modal;
