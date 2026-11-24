import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export const Pagination = ({ page, pageSize, totalElements, totalPages, onPageChange }) => {
  if (!totalElements || totalPages <= 1) {
    return (
      <div className="flex items-center justify-between py-3.5 text-xs text-text-muted font-mono">
        <span>
          {totalElements} item{totalElements === 1 ? '' : 's'}
        </span>
      </div>
    );
  }

  const from = page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalElements);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-3.5 select-none">
      <span className="text-xs text-text-secondary font-mono">
        Showing <span className="text-text-primary font-semibold">{from}</span>–
        <span className="text-text-primary font-semibold">{to}</span> of{' '}
        <span className="text-cyan-primary font-semibold">{totalElements}</span> cases
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className={cn(
            'inline-flex items-center justify-center size-10 rounded-md border border-cyber-border-light bg-cyber-surface text-text-primary',
            'transition-colors hover:bg-cyber-elevated',
            'disabled:opacity-50 disabled:pointer-events-none'
          )}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="text-xs font-mono px-2 py-1 text-text-secondary tabular-nums">
          {page + 1} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className={cn(
            'inline-flex items-center justify-center size-10 rounded-md border border-cyber-border-light bg-cyber-surface text-text-primary',
            'transition-colors hover:bg-cyber-elevated',
            'disabled:opacity-50 disabled:pointer-events-none'
          )}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
