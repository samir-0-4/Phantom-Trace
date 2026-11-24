import { useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { X } from 'lucide-react';
import Sidebar from '../navigation/Sidebar';
import Topbar from '../navigation/Topbar';

export const DashboardLayout = () => {
  const drawer = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const dialog = drawer.current;
    if (mobileOpen && !dialog.open) dialog.showModal();
    if (!mobileOpen && dialog.open) dialog.close();
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const desktop = window.matchMedia('(min-width: 1024px)');
    const closeOnDesktop = () => {
      if (desktop.matches) setMobileOpen(false);
    };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, [mobileOpen]);

  return (
    <div className="workspace-shell min-h-dvh lg:grid lg:grid-cols-[14.5rem_minmax(0,1fr)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 z-modal rounded-md bg-cyan-primary px-4 py-2 font-semibold text-cyber-canvas"
      >
        Skip to main content
      </a>

      <aside className="no-print sticky top-0 hidden h-dvh border-r border-cyber-border bg-cyber-subtle lg:block">
        <Sidebar />
      </aside>

      <dialog
        ref={drawer}
        id="workspace-navigation"
        aria-label="Workspace navigation"
        onClose={() => setMobileOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) setMobileOpen(false);
        }}
        className="workspace-drawer fixed inset-y-0 left-0 right-auto m-0 h-dvh max-h-none w-[min(18rem,92vw)] max-w-none border-r border-cyber-border bg-cyber-subtle p-0 text-text-primary no-print"
      >
        <div className="relative h-full">
          <button
            type="button"
            autoFocus
            className="absolute right-2 top-2 grid size-11 place-items-center rounded-md text-text-secondary hover:bg-cyber-elevated hover:text-text-primary"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <X className="size-5" aria-hidden="true" />
          </button>
          <Sidebar onNavigate={() => setMobileOpen(false)} />
        </div>
      </dialog>

      <div className="workspace-main min-w-0">
        <Topbar mobileOpen={mobileOpen} onMenuClick={() => setMobileOpen(true)} />
        <main
          id="main-content"
          tabIndex={-1}
          className="mx-auto w-full min-w-0 max-w-[94rem] px-4 py-5 focus:outline-none sm:px-6 sm:py-6 xl:px-8"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
