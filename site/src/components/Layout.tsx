import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  BookOpen,
  Home,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Logo from '@/components/Logo';
import { AGENCY } from '@/lib/seed';
import { useAuth } from '@/lib/auth';
import { contactWhatsAppMessage, cx, whatsappLink } from '@/lib/format';
import { portalUrl } from '@/lib/links';

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/designers', label: 'Designers' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/contact', label: 'Contact' },
];

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Tracking, the client area and the designer dashboard live in the portal app.
  const accountHref = portalUrl(user?.role === 'designer' ? '/dashboard' : '/account/my-bookings');

  return (
    <>
      <header
        className={cx(
          'fixed inset-x-0 top-0 z-50 transition-all duration-300',
          scrolled
            ? 'border-b border-ink-700/60 bg-ink-950/85 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="container-x flex h-16 items-center justify-between gap-4 sm:h-[72px]">
          <Link to="/" aria-label="Duo Pixel Agency home" className="shrink-0">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cx(
                    'rounded-full px-4 py-2 text-sm font-medium transition',
                    isActive
                      ? 'bg-ink-800 text-white'
                      : 'text-ink-300 hover:bg-ink-850 hover:text-white',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <a
                  href={accountHref}
                  className="hidden rounded-full border border-ink-600 px-4 py-2 text-sm font-medium text-ink-100 transition hover:border-accent/50 hover:text-accent sm:inline-flex"
                >
                  {user.role === 'designer' ? 'Dashboard' : 'My Bookings'}
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    await signOut();
                    navigate('/');
                  }}
                  className="hidden rounded-full p-2 text-ink-400 transition hover:text-white sm:inline-flex"
                  aria-label="Sign out"
                  title="Sign out"
                >
                  <LogOut size={17} />
                </button>
              </>
            ) : (
              <a
                href={portalUrl('/login')}
                className="hidden rounded-full px-3 py-2 text-sm font-medium text-ink-300 transition hover:text-white sm:inline-flex"
              >
                Log in
              </a>
            )}

            <Link to="/book" className="btn-primary hidden !px-5 !py-2.5 sm:inline-flex">
              Book a Design
              <ArrowUpRight size={16} />
            </Link>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-600 bg-ink-850 text-white md:hidden"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
            >
              {open ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-ink-950/95 backdrop-blur-md md:hidden"
          >
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="flex min-h-full flex-col justify-between px-5 pb-10 pt-24"
            >
              <nav className="flex flex-col gap-1" aria-label="Mobile">
                {NAV.map((item, i) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      cx(
                        'rounded-2xl px-4 py-4 font-display text-2xl font-semibold transition',
                        isActive ? 'bg-ink-800 text-accent' : 'text-white',
                      )
                    }
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    {item.label}
                  </NavLink>
                ))}
                <div className="mt-4 border-t border-ink-700 pt-4">
                  <a
                    href={user ? accountHref : portalUrl('/track')}
                    className="block rounded-2xl px-4 py-3.5 text-base text-ink-200"
                  >
                    {user ? (user.role === 'designer' ? 'Designer dashboard' : 'My Bookings') : 'Track a booking'}
                  </a>
                  {!user && (
                    <a
                      href={portalUrl('/login')}
                      className="block rounded-2xl px-4 py-3.5 text-base text-ink-200"
                    >
                      Log in / Sign up
                    </a>
                  )}
                  {user && (
                    <button
                      type="button"
                      onClick={async () => {
                        await signOut();
                        navigate('/');
                      }}
                      className="block w-full rounded-2xl px-4 py-3.5 text-left text-base text-ink-200"
                    >
                      Sign out
                    </button>
                  )}
                </div>
              </nav>

              <div className="space-y-3">
                <Link to="/book" className="btn-primary w-full">
                  Book a Design
                  <ArrowUpRight size={17} />
                </Link>
                <a
                  href={whatsappLink(AGENCY.whatsapp, contactWhatsAppMessage())}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost w-full"
                >
                  <MessageCircle size={17} />
                  Chat on WhatsApp
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mt-24 border-t border-ink-700/60 bg-ink-900">
      <div className="absolute inset-0 pixel-grid opacity-40" aria-hidden="true" />
      <div className="container-x relative py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo size={48} />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-300">
              {AGENCY.tagline} We design and build websites for founders, shops and teams —
              from a single landing page to a full portal.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <a
                href={whatsappLink(AGENCY.whatsapp, contactWhatsAppMessage())}
                target="_blank"
                rel="noreferrer"
                className="chip transition hover:border-accent/50 hover:text-accent"
              >
                <MessageCircle size={14} /> WhatsApp
              </a>
              <a
                href={`mailto:${AGENCY.email}`}
                className="chip transition hover:border-accent/50 hover:text-accent"
              >
                <Mail size={14} /> Email
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-ink-400">Explore</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-300">
              {NAV.map((n) => (
                <li key={n.to}>
                  <Link to={n.to} className="transition hover:text-accent">
                    {n.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link to="/book" className="transition hover:text-accent">
                  Book a Design
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-ink-400">Clients</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-300">
              <li>
                <a href={portalUrl('/track')} className="transition hover:text-accent">
                  Track your booking
                </a>
              </li>
              <li>
                <a href={portalUrl('/login')} className="transition hover:text-accent">
                  Log in / Sign up
                </a>
              </li>
              <li>
                <a href={portalUrl('/account/my-bookings')} className="transition hover:text-accent">
                  My Bookings
                </a>
              </li>
              <li>
                <Link to="/designer/markanti" className="transition hover:text-accent">
                  Markanti
                </Link>
              </li>
              <li>
                <Link to="/designer/sundar" className="transition hover:text-accent">
                  Sundar
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-ink-400">Contact</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-ink-300">
              <li>
                <a
                  href={whatsappLink(AGENCY.whatsapp, contactWhatsAppMessage())}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-accent"
                >
                  +{AGENCY.whatsapp}
                </a>
              </li>
              <li>
                <a href={`mailto:${AGENCY.email}`} className="transition hover:text-accent">
                  {AGENCY.email}
                </a>
              </li>
              <li>{AGENCY.city}</li>
              <li className="text-ink-400">{AGENCY.hours}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-ink-700/70 pt-6 text-xs text-ink-400 sm:flex-row sm:items-center">
          <p>© {year} Duo Pixel Agency. All rights reserved.</p>
          <p className="inline-flex items-center gap-2">
            <Sparkles size={13} className="text-accent" />
            Designed & built in-house with React, TypeScript and Supabase.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 pt-16 sm:pt-[72px] pb-safe">
        <Outlet />
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}

/* ------------------------------------------------ Mobile bottom tab nav */

const BOTTOM_NAV = [
  { to: '/', label: 'Home', icon: <Home size={20} /> },
  { to: '/designers', label: 'Designers', icon: <Users size={20} /> },
  { to: '/book', label: 'Book', icon: <BookOpen size={20} /> },
];

function MobileBottomNav() {
  const location = useLocation();
  return (
    <nav
      className={cx(
        'fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-4 py-3 sm:py-3.5 border-t border-ink-700/60 bg-ink-950/90 backdrop-blur-xl',
        'pb-safe',
      )}
      aria-label="Bottom navigation"
    >
      {BOTTOM_NAV.map((item) => {
        const isActive = location.pathname === item.to || (item.to === '/' && location.pathname === '/');
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cx(
              'flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200',
              isActive
                ? 'bg-accent/15 text-accent shadow-[0_0_20px_rgba(185,255,57,0.25)]'
                : 'text-ink-400 hover:text-accent hover:bg-ink-900',
            )}
            aria-label={item.label}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
