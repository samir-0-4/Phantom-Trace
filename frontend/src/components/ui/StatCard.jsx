import { cn } from '../../utils/cn';

export const StatCard = ({ icon: Icon, label, value, sub, className = '' }) => (
  <div className={cn('workstation-panel p-4', className)}>
    <div className="flex items-center gap-2 text-sm text-text-secondary">
      {Icon && <Icon className="size-4 shrink-0" aria-hidden="true" />}
      <p>{label}</p>
    </div>
    <p className="mt-2 font-mono text-2xl font-medium tabular-nums text-text-primary">{value}</p>
    {sub && <p className="mt-2 text-xs text-text-muted">{sub}</p>}
  </div>
);

export default StatCard;
