import { Link, Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export const PublicLayout = ({ children }) => (
  <div className="flex min-h-dvh flex-col">
    <a
      href="#public-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 z-modal rounded-md bg-cyan-primary px-4 py-2 font-semibold text-cyber-canvas"
    >
      Skip to main content
    </a>
    <Navbar />
    <main id="public-content" tabIndex={-1} className="mx-auto w-full max-w-7xl flex-1 px-4 focus:outline-none sm:px-6 lg:px-8">
      {children || <Outlet />}
    </main>
    <footer className="border-t border-cyber-border bg-cyber-subtle">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-5 text-xs text-text-muted sm:px-6 lg:px-8">
        <Link to="/" className="font-semibold text-text-primary">PhantomTrace</Link>
        <span>Digital forensics and scam investigation</span>
      </div>
    </footer>
  </div>
);

export default PublicLayout;
