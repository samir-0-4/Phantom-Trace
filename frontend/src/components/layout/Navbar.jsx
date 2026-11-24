import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import { PhantomIcon } from '../ui/PhantomIcon';

export const Navbar = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b border-cyber-border bg-cyber-subtle">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight sm:gap-3 sm:text-base">
          <PhantomIcon />
          <span>PhantomTrace</span>
        </Link>

        <nav className="flex min-w-0 items-center gap-2 sm:gap-3" aria-label="Public navigation">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="inline-flex min-h-11 items-center px-1 text-xs font-medium text-text-secondary hover:text-text-primary sm:text-sm">
                Dashboard
              </Link>
              <Button as={Link} to="/investigations/new" size="sm" className="hidden min-h-11 sm:inline-flex">
                New Case <ArrowUpRight className="size-4" aria-hidden="true" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sign out">
                <LogOut className="size-4" aria-hidden="true" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login" className="inline-flex min-h-11 items-center whitespace-nowrap px-1 text-xs font-medium text-text-secondary hover:text-text-primary sm:text-sm">
                Sign In
              </Link>
              <Button as={Link} to="/register" size="sm" className="min-h-11 whitespace-nowrap">Get Started</Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
