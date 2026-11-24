import { Handle, Position } from '@xyflow/react';
import {
  AtSign,
  CircleHelp,
  FileText,
  Globe2,
  Hash,
  Link2,
  Mail,
  MessageSquare,
  Network,
  QrCode,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { titleCase } from '../../utils/format';

const icons = {
  INVESTIGATION: Target,
  MESSAGE: MessageSquare,
  URL: Link2,
  DOMAIN: Globe2,
  EMAIL: Mail,
  EMAIL_ADDRESS: AtSign,
  IP_ADDRESS: Hash,
  FILE: FileText,
  QR_DESTINATION: QrCode,
  THREAT_INDICATOR: ShieldAlert,
};

const typeStyles = {
  INVESTIGATION: 'bg-cyan-primary/15 text-cyan-primary',
  MESSAGE: 'bg-cyan-primary/10 text-cyan-primary',
  EMAIL: 'bg-cyan-primary/10 text-cyan-primary',
  FILE: 'bg-cyan-primary/10 text-cyan-primary',
};

const handleClass = '!h-2.5 !w-2.5 !border-2 !border-cyber-canvas !bg-cyan-primary';

export const InvestigationNode = ({ data, selected }) => {
  const Icon = icons[data.type] || Network;
  const status = data.verificationStatus || 'UNKNOWN';
  const verified = ['DIRECT', 'DIRECTLY_EXTRACTED', 'DETERMINISTICALLY_MATCHED', 'EXTERNALLY_VERIFIED'].includes(status);
  const inferred = ['AI_INFERENCE', 'AI_SUGGESTED'].includes(status);
  const threat = ['VERIFIED_MALICIOUS', 'VERIFIED_SUSPICIOUS'].includes(status);
  const StatusIcon = verified ? ShieldCheck : inferred ? Sparkles : threat ? ShieldAlert : CircleHelp;

  return (
    <div
      data-testid={`graph-node-${data.id}`}
      className={cn(
        'w-56 select-none rounded-lg border bg-cyber-card px-3 py-3 text-text-primary transition-colors',
        selected ? 'border-cyan-primary ring-1 ring-cyan-primary' : 'border-cyber-border',
        'group-focus-visible:ring-2 group-focus-visible:ring-cyan-primary'
      )}
    >
      <Handle type="target" position={Position.Left} className={handleClass} />
      <div className="flex items-start gap-2.5">
        <span className={cn(
          'grid h-8 w-8 shrink-0 place-items-center rounded-md',
          typeStyles[data.type] || 'bg-cyber-elevated text-text-secondary'
        )}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-2xs font-medium text-text-secondary">{titleCase(data.type)}</p>
          <p className="mt-0.5 line-clamp-2 break-all font-mono text-xs font-semibold leading-[1.125rem]" title={data.label}>
            {data.label}
          </p>
        </div>
      </div>
      <div className="mt-2.5 flex items-center gap-1.5 border-t border-cyber-border pt-2 text-2xs text-text-secondary">
        <StatusIcon
          className={cn(
            'h-3.5 w-3.5 shrink-0',
            verified && 'text-epistemic-verified',
            inferred && 'text-epistemic-inference',
            status === 'VERIFIED_MALICIOUS' && 'text-risk-critical',
            status === 'VERIFIED_SUSPICIOUS' && 'text-risk-high'
          )}
          aria-hidden="true"
        />
        {titleCase(status)}
      </div>
      <Handle type="source" position={Position.Right} className={handleClass} />
    </div>
  );
};

export default InvestigationNode;
