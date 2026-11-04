import { ArrowUpRight, LayoutDashboard, MapPin } from 'lucide-react';
import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import Logo from '@/components/Logo';
import { cx } from '@/lib/format';
import { siteUrl } from '@/lib/links';

const NAV = [
  { to: '/track', label: 'Track a booking', icon: MapPin },
  { to: '/account/my-bookings', label: 'My bookings', icon: LayoutDashboard },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

/**
 * Chrome for the portal app: a compact header that always links back to the
 * public website, plus a minimal footer. Deliberately lighter than the
 * marketing site's navbar — everything here is account work.
 */
export default function PortalLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-ink-950">
      <ScrollToTop />

      <header className="sticky top-0 z-50 border-b border-ink-700/60 bg-ink-950/90 backdrop-blur-xl">
        <div className="container-x flex min-h-16 flex-wrap items-center justify-between gap-3 py-2">
          <a href={siteUrl('/')} aria-label="Duo Pixel Agency home" className="shrink-0">
            <Logo />
          </a>

          <div className="flex flex-wrap items-center gap-1 sm:gap-2">
            <nav aria-label="Portal" className="flex items-center gap-1">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cx(
                      'inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition',
                      isActive
                        ? 'bg-ink-800 text-white'
                        : 'text-ink-300 hover:bg-ink-850 hover:text-white',
                    )
                  }
                >
                  <item.icon size={15} />
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.label.split(' ')[0]}</span>
                </NavLink>
              ))}
            </nav>

            <a
              href={siteUrl('/book')}
              className="btn-primary hidden !px-4 !py-2 text-sm sm:inline-flex"
            >
              Book a Design
              <ArrowUpRight size={15} />
            </a>

            <a
              href={siteUrl('/')}
              className="rounded-full px-3 py-2 text-sm font-medium text-ink-300 transition hover:text-white"
            >
              Main site
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-ink-700/60 bg-ink-900">
        <div className="container-x flex flex-col items-start justify-between gap-4 py-8 text-sm text-ink-400 sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} Duo Pixel Agency · Client & designer portal
          </p>
          <div className="flex flex-wrap gap-4">
            <a href={siteUrl('/')} className="transition hover:text-accent">
              Public website
            </a>
            <a href={siteUrl('/pricing')} className="transition hover:text-accent">
              Pricing
            </a>
            <a href={siteUrl('/contact')} className="transition hover:text-accent">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
