import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  CheckCircle2,
  Inbox,
  LogOut,
  Pencil,
  Save,
  Search,
  Star,
  UserRound,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@/components/Avatar';
import { PackageCard } from '@/components/cards';
import { SelectField, TextAreaField, TextField } from '@/components/fields';
import {
  EmptyState,
  Reveal,
  Spinner,
  Stat,
  StatusPill,
} from '@/components/ui';
import { useAuth } from '@/lib/auth';
import {
  claimBooking,
  listBookings,
  updateDesigner,
  updatePackage,
  watchBookings,
} from '@/lib/db';
import { cx, daysAgo, formatDate } from '@/lib/format';
import { useDesigners, usePackages, useReviews } from '@/lib/useDesigners';
import { siteUrl } from '@/lib/links';
import type { Booking, BookingStatus, Designer, Package } from '@/lib/types';
import { BOOKING_STATUSES } from '@/lib/types';

type Tab = 'bookings' | 'pool' | 'profile' | 'pricing' | 'reviews';

const TABS: Array<{ id: Tab; label: string; icon: JSX.Element }> = [
  { id: 'bookings', label: 'My bookings', icon: <Inbox size={15} /> },
  { id: 'pool', label: 'Unassigned pool', icon: <Search size={15} /> },
  { id: 'profile', label: 'My profile', icon: <UserRound size={15} /> },
  { id: 'pricing', label: 'Pricing', icon: <Pencil size={15} /> },
  { id: 'reviews', label: 'Reviews', icon: <Star size={15} /> },
];

