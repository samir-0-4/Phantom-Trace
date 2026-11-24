import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const sections = {
  dashboard: 'Dashboard',
  investigations: 'Investigations',
  reports: 'Reports',
  settings: 'Settings',
};

const views = {
  analysis: 'Evidence',
  results: 'Analysis results',
  graph: 'Evidence graph',
  campaign: 'Campaign',
  report: 'Case report',
};

export const Topbar = ({ onMenuClick, mobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [, section, caseId, view] = pathname.split('/');
  const currentView = caseId === 'new' ? 'New case' : caseId ? views[view] || 'Case overview' : null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="no-print sticky top-0 z-sticky border-b border-cyber-border bg-cyber-subtle">
      <div className="mx-auto flex min-h-14 max-w-[94rem] items-center justify-between gap-2 px-4 sm:px-6 xl:px-8">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={onMenuClick}
            className="-ml-2 grid size-11 shrink-0 place-items-center rounded-md text-text-secondary hover:bg-cyber-elevated hover:text-text-primary lg:hidden"
            aria-label="Open mobile navigation menu"
            aria-controls="workspace-navigation"
            aria-expanded={mobileOpen}
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>

          <div className="flex min-w-0 items-center gap-2 text-xs text-text-secondary sm:text-sm">
            <span className={currentView ? 'hidden sm:inline' : 'truncate'}>{sections[section] || 'Workspace'}</span>
            {currentView && (
              <>
                <ChevronRight className="hidden size-3 shrink-0 text-text-muted sm:block" aria-hidden="true" />
                <span className="truncate text-text-primary">{currentView}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {user?.fullName && <span className="hidden max-w-36 truncate text-sm text-text-secondary sm:inline">{user.fullName}</span>}
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-md px-2 text-xs font-medium text-text-secondary hover:bg-cyber-elevated hover:text-text-primary"
            aria-label="Sign out"
          >
            <LogOut className="size-4" aria-hidden="true" />
            <span className="hidden md:inline">Sign out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
