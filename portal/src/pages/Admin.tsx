import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  CheckCircle2,
  Download,
  LogOut,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, Spinner, Stat, StatusPill } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { listBookings, watchBookings } from '@/lib/db';
import { cx, daysAgo, formatDate } from '@/lib/format';
import { siteUrl } from '@/lib/links';
import { AGENCY } from '@/lib/seed';
import { BOOKING_STATUSES } from '@/lib/types';
import type { Booking, BookingStatus, DesignerSlug } from '@/lib/types';

type StatusFilter = 'all' | BookingStatus;
type DesignerFilter = 'all' | 'markanti' | 'sundar' | 'unassigned';

const STATUS_FILTERS: StatusFilter[] = ['all', ...BOOKING_STATUSES];

const DESIGNER_FILTERS: Array<{ value: DesignerFilter; label: string }> = [
  { value: 'all', label: 'Everyone' },
  { value: 'markanti', label: 'Markanti' },
  { value: 'sundar', label: 'Sundar' },
  { value: 'unassigned', label: 'Unassigned' },
];

const DESIGNER_LABEL: Record<string, string> = {
  markanti: 'Markanti',
  sundar: 'Sundar',
};

const csvCell = (value: string | null | undefined): string => {
  const raw = value ?? '';
  return /[",\n]/.test(raw) ? `"${raw.replace(/"/g, '""')}"` : raw;
};

/**
 * Agency admin — the single place to see every order, regardless of which
 * designer claimed it. Read-only overview with search, status/designer
 * filters and a CSV export; open a row to manage it.
 */
export default function Admin() {
  const { user, signOut } = useAuth();
  const [bookings, setBookings] = useState<Booking[] | null>(null);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [designer, setDesigner] = useState<DesignerFilter>('all');
  const [flash, setFlash] = useState('');

  const load = useCallback(() => {
    listBookings().then(setBookings);
  }, []);

  useEffect(() => {
    document.title = 'Admin · All orders — Duo Pixel Agency';
    load();
    const unsub = watchBookings(load);
    return unsub;
  }, [load]);

  const rows = useMemo(() => {
    if (!bookings) return [];
    const q = query.trim().toLowerCase();
    return bookings
      .filter((b) => (status === 'all' ? true : b.status === status))
      .filter((b) =>
        designer === 'all'
          ? true
          : designer === 'unassigned'
            ? b.designer_slug === null
            : b.designer_slug === designer,
      )
      .filter((b) =>
        q
          ? [
              b.booking_code,
              b.website_name,
              b.website_type,
              b.client_name,
              b.client_phone,
              b.client_email,
              b.designer_slug ?? 'unassigned',
            ]
              .join(' ')
              .toLowerCase()
              .includes(q)
          : true,
      );
  }, [bookings, query, status, designer]);

  const stats = useMemo(() => {
    const all = bookings ?? [];
    return {
      total: all.length,
      active: all.filter((b) => !['Completed', 'Cancelled'].includes(b.status)).length,
      pending: all.filter((b) => b.status === 'Pending').length,
      unassigned: all.filter((b) => b.designer_slug === null).length,
    };
  }, [bookings]);

  const exportCsv = () => {
    const header = [
      'Booking code',
      'Project',
      'Type',
      'Client',
      'Phone',
      'Email',
      'Designer',
      'Status',
      'Budget',
      'Deadline',
      'Created',
    ];
    const lines = rows.map((b) =>
      [
        b.booking_code,
        b.website_name,
        b.website_type,
        b.client_name,
        b.client_phone,
        b.client_email,
        b.designer_slug ? DESIGNER_LABEL[b.designer_slug] ?? b.designer_slug : 'Unassigned',
        b.status,
        b.budget,
        b.deadline,
        b.created_at.slice(0, 10),
      ]
        .map(csvCell)
        .join(','),
    );
    const csv = [header.join(','), ...lines].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `duo-pixel-orders-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setFlash(`Exported ${rows.length} order${rows.length === 1 ? '' : 's'} to CSV`);
    window.setTimeout(() => setFlash(''), 3000);
  };

  if (!bookings) return <Spinner label="Loading orders…" />;

  return (
    <div className="container-x py-10 sm:py-14">
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="eyebrow !py-1">
            <ShieldCheck size={13} className="inline" /> Agency admin
          </span>
          <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">
            All orders
          </h1>
          <p className="mt-1 text-sm text-ink-300">
            Every booking from both designers and the unassigned pool, in one table.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={exportCsv} className="btn-ghost !py-2.5">
            <Download size={15} /> Export CSV
          </button>
          <button
            type="button"
            onClick={async () => {
              await signOut();
              window.location.assign(siteUrl('/'));
            }}
            className="inline-flex items-center gap-2 rounded-full border border-ink-600 px-4 py-2.5 text-sm text-ink-300 transition hover:border-accent/50 hover:text-accent"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat value={stats.total} label="Total orders" />
        <Stat value={stats.active} label="Active" />
        <Stat value={stats.pending} label="Awaiting acceptance" />
        <Stat value={stats.unassigned} label="Unassigned" />
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

      {/* filters */}
      <div className="mt-7 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-500"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search code, client, project…"
              aria-label="Search orders"
              className="input max-w-xs !py-2.5 !pl-9"
            />
          </div>
          <select
            value={designer}
            onChange={(e) => setDesigner(e.target.value as DesignerFilter)}
            aria-label="Filter by designer"
            className="input max-w-[190px] !appearance-none !py-2.5"
          >
            {DESIGNER_FILTERS.map((d) => (
              <option key={d.value} value={d.value} className="bg-ink-900">
                {d.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-ink-400">
            {rows.length} of {bookings.length} shown
          </span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cx(
                'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition',
                status === s
                  ? 'border-accent bg-accent/15 text-accent'
                  : 'border-ink-700 text-ink-400 hover:text-ink-200',
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* table */}
      <div className="mt-6">
        {rows.length === 0 ? (
          <EmptyState
            title="No orders match"
            body="Try a different search or clear the status and designer filters."
            action={
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setStatus('all');
                  setDesigner('all');
                }}
                className="btn-primary"
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <div className="card overflow-x-auto p-0">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead>
                <tr className="border-b border-ink-700 text-[11px] uppercase tracking-wider text-ink-400">
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Client</th>
                  <th className="px-4 py-3 font-semibold">Designer</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Deadline</th>
                  <th className="px-4 py-3 font-semibold">Placed</th>
                  <th className="px-4 py-3" aria-label="Open" />
                </tr>
              </thead>
              <tbody>
                {rows.map((b) => (
                  <tr
                    key={b.id}
                    className="border-b border-ink-800/70 transition last:border-0 hover:bg-ink-900/60"
                  >
                    <td className="px-4 py-3.5">
                      <Link
                        to={`/admin/bookings/${b.id}`}
                        className="font-mono text-xs font-semibold tracking-widest text-accent hover:underline"
                      >
                        {b.booking_code}
                      </Link>
                      <p className="mt-1 max-w-[220px] truncate font-display text-sm font-semibold text-white">
                        {b.website_name}
                      </p>
                      <p className="text-xs text-ink-500">{b.website_type}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-ink-100">{b.client_name}</p>
                      <p className="max-w-[170px] truncate text-xs text-ink-500">
                        {b.client_phone}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      {b.designer_slug ? (
                        <span className="chip !py-1 !text-[11px]">
                          {DESIGNER_LABEL[b.designer_slug] ?? b.designer_slug}
                        </span>
                      ) : (
                        <span className="chip !border-amber-soft/40 !bg-amber-soft/10 !py-1 !text-[11px] !text-amber-soft">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusPill status={b.status} />
                    </td>
                    <td className="px-4 py-3.5 text-ink-300">{b.deadline}</td>
                    <td className="px-4 py-3.5 text-xs text-ink-400">
                      {formatDate(b.created_at)}
                      <br />
                      {daysAgo(b.created_at)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        to={`/admin/bookings/${b.id}`}
                        aria-label={`Open order ${b.booking_code}`}
                        className="grid h-8 w-8 place-items-center rounded-full border border-ink-600 text-ink-300 transition hover:border-accent/50 hover:text-accent"
                      >
                        <ArrowUpRight size={15} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-5 text-xs text-ink-500">
        Signed in as {user?.email} · questions about an order?{' '}
        <a
          href={`tel:${AGENCY.whatsapp}`}
          className="text-accent transition hover:underline"
        >
          {AGENCY.whatsapp}
        </a>
      </p>
    </div>
  );
}
