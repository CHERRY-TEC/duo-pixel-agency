import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { Star } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { cx } from '../lib/format';
import type { BookingStatus } from '../lib/types';

/* ---------------------------------------------------------------- Reveal */

type RevealProps = HTMLMotionProps<'div'> & {
  delay?: number;
  y?: number;
  children: ReactNode;
};

export function Reveal({ delay = 0, y = 22, children, ...rest }: RevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------- Section heading */

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className = '',
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: 'left' | 'center';
  className?: string;
}) {
  return (
    <div
      className={cx(
        'mb-10 max-w-2xl',
        align === 'center' && 'mx-auto mb-12 text-center',
        className,
      )}
    >
      {eyebrow && (
        <span className="eyebrow mb-4">
          {eyebrow}
        </span>
      )}
      <h2 className="text-balance font-display text-3xl font-bold leading-[1.1] text-white sm:text-4xl lg:text-[44px]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-[15px] leading-relaxed text-ink-300 sm:text-base">
          {description}
        </p>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Rating */

export function Rating({
  value,
  size = 15,
  showValue = true,
  count,
}: {
  value: number;
  size?: number;
  showValue?: boolean;
  count?: number;
}) {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`${value} out of 5`}>
      <span className="flex items-center gap-0.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            size={size}
            className={
              i < full
                ? 'fill-amber-soft text-amber-soft'
                : i === full && half
                  ? 'fill-amber-soft/50 text-amber-soft'
                  : 'text-ink-500'
            }
          />
        ))}
      </span>
      {showValue && (
        <span className="text-xs font-semibold text-ink-200">
          {value.toFixed(1)}
          {count !== undefined && <span className="font-normal text-ink-400"> ({count})</span>}
        </span>
      )}
    </span>
  );
}

/* ----------------------------------------------------------- Status pill */

const STATUS_STYLE: Record<string, string> = {
  Pending: 'border-amber-soft/40 bg-amber-soft/10 text-amber-soft',
  Accepted: 'border-accent/40 bg-accent/10 text-accent',
  'In Design': 'border-sky-400/40 bg-sky-400/10 text-sky-300',
  Review: 'border-violet-400/40 bg-violet-400/10 text-violet-300',
  Revisions: 'border-orange-400/40 bg-orange-400/10 text-orange-300',
  Delivered: 'border-teal-400/40 bg-teal-400/10 text-teal-300',
  Completed: 'border-accent/50 bg-accent/15 text-accent',
  Cancelled: 'border-red-400/40 bg-red-400/10 text-red-300',
};

export function StatusPill({ status, className = '' }: { status: BookingStatus | string; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-wide',
        STATUS_STYLE[status] ?? 'border-ink-600 bg-ink-800 text-ink-200',
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

/* -------------------------------------------------------------- Timeline */

export function Timeline({
  history,
  current,
}: {
  history: { status: string; at: string; note?: string }[];
  current: BookingStatus | string;
}) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
    });

  return (
    <ol className="relative space-y-6 pl-7">
      <span
        className="absolute left-[9px] top-2 h-[calc(100%-16px)] w-px bg-gradient-to-b from-accent/60 via-ink-600 to-transparent"
        aria-hidden="true"
      />
      {[...history].reverse().map((event, i) => (
        <li key={`${event.status}-${event.at}-${i}`} className="relative">
          <span
            className={cx(
              'absolute -left-7 top-1.5 h-[18px] w-[18px] rounded-full border-2',
              i === 0 ? 'border-accent bg-accent/25' : 'border-ink-600 bg-ink-850',
            )}
            aria-hidden="true"
          />
          <p
            className={cx(
              'text-sm font-semibold',
              i === 0 ? 'text-white' : 'text-ink-200',
            )}
          >
            {event.status}
            {event.status === current && (
              <span className="ml-2 text-[11px] font-medium uppercase tracking-wide text-accent">
                current
              </span>
            )}
          </p>
          <p className="mt-0.5 text-xs text-ink-400">{fmt(event.at)}</p>
          {event.note && <p className="mt-1 text-sm text-ink-300">{event.note}</p>}
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------ Empty state */

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl border border-ink-600 bg-ink-800">
        <span className="h-3 w-3 animate-blink bg-accent" />
      </div>
      <h3 className="font-display text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-300">{body}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

/* ---------------------------------------------------------------- Spinner */

export function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-16 text-sm text-ink-300">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-ink-600 border-t-accent" />
      {label}
    </div>
  );
}

/* ------------------------------------------------------------- Stat block */

export function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl border border-ink-700 bg-ink-850 px-4 py-3">
      <p className="font-display text-xl font-bold text-white">{value}</p>
      <p className="mt-0.5 text-[11px] uppercase tracking-wider text-ink-400">{label}</p>
    </div>
  );
}

/* ------------------------------------------------------------ Back link */

export function BackLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link
      to={to}
      className="inline-flex items-center gap-1.5 text-sm text-ink-400 transition hover:text-accent"
    >
      ← {children}
    </Link>
  );
}
