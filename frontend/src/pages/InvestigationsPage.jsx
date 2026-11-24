import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FolderSearch, PlusCircle, Search, ChevronRight, X, Sparkles, RotateCcw } from 'lucide-react';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { StatusBadge, RiskBadge, CategoryBadge } from '../components/ui/StatusBadge';
import { EmptyState } from '../components/ui/EmptyState';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import Pagination from '../components/ui/Pagination';
import Select from '../components/ui/Select';
import {
  INVESTIGATION_STATUS_LIST,
  INVESTIGATION_CATEGORY_LIST,
  categoryLabel,
} from '../constants';
import { investigationService } from '../services/investigation/investigationService';
import { formatDateTime, formatRelative } from '../utils/format';

const PAGE_SIZE = 10;
const caseColumns = 'xl:grid xl:grid-cols-[minmax(0,1fr)_7rem_7rem_5.5rem_6rem_1rem] xl:items-center xl:gap-3';

const statusOptions = [
  { value: '', label: 'All statuses' },
  ...INVESTIGATION_STATUS_LIST.map((s) => ({
    value: s,
    label: s.charAt(0) + s.slice(1).toLowerCase(),
  })),
];

const categoryOptions = [
  { value: '', label: 'All categories' },
  ...INVESTIGATION_CATEGORY_LIST.map((c) => ({ value: c, label: categoryLabel(c) })),
];

