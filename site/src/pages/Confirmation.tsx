import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  CalendarCheck,
  CheckCircle2,
  Copy,
  Mail,
  MessageCircle,
  Route,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Spinner } from '@/components/ui';
import { getBookingByCode } from '@/lib/db';
import { mailto } from '@/lib/format';
import { portalUrl } from '@/lib/links';
import { AGENCY } from '@/lib/seed';
import type { Booking, BookingFile } from '@/lib/types';
import type { EmailResult } from '@/lib/db';

interface NavState {
  booking?: Booking;
  emailStatus?: EmailResult;
}

export default function Confirmation() {
  const { code } = useParams();
  const location = useLocation();
  const state = (location.state ?? {}) as NavState;

  const [booking, setBooking] = useState<Booking | null>(state.booking ?? null);
  const [emailStatus] = useState<EmailResult>(state.emailStatus ?? 'skipped');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    document.title = booking
      ? `Booking ${booking.booking_code} confirmed — Duo Pixel Agency`
      : 'Booking confirmed — Duo Pixel Agency';
  }, [booking]);

  useEffect(() => {
    if (!booking && code) {
      getBookingByCode(code).then((b) => setBooking(b));
    }
  }, [booking, code]);

  const copyId = async () => {
    if (!booking) return;
    let ok = false;
    try {
      await navigator.clipboard.writeText(booking.booking_code);
      ok = true;
    } catch {
      // Fallback for browsers/contexts without the async clipboard API
      // (insecure origins, some headless runs).
      try {
        const ta = document.createElement('textarea');
        ta.value = booking.booking_code;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    setCopied(ok);
    if (ok) window.setTimeout(() => setCopied(false), 2200);
  };

  if (!booking) {
    return (
      <div className="container-x py-16">
        <Spinner label="Loading your booking…" />
      </div>
    );
  }

  return (
    <div className="container-x py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="card relative overflow-hidden p-6 text-center sm:p-9"
        >
          <div className="absolute inset-0 pixel-grid opacity-50" aria-hidden="true" />
          <div
            className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-accent/20 blur-[80px]"
            aria-hidden="true"
          />

          <div className="relative">
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.15 }}
              className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent text-ink-950"
            >
              <CheckCircle2 size={30} strokeWidth={2.4} />
            </motion.span>

            <h1 className="mt-5 font-display text-2xl font-bold text-white sm:text-3xl">
              Your booking is in!
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-ink-300">
              Thanks {booking.client_name.split(' ')[0]} — we have your brief for{' '}
              <strong className="text-white">{booking.website_name}</strong>. Keep the ID below
              safe: it is how you track everything.
            </p>

            {/* booking id */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mt-6 rounded-2xl border border-dashed border-accent/50 bg-ink-950/70 px-5 py-5"
            >
              <p className="text-[11px] uppercase tracking-[0.2em] text-ink-400">Booking ID</p>
              <p className="mt-2 font-mono text-3xl font-bold tracking-widest text-accent sm:text-4xl">
                {booking.booking_code}
              </p>
              <button
                type="button"
                onClick={copyId}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-ink-600 px-3.5 py-1.5 text-xs font-semibold text-ink-200 transition hover:border-accent/50 hover:text-accent"
              >
                {copied ? <CheckCircle2 size={13} className="text-accent" /> : <Copy size={13} />}
                {copied ? 'Copied!' : 'Copy ID'}
              </button>
            </motion.div>

            {/* actions */}
            <div className="mt-6 flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <a href={portalUrl(`/track?code=${booking.booking_code}`)} className="btn-ghost">
                  <Route size={16} /> Track booking
                </a>
                <a href={portalUrl('/account/my-bookings')} className="btn-ghost">
                  <CalendarCheck size={16} /> My bookings
                </a>
              </div>
              <a
                href={mailto(
                  AGENCY.email,
                  `New order — Duo Pixel Agency (${booking.booking_code})`,
                  [
                    `Booking ID: ${booking.booking_code}`,
                    `Project: ${booking.website_name}`,
                    `Website type: ${booking.website_type}`,
                    `Designer: ${booking.designer_slug ?? 'Unassigned'}`,
                    `Budget: ${booking.budget}`,
                    `Deadline: ${booking.deadline}`,
                    `Client: ${booking.client_name} (${booking.client_email})`,
                    `Phone: ${booking.client_phone}`,
                  ].join('\n'),
                )}
                className="btn-ghost w-full justify-center"
              >
                <Mail size={16} /> Email this order to the agency
              </a>
            </div>

            {/* email status */}
            <p className="mt-5 flex items-center justify-center gap-2 text-xs text-ink-400">
              <Mail size={13} className="text-accent" />
              {emailStatus === 'sent' ? (
                <>Confirmation email sent to {booking.client_email}</>
              ) : (
                <>
                  Confirmation copy for{' '}
                  <a
                    href={mailto(
                      booking.client_email,
                      `Booking confirmed — ${booking.booking_code}`,
                      `Your booking ${booking.booking_code} for ${booking.website_name} was received.`,
                    )}
                    className="text-accent underline-offset-2 hover:underline"
                  >
                    {booking.client_email}
                  </a>
                </>
              )}
            </p>

            {emailStatus === 'failed' && (
              <p className="mt-2 text-xs text-amber-soft">
                Email delivery had a hiccup — the details above are still confirmed.
              </p>
            )}
          </div>
        </motion.div>

        {/* next steps */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: <MessageCircle size={16} />,
              title: 'We reply',
              body: 'Within one working day on WhatsApp or your preferred channel.',
            },
            {
              icon: <CalendarCheck size={16} />,
              title: 'Scope confirmed',
              body: 'Fixed price and timeline agreed before any work starts.',
            },
            {
              icon: <ArrowUpRight size={16} />,
              title: 'First design',
              body: 'You see a design in Figma before we write a line of code.',
            },
          ].map((s, i) => (
            <div key={s.title} className="card p-5">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-accent/30 bg-accent/10 text-accent">
                {s.icon}
              </span>
              <p className="mt-3 font-display text-sm font-semibold text-white">
                {i + 1}. {s.title}
              </p>
              <p className="mt-1.5 text-xs leading-relaxed text-ink-400">{s.body}</p>
            </div>
          ))}
        </div>

        {/* booking snapshot */}
        <div className="card mt-6 p-5">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-ink-400">
            Request summary
          </h2>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            {[
              ['Status', booking.status],
              ['Designer', booking.designer_slug ?? 'No preference'],
              ['Website type', booking.website_type],
              ['Budget', booking.budget],
              ['Deadline', booking.deadline],
              ['Contact', `${booking.contact_method} · ${booking.client_phone}`],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-b border-ink-800 pb-2">
                <dt className="text-ink-400">{k}</dt>
                <dd className="text-right capitalize text-ink-100">{v}</dd>
              </div>
            ))}
          </dl>
          {booking.files.length > 0 && (
            <p className="mt-3 text-xs text-ink-400">
              📎 {booking.files.length} file(s) attached:{' '}
              {booking.files.map((f: BookingFile) => f.name).join(', ')}
            </p>
          )}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/book" className="btn-ghost flex-1">
            Book another project
          </Link>
          <Link to="/" className="btn-dark flex-1">
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
