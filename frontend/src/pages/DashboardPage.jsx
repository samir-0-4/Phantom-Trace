import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderSearch,
  CheckCircle2,
  ShieldAlert,
  FileStack,
  PlusCircle,
  ChevronRight,
  Clock,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { StatusBadge, RiskBadge, CategoryBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { ErrorState } from '../components/ui/ErrorState';
import { Skeleton } from '../components/ui/Skeleton';
import { investigationService } from '../services/investigation/investigationService';
import { formatDateTime, formatRelative } from '../utils/format';
import { useAuth } from '../hooks/useAuth';

const RISK_HIGH = new Set(['HIGH', 'CRITICAL']);

const deriveStats = (content, totalElements) => ({
  total: totalElements,
  completed: content.filter((i) => i.status === 'COMPLETED').length,
  highRisk: content.filter((i) => RISK_HIGH.has(i.overallRiskLevel)).length,
  evidenceTotal: content.reduce((sum, i) => sum + (i.evidenceCount || 0), 0),
});

export const DashboardPage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [hasDemoData, setHasDemoData] = useState(false);

  const fetchDashboard = useCallback(() => {
    setLoading(true);
    Promise.all([
      investigationService.list({ page: 0, size: 100, sort: 'createdAt,desc' }),
      Promise.resolve(investigationService.getDemoStatus?.()).catch(() => ({ hasDemoData: false })),
    ])
      .then(([res, demoStatus]) => {
        setPage(res);
        setHasDemoData(Boolean(demoStatus?.hasDemoData));
        setError('');
      })
      .catch(() => setError('Could not load investigations. Check the backend is running.'))
      .finally(() => setLoading(false));
  }, []);

  const handleSeedDemo = async () => {
    setSeedingDemo(true);
    try {
      await investigationService.seedDemoCampaign();
      fetchDashboard();
    } catch {
      setError('Failed to seed demo campaign.');
    } finally {
      setSeedingDemo(false);
    }
  };

  const handleResetDemo = async () => {
    setSeedingDemo(true);
    try {
      await investigationService.resetDemoCampaign();
      fetchDashboard();
    } catch {
      setError('Failed to reset demo campaign.');
    } finally {
      setSeedingDemo(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (loading) {
    return (
      <div className="min-w-0 space-y-5" aria-busy="true" aria-label="Loading dashboard">
        <div className="flex flex-wrap items-center justify-between gap-4 py-1">
          <div className="space-y-2">
            <Skeleton className="h-8 w-48 rounded" />
            <Skeleton className="h-4 w-40 rounded" />
          </div>
          <Skeleton className="h-9 w-40 rounded" />
        </div>
        <div className="workstation-panel grid grid-cols-2 divide-x divide-cyber-border sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2 p-3 sm:p-4">
              <Skeleton className="h-3 w-24 max-w-full rounded" />
              <Skeleton className="h-7 w-12 rounded" />
            </div>
          ))}
        </div>
        <Card title="Recent Investigations" padded={false}>
          <div className="divide-y divide-cyber-border">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 px-4 py-3.5">
                <div className="min-w-0 space-y-2">
                  <Skeleton className="h-4 w-48 max-w-full rounded" />
                  <Skeleton className="h-3 w-24 rounded" />
                </div>
                <Skeleton className="h-5 w-[4.5rem] rounded" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const content = page?.content || [];
  const totalElements = page?.totalElements ?? 0;
  const stats = deriveStats(content, totalElements);
  const recent = content.slice(0, 8);
  const metrics = [
    { icon: FolderSearch, label: 'Total Investigations', value: stats.total },
    { icon: CheckCircle2, label: 'Completed', value: stats.completed },
    { icon: ShieldAlert, label: 'High-Risk Cases', value: stats.highRisk, alert: stats.highRisk > 0 },
    { icon: FileStack, label: 'Evidence Items', value: stats.evidenceTotal },
  ];

  return (
    <div className="min-w-0 space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 className="page-heading">Dashboard</h1>
          <p className="page-lede">Welcome back, {user?.fullName?.split(' ')[0] || 'Analyst'}.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {hasDemoData ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetDemo}
              loading={seedingDemo}
            >
              <RotateCcw className="size-3.5" aria-hidden="true" />
              <span>Reset Demo</span>
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSeedDemo}
              loading={seedingDemo}
            >
              <Sparkles className="size-3.5 text-cyan-primary" aria-hidden="true" />
              <span>Load Demo Campaign</span>
            </Button>
          )}
          <Button as={Link} to="/investigations/new" size="sm">
            <PlusCircle className="size-4" aria-hidden="true" />
            <span>New Investigation</span>
          </Button>
        </div>
      </header>

      {error && (
        <ErrorState
          title="Failed to load cases"
          message={error}
          onRetry={fetchDashboard}
        />
      )}

      <section aria-label="Investigation totals">
        <dl className="workstation-panel grid grid-cols-2 sm:grid-cols-4">
          {metrics.map(({ icon: Icon, label, value, alert }) => (
            <div
              key={label}
              className="min-w-0 border-cyber-border px-3 py-3 even:border-l [&:nth-child(n+3)]:border-t sm:px-4 sm:[&:not(:first-child)]:border-l sm:[&:nth-child(n+3)]:border-t-0"
            >
              <dt className="flex items-center gap-2 text-xs font-medium text-text-secondary">
                <Icon className={`size-4 shrink-0 ${alert ? 'text-risk-high' : 'text-text-muted'}`} aria-hidden="true" />
                {label}
              </dt>
              <dd className="mt-1.5 font-mono text-2xl font-semibold leading-none tabular-nums text-text-primary">
                {page ? value : '—'}
              </dd>
            </div>
          ))}
        </dl>
        {totalElements > content.length && (
          <p className="field-note mt-2">Completed, high-risk, and evidence counts cover the latest {content.length} cases.</p>
        )}
      </section>

      <Card
        title="Recent Investigations"
        padded={false}
        headerAction={
          totalElements > 0 && (
            <Link
              to="/investigations"
              className="text-link inline-flex items-center gap-1 text-xs"
            >
              <span>View all cases</span>
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </Link>
          )
        }
      >
        {recent.length === 0 ? (
          <EmptyState
            icon={FolderSearch}
            title="No investigations yet"
            message="Open a case for your own evidence or load the fictional demo campaign to explore the workflow."
            action={
              <Button as={Link} to="/investigations/new" variant="outline" size="sm">
                Create Investigation
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-cyber-border">
            {recent.map((inv) => (
              <li key={inv.id}>
                <Link
                  to={`/investigations/${inv.id}`}
                  className="group flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 transition-colors hover:bg-cyber-elevated focus-visible:bg-cyber-elevated focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-cyan-primary sm:px-5"
                >
                  <div className="min-w-0 flex-1 basis-full space-y-1 sm:basis-auto">
                    <p className="break-words text-sm font-semibold text-text-primary group-hover:text-cyan-primary">{inv.title}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-secondary">
                      {inv.title?.startsWith('[DEMO]') && <Badge variant="SYNTHETIC_DEMO">Synthetic demo</Badge>}
                      {inv.category && <CategoryBadge category={inv.category} />}
                      <time
                        className="inline-flex items-center gap-1.5"
                        dateTime={inv.createdAt}
                        title={formatDateTime(inv.createdAt)}
                      >
                        <Clock className="size-3.5 text-text-muted" aria-hidden="true" />
                        {formatRelative(inv.createdAt)}
                      </time>
                      <span>{inv.evidenceCount || 0} evidence item{inv.evidenceCount === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={inv.status} />
                    {inv.overallRiskLevel && inv.overallRiskLevel !== 'UNKNOWN' && <RiskBadge level={inv.overallRiskLevel} />}
                  </div>
                  <ChevronRight className="ml-auto size-4 shrink-0 text-text-muted group-hover:text-cyan-primary" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;
