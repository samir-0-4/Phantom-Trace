import { statusMeta, riskMeta, categoryLabel } from '../../constants';
import Badge from '../common/Badge';

export const StatusBadge = ({ status, className = '' }) => (
  <Badge status={status} dot className={className}>{statusMeta(status).label}</Badge>
);

export const RiskBadge = ({ level, className = '' }) => (
  <Badge status={level} dot className={className}>{riskMeta(level).label} risk</Badge>
);

export const CategoryBadge = ({ category, className = '' }) => (
  <Badge className={className}>{categoryLabel(category)}</Badge>
);

export default StatusBadge;