export const InvestigationsPage = () => {
  const [page, setPage] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [seedingDemo, setSeedingDemo] = useState(false);
  const [hasDemoData, setHasDemoData] = useState(false);

  const fetchPage = useCallback(
    (pageNum = 0, status = '') => {
      setLoading(true);
      Promise.all([
        investigationService.list({
          page: pageNum,
          size: PAGE_SIZE,
          sort: 'createdAt,desc',
          status: status || undefined,
        }),
        Promise.resolve(investigationService.getDemoStatus?.()).catch(() => ({ hasDemoData: false })),
      ])
        .then(([res, demoStatus]) => {
          setPage(res);
          setHasDemoData(Boolean(demoStatus?.hasDemoData));
          setError('');
        })
        .catch(() => setError('Failed to load investigations.'))
        .finally(() => setLoading(false));
    },
    []
  );

  const handleSeedDemo = async () => {
    setSeedingDemo(true);
    try {
      await investigationService.seedDemoCampaign();
      fetchPage(0, statusFilter);
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
      fetchPage(0, statusFilter);
    } catch {
      setError('Failed to reset demo campaign.');
    } finally {
      setSeedingDemo(false);
    }
  };

  useEffect(() => {
    fetchPage(currentPage, statusFilter);
  }, [fetchPage, currentPage, statusFilter]);

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(0);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
    setCurrentPage(0);
  };

  const content = page?.content || [];
  const displayed = content.filter((inv) => {
    if (categoryFilter && inv.category !== categoryFilter) return false;
    if (search && !inv.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-w-0 space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="page-heading">Investigations</h1>
          <p className="page-lede">Find and review your active and completed cases.</p>
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

      <Card padded={false}>
        <div className="space-y-2 border-b border-cyber-border px-4 py-3 sm:px-5">
          <div className="grid grid-cols-2 items-center gap-2 sm:grid-cols-[minmax(0,1fr)_10rem_11rem]" role="group" aria-label="Filter investigations">
            <div className="relative col-span-2 min-w-0 sm:col-span-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" aria-hidden="true" />
              <input
                type="text"
                aria-label="Search by case title"
                placeholder="Search by case title…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9 pr-9"
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-text-muted hover:bg-cyber-elevated hover:text-text-primary"
                >
                  <X className="size-3.5" aria-hidden="true" />
                </button>
              )}
            </div>
            <Select aria-label="Case status" value={statusFilter} onChange={handleStatusChange} options={statusOptions} />
            <Select aria-label="Case category" value={categoryFilter} onChange={handleCategoryChange} options={categoryOptions} />
          </div>
          {page?.totalPages > 1 && (search || categoryFilter) && (
            <p className="field-note">Title and category filters apply to the current page.</p>
          )}
        </div>
        {loading ? (
          <div className="p-6">
            <table className="w-full text-left">
              <tbody>
                <TableRowSkeleton rows={5} />
              </tbody>
            </table>
          </div>
        ) : error ? (
          <p role="alert" className="p-6 text-center text-sm text-risk-critical">{error}</p>
        ) : displayed.length === 0 ? (
          <EmptyState
            icon={FolderSearch}
            title={
              search || statusFilter || categoryFilter
                ? 'No matching investigations'
                : 'No investigations yet'
            }
            message={
              search || statusFilter || categoryFilter
                ? 'Try adjusting your search query or clear active filters.'
                : 'Create your first case to start investigating.'
            }
            action={
              search || statusFilter || categoryFilter ? (
                <Button variant="secondary" size="sm" onClick={clearFilters}>
                  Clear all filters
                </Button>
              ) : (
                <Button as={Link} to="/investigations/new" variant="outline" size="sm">
                  Create Investigation
                </Button>
              )
            }
          />
        ) : (
          <div>
            <div aria-hidden="true" className={`hidden border-b border-cyber-border bg-cyber-subtle px-5 py-2 text-xs font-medium text-text-secondary ${caseColumns}`}>
              <span>Case</span>
              <span>Status</span>
              <span>Risk</span>
              <span>Evidence</span>
              <span>Opened</span>
            </div>
            <ul className="divide-y divide-cyber-border">
              {displayed.map((inv) => (
                <li key={inv.id}>
                  <Link
                    to={`/investigations/${inv.id}`}
                    className={`group flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 transition-colors hover:bg-cyber-elevated focus-visible:bg-cyber-elevated focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-cyan-primary sm:px-5 ${caseColumns}`}
                  >
                    <div className="min-w-0 basis-full space-y-1">
                      <p className="break-words text-sm font-semibold text-text-primary group-hover:text-cyan-primary">{inv.title}</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        {inv.title?.startsWith('[DEMO]') && <Badge variant="SYNTHETIC_DEMO">Synthetic demo</Badge>}
                        {inv.category && <CategoryBadge category={inv.category} />}
                        {inv.id && (
                          <span className="hidden max-w-32 truncate font-mono text-2xs text-text-muted md:inline" title={inv.id}>{inv.id}</span>
                        )}
                      </div>
                    </div>
                    <div><span className="sr-only">Status: </span><StatusBadge status={inv.status} /></div>
                    <div className={inv.overallRiskLevel && inv.overallRiskLevel !== 'UNKNOWN' ? '' : 'hidden xl:block'}>
                      <span className="sr-only">Risk: </span>
                      {inv.overallRiskLevel && inv.overallRiskLevel !== 'UNKNOWN'
                        ? <RiskBadge level={inv.overallRiskLevel} />
                        : <span className="text-xs text-text-muted">Unknown</span>}
                    </div>
                    <span className="text-xs tabular-nums text-text-secondary">
                      {inv.evidenceCount || 0} <span className="xl:sr-only">evidence items</span>
                    </span>
                    <time className="text-xs tabular-nums text-text-secondary" dateTime={inv.createdAt} title={formatDateTime(inv.createdAt)}>
                      <span className="sr-only">Opened </span>{formatRelative(inv.createdAt)}
                    </time>
                    <ChevronRight className="ml-auto size-4 shrink-0 text-text-muted group-hover:text-cyan-primary" aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {!loading && page && page.totalPages > 1 && (
          <div className="border-t border-cyber-border px-4 sm:px-5">
            <Pagination
              page={page.pageNumber}
              pageSize={page.pageSize}
              totalElements={page.totalElements}
              totalPages={page.totalPages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default InvestigationsPage;
