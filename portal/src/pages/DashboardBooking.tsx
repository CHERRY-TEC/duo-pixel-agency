import { motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  Mail,
  MessageCircle,
  Phone,
  Save,
  UserCheck,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BackLink,
  EmptyState,
  Stat,
  StatusPill,
  Timeline,
} from '@/components/ui';
import { useAuth } from '@/lib/auth';
import {
  claimBooking,
  listBookings,
  setBookingStatus,
  updateBooking,
} from '@/lib/db';
import { cx, formatDate, mailto, whatsappLink } from '@/lib/format';
import { AGENCY } from '@/lib/seed';
import { BOOKING_STATUSES } from '@/lib/types';
import type { Booking, BookingStatus } from '@/lib/types';

const STATUS_HINT: Record<BookingStatus, string> = {
  Pending: 'Request received — waiting for you to accept',
  Accepted: 'Scope agreed with the client',
  'In Design': 'Design work in progress',
  Review: 'Design shared for client feedback',
  Revisions: 'Client asked for changes',
  Delivered: 'Final build handed over for approval',
  Completed: 'Project closed and reviewed',
  Cancelled: 'Project stopped',
};

export default function DashboardBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState('');
  const [flash, setFlash] = useState('');

  const load = useCallback(() => {
    listBookings().then((list) => {
      const found = list.find((b) => b.id === id) ?? null;
      setBooking(found);
      if (found) setNote(found.internal_note ?? '');
    });
  }, [id]);

  useEffect(() => {
    document.title = 'Booking details — Duo Pixel Agency';
    load();
  }, [load]);

  const changeStatus = async (status: BookingStatus) => {
    if (!booking) return;
    setBusy(status);
    try {
      const updated = await setBookingStatus(
        booking.id,
        status,
        `Updated by ${user?.name ?? 'designer'}`,
      );
      if (updated) setBooking(updated);
      setFlash(`Status changed to ${status}`);
      window.setTimeout(() => setFlash(''), 2600);
    } finally {
      setBusy('');
    }
  };

  const claim = async () => {
    if (!booking || !user?.designer_slug) return;
    setBusy('claim');
    try {
      const updated = await claimBooking(booking.id, user.designer_slug);
      if (updated) setBooking(updated);
      setFlash('Booking assigned to you');
      window.setTimeout(() => setFlash(''), 2600);
    } finally {
      setBusy('');
    }
  };

  const saveNote = async () => {
    if (!booking) return;
    setBusy('note');
    try {
      const updated = await updateBooking(booking.id, { internal_note: note });
      if (updated) setBooking(updated);
      setFlash('Note saved');
      window.setTimeout(() => setFlash(''), 2600);
    } finally {
      setBusy('');
    }
  };

  if (!booking) {
    return (
      <div className="container-x py-10">
        <BackLink to="/dashboard">Dashboard</BackLink>
        <div className="mt-6">
          <EmptyState
            title="Booking not found"
            body="This booking does not exist, or it is not visible to your account."
            action={
              <button type="button" onClick={() => navigate('/dashboard')} className="btn-primary">
                Back to dashboard
              </button>
            }
          />
        </div>
      </div>
    );
  }

  const waHref = whatsappLink(
    booking.client_phone || AGENCY.whatsapp,
    `Hi ${booking.client_name.split(' ')[0]}, this is Duo Pixel Agency regarding your booking ${booking.booking_code} for ${booking.website_name}.`,
  );

  const canSee = booking.designer_slug === null || booking.designer_slug === user?.designer_slug;

  if (!canSee) {
    return (
      <div className="container-x py-10">
        <BackLink to="/dashboard">Dashboard</BackLink>
        <div className="mt-6">
          <EmptyState
            title="Not your booking"
            body="This project is assigned to the other designer."
            action={
              <button type="button" onClick={() => navigate('/dashboard')} className="btn-primary">
                Back to my bookings
              </button>
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-8 sm:py-12">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackLink to="/dashboard">Dashboard</BackLink>
        {flash && (
          <motion.span
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent"
          >
            <CheckCircle2 size={13} /> {flash}
          </motion.span>
        )}
      </div>

      {/* header card */}
      <div className="card mt-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-mono text-sm font-semibold tracking-widest text-accent">
                {booking.booking_code}
              </span>
              <StatusPill status={booking.status} />
              <span className="chip !py-0.5 !text-[10px]">{booking.website_type}</span>
            </div>
            <h1 className="mt-2 font-display text-2xl font-bold text-white">
              {booking.website_name}
            </h1>
            <p className="mt-1 text-sm text-ink-400">
              {booking.client_name} · booked {formatDate(booking.created_at)} ·{' '}
              {booking.language}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <a href={waHref} target="_blank" rel="noreferrer" className="btn-primary !py-2.5">
              <MessageCircle size={15} /> WhatsApp client
            </a>
            <a
              href={mailto(
                booking.client_email,
                `Duo Pixel Agency — ${booking.booking_code}`,
                `Hi ${booking.client_name},\n\nRegarding your booking ${booking.booking_code} (${booking.website_name}).\n\n`,
              )}
              className="btn-ghost !py-2.5"
            >
              <Mail size={15} /> Email
            </a>
            <a href={`tel:${booking.client_phone}`} className="btn-ghost !py-2.5">
              <Phone size={15} /> Call
            </a>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-t border-ink-700 pt-5 sm:grid-cols-4">
          <Stat value={booking.budget} label="Budget" />
          <Stat value={booking.deadline} label="Deadline" />
          <Stat value={booking.contact_method} label="Contact via" />
          <Stat
            value={booking.designer_slug ? booking.designer_slug : 'Unassigned'}
            label="Designer"
          />
        </div>

        {!booking.designer_slug && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-soft/30 bg-amber-soft/5 p-4">
            <p className="text-sm text-ink-300">
              This request is in the unassigned pool. Accept it to move it into your bookings.
            </p>
            <button
              type="button"
              onClick={claim}
              disabled={busy === 'claim'}
              className="btn-primary !py-2.5"
            >
              <UserCheck size={15} /> {busy === 'claim' ? 'Assigning…' : 'Accept & assign to me'}
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.35fr_1fr]">
        {/* brief */}
        <div className="space-y-5">
          <div className="card p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold text-white">Client brief</h2>

            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="text-[11px] uppercase tracking-wider text-ink-400">Description</p>
                <p className="mt-1.5 whitespace-pre-line leading-relaxed text-ink-200">
                  {booking.description}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink-400">Pages needed</p>
                  <p className="mt-1.5 text-ink-200">{booking.pages_needed}</p>
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink-400">
                    Style preferences
                  </p>
                  <p className="mt-1.5 text-ink-200">{booking.style_preferences}</p>
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider text-ink-400">Features</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {booking.features.length ? (
                    booking.features.map((f) => (
                      <span key={f} className="chip !py-1 !text-[11px]">
                        {f}
                      </span>
                    ))
                  ) : (
                    <span className="text-ink-400">None specified</span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-wider text-ink-400">
                  Reference links
                </p>
                {booking.reference_links ? (
                  <div className="mt-1.5 space-y-1">
                    {booking.reference_links.split(/\s+/).filter(Boolean).map((url) => (
                      <a
                        key={url}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="block truncate text-accent hover:underline"
                      >
                        {url}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="mt-1.5 text-ink-400">None</p>
                )}
              </div>

              {booking.files.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-ink-400">Attachments</p>
                  <ul className="mt-2 space-y-1.5">
                    {booking.files.map((f) => (
                      <li key={f.name}>
                        {f.url ? (
                          <a
                            href={f.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-800/70 px-3 py-2 text-sm text-ink-200 transition hover:border-accent/50 hover:text-accent"
                          >
                            <FileText size={14} /> {f.name}
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-2 rounded-lg border border-ink-700 bg-ink-800/70 px-3 py-2 text-sm text-ink-300">
                            <FileText size={14} /> {f.name}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* internal note */}
          <div className="card p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold text-white">
              Internal note
              <span className="ml-2 text-xs font-normal text-ink-400">
                (visible only to designers)
              </span>
            </h2>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Scope decisions, blockers, call notes…"
              aria-label="Internal note"
              className="input mt-3 min-h-[110px]"
            />
            <button
              type="button"
              onClick={saveNote}
              disabled={busy === 'note'}
              className="btn-ghost mt-3 !py-2.5"
            >
              <Save size={15} /> {busy === 'note' ? 'Saving…' : 'Save note'}
            </button>
          </div>
        </div>

        {/* status + timeline */}
        <div className="space-y-5">
          <div className="card p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold text-white">Update status</h2>
            <p className="mt-1.5 text-xs text-ink-400">
              The client sees every change instantly on their booking timeline.
            </p>

            <div className="mt-4 grid gap-2">
              {BOOKING_STATUSES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => changeStatus(status)}
                  disabled={busy !== '' || booking.status === status}
                  className={cx(
                    'flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left text-sm transition',
                    booking.status === status
                      ? 'border-accent bg-accent/10 text-white'
                      : 'border-ink-700 bg-ink-900/60 text-ink-300 hover:border-ink-500 hover:text-white',
                  )}
                >
                  <span className="font-semibold">{status}</span>
                  <span className="text-right text-[11px] text-ink-400">
                    {booking.status === status ? 'current' : STATUS_HINT[status]}
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => changeStatus('Cancelled')}
                disabled={busy !== '' || booking.status === 'Cancelled'}
                className="mt-1 rounded-xl border border-red-400/30 bg-red-400/5 px-4 py-3 text-left text-sm text-red-300 transition hover:bg-red-400/10 disabled:opacity-40"
              >
                Cancel booking
              </button>
            </div>
          </div>

          <div className="card p-5 sm:p-6">
            <h2 className="font-display text-base font-semibold text-white">Status timeline</h2>
            <div className="mt-5">
              <Timeline history={booking.history} current={booking.status} />
            </div>
          </div>

          {booking.rating && booking.review && (
            <div className="card p-5">
              <p className="text-[11px] uppercase tracking-wider text-ink-400">
                Client review ({booking.rating}★)
              </p>
              <p className="mt-2 text-sm leading-relaxed text-ink-200">“{booking.review}”</p>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-ink-400 transition hover:text-accent"
        >
          <ArrowLeft size={15} /> Back to dashboard
        </Link>
      </div>
    </div>
  );
}
