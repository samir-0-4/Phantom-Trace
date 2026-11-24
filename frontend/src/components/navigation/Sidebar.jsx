import { Link, NavLink, useMatch } from 'react-router-dom';
import { FileText, FolderSearch, LayoutDashboard, Plus, Settings } from 'lucide-react';
import { PhantomIcon } from '../ui/PhantomIcon';
import { cn } from '../../utils/cn';

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/investigations', label: 'Investigations', icon: FolderSearch },
  { to: '/investigations/new', label: 'New Investigation', icon: Plus },
  { to: '/reports', label: 'Reports', icon: FileText },
];

const navItem = ({ isActive }) => cn(
  'flex min-h-11 items-center gap-3 rounded-md border-l-2 px-3 py-2 text-sm font-medium transition-colors lg:min-h-9',
  isActive
    ? 'border-cyan-primary bg-cyan-primary/10 text-text-primary'
    : 'border-transparent text-text-secondary hover:bg-cyber-elevated hover:text-text-primary'
);

export const Sidebar = ({ onNavigate }) => {
  const isNewCase = Boolean(useMatch('/investigations/new'));

  return (
    <div className="flex h-full flex-col">
      <Link
        to="/"
        onClick={onNavigate}
        className="flex min-h-16 w-fit items-center gap-3 px-4 text-base font-semibold tracking-tight text-text-primary"
      >
        <PhantomIcon />
        <span>PhantomTrace</span>
      </Link>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto border-t border-cyber-border px-3 py-5" aria-label="Main navigation">
        <div className="space-y-1">
          <p className="section-label px-3 pb-1">Casework</p>
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to !== '/investigations' || isNewCase}
              onClick={onNavigate}
              className={navItem}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </div>
        <div className="space-y-1">
          <p className="section-label px-3 pb-1">Account</p>
          <NavLink to="/settings" onClick={onNavigate} className={navItem}>
            <Settings className="size-4 shrink-0" aria-hidden="true" />
            Settings
          </NavLink>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