function BookingTable({
  bookings,
  empty,
  action,
  emptyBody,
}: {
  bookings: Booking[];
  empty: string;
  action?: React.ReactNode;
  emptyBody: string;
}) {
  if (bookings.length === 0) {
    return <EmptyState title={empty} body={emptyBody} action={action} />;
  }

  return (
    <div className="space-y-3">
      {bookings.map((b) => (
        <Link
          key={b.id}
          to={`/dashboard/bookings/${b.id}`}
          className="card flex flex-wrap items-center justify-between gap-4 p-4 transition hover:border-accent/40 hover:shadow-glow"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="font-mono text-xs font-semibold tracking-widest text-accent">
                {b.booking_code}
              </span>
              <StatusPill status={b.status} />
            </div>
            <p className="mt-1.5 truncate font-display text-base font-semibold text-white">
              {b.website_name}
            </p>
            <p className="text-xs text-ink-400">
              {b.client_name} · {b.website_type} · {b.budget} · {daysAgo(b.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-right text-xs text-ink-400 sm:block">
              Deadline
              <br />
              <span className="text-ink-200">{b.deadline}</span>
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-full border border-ink-600 text-ink-300">
              <ArrowUpRight size={16} />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------ Profile tab */

function ProfileTab({ designer }: { designer: Designer }) {
  const [form, setForm] = useState({
    title: designer.title,
    tagline: designer.tagline,
    bio: designer.bio,
    skills: designer.skills.join(', '),
    tools: designer.tools.join(', '),
    experience: designer.experience,
    availability: designer.availability,
    availability_note: designer.availability_note,
    starting_price: String(designer.starting_price),
    avg_delivery_days: String(designer.avg_delivery_days),
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const set = (key: keyof typeof form, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateDesigner(designer.slug, {
        title: form.title,
        tagline: form.tagline,
        bio: form.bio,
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        tools: form.tools.split(',').map((s) => s.trim()).filter(Boolean),
        experience: form.experience,
        availability: form.availability as Designer['availability'],
        availability_note: form.availability_note,
        starting_price: Number(form.starting_price) || 0,
        avg_delivery_days: Number(form.avg_delivery_days) || 1,
      });
      setSaved(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card p-6">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-white">
            Edit your public profile
          </h3>
          <span className="text-xs text-ink-400">Changes appear on the site immediately</span>
        </div>

        <div className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Job title"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
            <TextField
              label="Tagline"
              value={form.tagline}
              onChange={(e) => set('tagline', e.target.value)}
            />
          </div>

          <TextAreaField
            label="Bio"
            hint="Shown on your profile card and profile page."
            style={{ minHeight: 140 }}
            value={form.bio}
            onChange={(e) => set('bio', e.target.value)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <TextAreaField
              label="Skills"
              hint="Comma separated"
              style={{ minHeight: 90 }}
              value={form.skills}
              onChange={(e) => set('skills', e.target.value)}
            />
            <TextAreaField
              label="Tools"
              hint="Comma separated"
              style={{ minHeight: 90 }}
              value={form.tools}
              onChange={(e) => set('tools', e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Experience"
              value={form.experience}
              onChange={(e) => set('experience', e.target.value)}
            />
            <SelectField
              label="Availability status"
              options={[
                { value: 'Available', label: 'Available' },
                { value: 'Busy', label: 'Busy' },
              ]}
              value={form.availability}
              onChange={(e) => set('availability', e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              label="Starting price (₹)"
              type="number"
              inputMode="numeric"
              value={form.starting_price}
              onChange={(e) => set('starting_price', e.target.value)}
            />
            <TextField
              label="Avg. delivery (days)"
              type="number"
              inputMode="numeric"
              value={form.avg_delivery_days}
              onChange={(e) => set('avg_delivery_days', e.target.value)}
            />
            <TextField
              label="Availability note"
              value={form.availability_note}
              onChange={(e) => set('availability_note', e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3">
            <button type="button" onClick={save} disabled={saving} className="btn-primary !py-2.5">
              <Save size={15} /> {saving ? 'Saving…' : 'Save profile'}
            </button>
            {saved && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                className="inline-flex items-center gap-1.5 text-sm text-accent"
              >
                <CheckCircle2 size={15} /> Saved
              </motion.span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="card p-5 text-center">
          <Avatar designer={designer} size={96} className="mx-auto rounded-2xl" />
          <p className="mt-3 font-display text-lg font-bold text-white">{designer.name}</p>
          <p className="text-sm text-accent">{designer.title}</p>
          <p className="mt-2 text-xs text-ink-400">
            {designer.avg_delivery_days} day average delivery
          </p>
          <a href={siteUrl(`/designer/${designer.slug}`)} className="btn-ghost mt-4 w-full !py-2.5">
            View public page <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="card p-5">
          <p className="text-[11px] uppercase tracking-wider text-ink-400">Tip</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-300">
            Keep your availability current — clients see it while booking and it decides which
            projects get matched to you first.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- Pricing tab */

function PricingTab({ packages }: { packages: Package[] }) {
  const [savedId, setSavedId] = useState<string | null>(null);

  const save = async (pkg: Package, price: number) => {
    await updatePackage(pkg.id, { price });
    setSavedId(pkg.id);
    window.setTimeout(() => setSavedId(null), 2000);
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-sm text-ink-300">
          Edit the price shown on the public pricing page. Changes are live instantly.
        </p>
        {savedId && <span className="text-sm text-accent">✓ Price updated</span>}
      </div>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {packages.map((pkg) => (
          <PackageCard
            key={pkg.id}
            pkg={pkg}
            editable
            onPriceChange={(price) => save(pkg, price)}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------- Reviews tab */

function ReviewsTab({ designer, bookings }: { designer: Designer; bookings: Booking[] }) {
  const reviews = useReviews();
  const seedReviews = (reviews ?? []).filter((r) => r.designer === designer.slug);
  const clientReviews = bookings.filter((b) => b.rating && b.review);

  const avg =
    [...seedReviews.map((r) => r.rating), ...clientReviews.map((b) => b.rating as number)]
      .reduce((a, b) => a + b, 0) /
      (seedReviews.length + clientReviews.length || 1);

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={`${avg.toFixed(1)}★`} label="Average rating" />
        <Stat value={seedReviews.length + clientReviews.length} label="Total reviews" />
        <Stat value={designer.stats.clients} label="Clients served" />
        <Stat value={designer.stats.projects} label="Projects" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {clientReviews.map((b) => (
          <div key={b.id} className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <Rating value={b.rating as number} showValue={false} />
              <span className="text-xs text-ink-400">{formatDate(b.updated_at)}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-200">“{b.review}”</p>
            <p className="mt-3 border-t border-ink-700 pt-3 text-xs text-ink-400">
              {b.client_name} · {b.website_name} ·{' '}
              <span className="font-mono">{b.booking_code}</span>
            </p>
          </div>
        ))}
        {seedReviews.map((r) => (
          <div key={r.id} className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <Rating value={r.rating} showValue={false} />
              <span className="text-xs text-ink-400">{formatDate(r.date)}</span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-ink-200">“{r.text}”</p>
            <p className="mt-3 border-t border-ink-700 pt-3 text-xs text-ink-400">
              {r.client} · {r.role} · {r.project}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Rating({
  value,
  showValue = true,
}: {
  value: number;
  showValue?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            size={14}
            className={n <= Math.round(value) ? 'fill-amber-soft text-amber-soft' : 'text-ink-600'}
          />
        ))}
      </span>
      {showValue && <span className="text-xs text-ink-300">{value.toFixed(1)}</span>}
    </span>
  );
}

/* --------------------------------------------------------------- Dashboard */

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const designers = useDesigners();
  const packages = usePackages();
  const [tab, setTab] = useState<Tab>('bookings');
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [filter, setFilter] = useState<'all' | BookingStatus>('all');
  const [query, setQuery] = useState('');
  const [claiming, setClaiming] = useState('');
  const [flash, setFlash] = useState('');

  const load = useCallback(() => {
    listBookings().then(setBookings);
  }, []);

  useEffect(() => {
    document.title = 'Designer Dashboard — Duo Pixel Agency';
    load();
    const unsub = watchBookings(load);
    return unsub;
  }, [load]);

  const designer = useMemo(
    () => (designers ?? []).find((d) => d.slug === user?.designer_slug) ?? null,
    [designers, user],
  );

  const mine = useMemo(() => {
    if (!bookings || !user?.designer_slug) return [];
    const q = query.trim().toLowerCase();
    return bookings
      .filter((b) => b.designer_slug === user.designer_slug)
      .filter((b) => (filter === 'all' ? true : b.status === filter))
      .filter((b) =>
        q
          ? [b.booking_code, b.website_name, b.client_name, b.client_phone]
              .join(' ')
              .toLowerCase()
              .includes(q)
          : true,
      );
  }, [bookings, user, filter, query]);

  const pool = useMemo(() => {
    if (!bookings) return [];
    const q = query.trim().toLowerCase();
    return bookings
      .filter((b) => b.designer_slug === null)
      .filter((b) =>
        q
          ? [b.booking_code, b.website_name, b.client_name, b.website_type]
              .join(' ')
              .toLowerCase()
              .includes(q)
          : true,
      );
  }, [bookings, query]);

  const stats = useMemo(() => {
    const all = (bookings ?? []).filter((b) => b.designer_slug === user?.designer_slug);
    return {
      active: all.filter((b) => !['Completed', 'Cancelled'].includes(b.status)).length,
      pending: all.filter((b) => b.status === 'Pending').length,
      delivered: all.filter((b) => ['Delivered', 'Completed'].includes(b.status)).length,
      pool: (bookings ?? []).filter((b) => b.designer_slug === null).length,
    };
  }, [bookings, user]);

  const onClaim = async (booking: Booking) => {
    if (!user?.designer_slug) return;
    setClaiming(booking.id);
    try {
      await claimBooking(booking.id, user.designer_slug);
      setFlash(`Booking assigned to you — ${booking.booking_code} moved to My bookings`);
      window.setTimeout(() => setFlash(''), 4000);
      load();
    } finally {
      setClaiming('');
    }
  };

  if (!designers || !bookings || !packages) return <Spinner label="Loading dashboard…" />;

  return (
    <div className="container-x py-10 sm:py-14">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          {designer && <Avatar designer={designer} size={64} className="rounded-2xl" />}
          <div>
            <span className="eyebrow !py-1">Designer dashboard</span>
            <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
              Hi {designer?.short_name ?? user?.name}
            </h1>
            <p className="mt-1 text-sm text-ink-300">
              {designer
                ? `${designer.availability === 'Available' ? '✅ Available' : '⏳ Busy'} · ${designer.availability_note}`
                : 'You can see only your bookings and the unassigned pool.'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            window.location.assign(siteUrl('/'));
          }}
          className="inline-flex items-center gap-2 rounded-full border border-ink-600 px-4 py-2 text-sm text-ink-300 transition hover:border-accent/50 hover:text-accent"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={stats.active} label="Active projects" />
        <Stat value={stats.pending} label="Awaiting acceptance" />
        <Stat value={stats.delivered} label="Delivered" />
        <Stat value={stats.pool} label="Unassigned requests" />
      </div>

      {/* tabs */}
      <div className="mt-7 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cx(
              'inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition',
              tab === t.id
                ? 'border-accent bg-accent text-ink-950'
                : 'border-ink-600 bg-ink-850 text-ink-300 hover:border-ink-500 hover:text-white',
            )}
          >
            {t.icon} {t.label}
            {t.id === 'pool' && stats.pool > 0 && (
              <span
                className={cx(
                  'rounded-full px-1.5 text-[11px] font-bold',
                  tab === t.id ? 'bg-ink-950/20 text-ink-950' : 'bg-accent/20 text-accent',
                )}
              >
                {stats.pool}
              </span>
            )}
          </button>
        ))}
      </div>

      {flash && (
        <motion.p
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-accent/40 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent"
          role="status"
        >
          <CheckCircle2 size={15} /> {flash}
        </motion.p>
      )}

      <div className="mt-6">
        {/* --------------------------------------------- bookings tab */}
        {tab === 'bookings' && (
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search code, client or project…"
                className="input max-w-xs !py-2.5"
                aria-label="Search bookings"
              />
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {(['all', ...BOOKING_STATUSES] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFilter(s)}
                    className={cx(
                      'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition',
                      filter === s
                        ? 'border-accent bg-accent/15 text-accent'
                        : 'border-ink-700 text-ink-400 hover:text-ink-200',
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <BookingTable
              bookings={mine}
              empty="No bookings here yet"
              emptyBody="Requests assigned to you will appear with a live status timeline. Check the unassigned pool for new work."
              action={
                <button type="button" onClick={() => setTab('pool')} className="btn-primary">
                  Open unassigned pool
                </button>
              }
            />
          </div>
        )}

        {/* --------------------------------------------- pool tab */}
        {tab === 'pool' && (
          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-ink-300">
                Requests with no designer yet. Claim one and it moves to your bookings — the client
                sees the status change live.
              </p>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search requests…"
                className="input max-w-xs !py-2.5"
                aria-label="Search unassigned requests"
              />
            </div>

            {pool.length === 0 ? (
              <EmptyState
                title="Pool is empty"
                body="Every request has a designer. New bookings land here the moment a client submits them."
              />
            ) : (
              <div className="space-y-3">
                {pool.map((b) => (
                  <Reveal key={b.id}>
                    <div className="card p-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="font-mono text-xs font-semibold tracking-widest text-accent">
                              {b.booking_code}
                            </span>
                            <StatusPill status={b.status} />
                            <span className="chip !py-0.5 !text-[10px]">{b.website_type}</span>
                          </div>
                          <p className="mt-1.5 font-display text-base font-semibold text-white">
                            {b.website_name}
                          </p>
                          <p className="mt-1 line-clamp-2 text-sm text-ink-300">{b.description}</p>
                          <p className="mt-2 text-xs text-ink-400">
                            {b.client_name} · {b.budget} · {b.deadline} · {formatDate(b.created_at)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <button
                            type="button"
                            onClick={() => onClaim(b)}
                            disabled={claiming === b.id}
                            className="btn-primary !px-5 !py-2.5"
                          >
                            {claiming === b.id ? 'Claiming…' : 'Accept & assign to me'}
                          </button>
                          <Link
                            to={`/dashboard/bookings/${b.id}`}
                            className="btn-ghost !px-5 !py-2.5"
                          >
                            View brief
                          </Link>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --------------------------------------------- profile tab */}
        {tab === 'profile' && designer && <ProfileTab designer={designer} />}

        {/* --------------------------------------------- pricing tab */}
        {tab === 'pricing' && <PricingTab packages={packages} />}

        {/* --------------------------------------------- reviews tab */}
        {tab === 'reviews' && designer && (
          <ReviewsTab designer={designer} bookings={mine} />
        )}
      </div>
    </div>
  );
}
