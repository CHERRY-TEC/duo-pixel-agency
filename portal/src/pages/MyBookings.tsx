import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  CalendarClock,
  LogOut,
  MessageCircle,
  Route,
  Star,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Rating, Reveal, SectionHeading, Spinner, StatusPill, Timeline, EmptyState } from '@/components/ui';
import { listBookings, saveReview, watchBookings } from '@/lib/db';
import { siteUrl } from '@/lib/links';
import { useAuth } from '@/lib/auth';
import { bookingWhatsAppMessage, cx, formatDate, whatsappLink } from '@/lib/format';
import { AGENCY } from '@/lib/seed';
import type { Booking } from '@/lib/types';

function ReviewForm({ booking, onSaved }: { booking: Booking; onSaved: () => void }) {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (text.trim().length < 10) {
      setError('Please write at least a sentence so it is useful.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveReview(booking.id, rating, text.trim());
      onSaved();
    } catch (e) {
      console.warn(e);
      setError('Could not save the review. Try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-5 rounded-2xl border border-accent/30 bg-accent/5 p-4">
      <p className="text-sm font-semibold text-white">How did we do?</p>
      <div className="mt-3 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            aria-label={`${n} star${n > 1 ? 's' : ''}`}
            className="transition transform hover:scale-110"
          >
            <Star
              size={26}
              className={
                n <= (hover || rating) ? 'fill-amber-soft text-amber-soft' : 'text-ink-600'
              }
            />
          </button>
        ))}
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Share what went well — it becomes a public review."
        className="input mt-3 min-h-[90px]"
      />
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}
      <button type="button" onClick={submit} disabled={saving} className="btn-primary mt-3 !py-2.5">
        {saving ? 'Saving…' : 'Submit review'}
      </button>
    </div>
  );
}

function BookingRow({ booking, onChanged }: { booking: Booking; onChanged: () => void }) {
  const [open, setOpen] = useState(false);

  return (
    <article className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full flex-wrap items-center justify-between gap-3 p-5 text-left transition hover:bg-ink-800/50"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-mono text-xs font-semibold tracking-widest text-accent">
              {booking.booking_code}
            </span>
            <StatusPill status={booking.status} />
          </div>
          <p className="mt-1.5 truncate font-display text-base font-semibold text-white">
            {booking.website_name}
          </p>
          <p className="text-xs text-ink-400">
            {booking.website_type} · booked {formatDate(booking.created_at)} ·{' '}
            {booking.designer_slug
              ? booking.designer_slug === 'markanti'
                ? 'Markanti'
                : 'Sundar'
              : 'Unassigned'}
          </p>
        </div>
        <span
          className={cx(
            'rounded-full border border-ink-600 px-3.5 py-1.5 text-xs font-semibold text-ink-300 transition',
            open && 'border-accent/50 text-accent',
          )}
        >
          {open ? 'Hide details' : 'View timeline'}
        </span>
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="border-t border-ink-700"
        >
          <div className="grid gap-6 p-5 lg:grid-cols-[1fr_1fr]">
            <div>
              <h4 className="text-[11px] uppercase tracking-wider text-ink-400">Status timeline</h4>
              <div className="mt-4">
                <Timeline history={booking.history} current={booking.status} />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-[11px] uppercase tracking-wider text-ink-400">Brief</h4>
                <p className="mt-2 text-sm leading-relaxed text-ink-200">{booking.description}</p>
                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-ink-400">Budget</p>
                    <p className="text-ink-100">{booking.budget}</p>
                  </div>
                  <div>
                    <p className="text-ink-400">Deadline</p>
                    <p className="text-ink-100">{booking.deadline}</p>
                  </div>
                  <div>
                    <p className="text-ink-400">Features</p>
                    <p className="text-ink-100">{booking.features.join(', ') || '—'}</p>
                  </div>
                  <div>
                    <p className="text-ink-400">Contact via</p>
                    <p className="text-ink-100">{booking.contact_method}</p>
                  </div>
                </div>
              </div>

              {booking.status === 'Completed' && (
                <div>
                  {booking.rating && booking.review ? (
                    <div className="rounded-xl border border-ink-700 bg-ink-800/60 p-4">
                      <Rating value={booking.rating} />
                      <p className="mt-2 text-sm text-ink-200">“{booking.review}”</p>
                      <p className="mt-2 text-[11px] uppercase tracking-wider text-ink-400">
                        Your published review
                      </p>
                    </div>
                  ) : (
                    <ReviewForm booking={booking} onSaved={onChanged} />
                  )}
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                <a
                  href={whatsappLink(AGENCY.whatsapp, bookingWhatsAppMessage(booking))}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-primary !py-2.5"
                >
                  <MessageCircle size={15} /> Chat about this booking
                </a>
                <Link to={`/track?code=${booking.booking_code}`} className="btn-ghost !py-2.5">
                  <Route size={15} /> Shareable tracking link
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </article>
  );
}

export default function MyBookings() {
  const { user, signOut } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null);

  const load = useCallback(() => {
    listBookings().then(setBookings);
  }, []);

  useEffect(() => {
    document.title = 'My Bookings — Duo Pixel Agency';
    load();
    const unsub = watchBookings(load);
    return unsub;
  }, [load]);

  const mine = useMemo(() => {
    if (!bookings || !user) return [];
    const email = user.email.toLowerCase();
    return bookings.filter(
      (b) => b.client_uid === user.id || b.client_email.toLowerCase() === email,
    );
  }, [bookings, user]);

  if (!bookings) return <Spinner label="Loading your bookings…" />;

  return (
    <div className="container-x py-12 sm:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow="Client account"
          title={`Welcome back, ${user?.name.split(' ')[0]}`}
          description="Every project you have booked with us, with its live status timeline."
          className="mb-0"
        />
        <button
          type="button"
          onClick={async () => {
            await signOut();
            window.location.assign(siteUrl('/'));
          }}
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-ink-600 px-4 py-2 text-sm text-ink-300 transition hover:border-accent/50 hover:text-accent"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>

      <div className="mt-8 space-y-4">
        {mine.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            body="When you book a design, it appears here with a live timeline from Pending to Completed."
            action={
              <a href={siteUrl('/book')} className="btn-primary">
                Book a Design <ArrowUpRight size={16} />
              </a>
            }
          />
        ) : (
          mine.map((b, i) => (
            <Reveal key={b.id} delay={i * 0.05}>
              <BookingRow booking={b} onChanged={load} />
            </Reveal>
          ))
        )}
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ['Pending → Accepted', 'We confirm scope on WhatsApp'],
          ['In Design → Review', 'You approve a Figma design'],
          ['Revisions → Completed', 'Launch, handover and support'],
        ].map(([title, body]) => (
          <div key={title} className="card p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <CalendarClock size={14} className="text-accent" /> {title}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-ink-400">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
