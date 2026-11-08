import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock,
  MapPin,
  Star,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import ProjectArt from './ProjectArt';
import { Rating } from './ui';
import { cx } from '../lib/format';
import type { Designer, Faq, Package, Project, Service, Testimonial } from '../lib/types';

/* ------------------------------------------------------------ Designer */

export function DesignerCard({ designer }: { designer: Designer }) {
  const [a, b] = designer.photo_color;

  return (
    <motion.article
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      className="card group flex h-full flex-col overflow-hidden rounded-3xl border border-ink-700/50 shadow-card"
    >
      <div className="relative overflow-hidden rounded-t-3xl border-b border-ink-700/50">
        {/* photo-style header background */}
        <div className="absolute inset-0 bg-gradient-to-br from-ink-800 to-ink-900" />
        <div className="absolute inset-0 pixel-grid opacity-50" />
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 60% 20%, ${a}15, transparent 60%), radial-gradient(circle at 20% 80%, ${b}12, transparent 50%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-accent/5 via-ink-900 to-ink-900 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="relative flex items-end gap-4 p-6">
          <div className="relative z-10">
            <Avatar designer={designer} size={96} className="rounded-2xl group-hover:scale-105 transition-transform duration-500 ring-2 ring-accent/25 ring-offset-2 ring-offset-ink-950 shadow-[0_0_30px_rgba(0,0,0,0.5)]" />
          </div>
          <div className="pb-1 z-10 relative">
            <span
              className={cx(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                designer.availability === 'Available'
                  ? 'border-accent/40 bg-accent/10 text-accent shadow-[0_0_12px_rgba(185,255,57,0.35)]'
                  : 'border-amber-soft/40 bg-amber-soft/10 text-amber-soft shadow-[0_0_12px_rgba(255,190,70,0.35)]',
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
              {designer.availability}
            </span>
            <p className="mt-2 text-xs text-ink-400">{designer.availability_note}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-xl font-bold text-white">{designer.name}</h3>
          <span className="shrink-0 text-[10px] font-bold text-accent uppercase tracking-wider">
            {designer.availability}
          </span>
        </div>
        <p className="mt-1 text-sm font-medium text-accent">{designer.title}</p>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-300">{designer.bio}</p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {designer.skills.slice(0, 5).map((skill) => (
            <span key={skill} className="chip !py-1 !text-[11px]">
              {skill}
            </span>
          ))}
          {designer.skills.length > 5 && (
            <span className="chip !py-1 !text-[11px]">+{designer.skills.length - 5}</span>
          )}
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 border-t border-ink-700 pt-5 text-center">
          <div className="p-3 rounded-xl bg-ink-800/50 border border-ink-700/40">
            <p className="font-display text-base font-bold text-white">{designer.avg_delivery_days}d</p>
            <p className="text-[10px] uppercase tracking-wider text-ink-400">Avg delivery</p>
          </div>
          <div className="p-3 rounded-xl bg-ink-800/50 border border-ink-700/40">
            <p className="font-display text-base font-bold text-white">{designer.stats.rating}</p>
            <p className="text-[10px] uppercase tracking-wider text-ink-400">Rating</p>
          </div>
        </div>

        <div className="mt-7 flex gap-2">
          <Link to={`/designer/${designer.slug}`} className="btn-ghost flex-1 !px-4 !py-3 rounded-xl text-sm font-semibold">
            View profile
          </Link>
          <Link
            to={`/book?designer=${designer.slug}`}
            className="btn-primary flex-1 !px-4 !py-3 rounded-xl text-sm font-semibold"
          >
            Book {designer.short_name}
          </Link>
        </div>
      </div>
    </motion.article>
  );
}

/* -------------------------------------------------------------- Project */

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const [bg, accent, mid] = project.palette;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      className="card group overflow-hidden rounded-3xl border border-ink-700/50 shadow-card"
    >
      <div className="relative overflow-hidden rounded-t-3xl aspect-[16/10]">
        {/* subtle photo-style gradient behind the screenshot */}
        <div className="absolute inset-0 bg-gradient-to-br from-ink-900 via-ink-850 to-ink-950" />
        <div className="absolute inset-0 pixel-grid opacity-40" />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${accent}20, transparent 70%)`,
          }}
        />
        <ProjectArt
          project={project}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute left-4 top-4 z-10 rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur-md shadow-lg">
          {project.category}
        </span>
        <span className="absolute right-4 top-4 z-10 rounded-full border border-white/10 bg-black/50 px-2 py-1 text-[10px] font-medium text-ink-200 backdrop-blur">
          {project.year}
        </span>
      </div>
      <div className="p-5 z-10 relative flex flex-col">
        <h3 className="font-display text-lg font-semibold text-white">{project.title}</h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-300">
          {project.description}
        </p>
        <a
          href={project.live_url}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition hover:gap-2.5"
        >
          Visit live site <ArrowUpRight size={15} />
        </a>
      </div>
    </motion.article>
  );
}

/* -------------------------------------------------------------- Package */

export function PackageCard({
  pkg,
  onChoose,
  editable = false,
  onPriceChange,
}: {
  pkg: Package;
  onChoose?: (pkg: Package) => void;
  editable?: boolean;
  onPriceChange?: (price: number) => void;
}) {
  const [a, b] = [pkg.price_note === 'one-time' ? '#B9FF39' : '#FF7A45', '#0E0E11'];

  return (
    <article
      className={cx(
        'card relative flex h-full flex-col p-6 rounded-3xl border border-ink-700/50 shadow-card group',
        pkg.popular && 'border-accent/50 shadow-glow',
      )}
    >
      {pkg.popular && (
        <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-950 shadow-[0_0_15px_rgba(185,255,57,0.4)]">
          Most booked
        </span>
      )}
      {/* decorative glow behind header */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-r from-transparent via-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <h3 className="relative z-10 font-display text-xl font-bold text-white">{pkg.name}</h3>
      <p className="relative z-10 mt-1.5 min-h-[44px] text-sm leading-relaxed text-ink-300">
        {pkg.summary}
      </p>

      <div className="relative z-10 mt-6 flex items-baseline gap-2">
        {editable ? (
          <label className="flex items-center gap-1 text-sm text-ink-300">
            <input
              type="number"
              min={0}
              defaultValue={pkg.price}
              onBlur={(e) => onPriceChange?.(Math.max(0, Number(e.target.value)))}
              className="w-28 rounded-lg border border-ink-600 bg-ink-900 px-2 py-1.5 font-display text-lg font-bold text-white focus:border-accent focus:outline-none"
              aria-label={`${pkg.name} price`}
            />
          </label>
        ) : (
          <span className="font-display text-3xl font-bold text-white">
            {pkg.price ? 'Get quote' : 'Custom'}
          </span>
        )}
        <span className="text-sm text-ink-400">{pkg.price_note}</span>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 text-xs text-ink-400">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-900/60 px-3 py-1">
          <Clock size={13} className="text-accent" /> {pkg.delivery}
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 bg-ink-900/60 px-3 py-1">
          <Star size={13} className="text-amber-soft" /> Revision rounds included
        </span>
      </div>

      <ul className="mt-6 flex-1 space-y-2.5 border-t border-ink-700 pt-6">
        {pkg.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-ink-200">
            <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent/15 text-accent shadow-[0_0_8px_rgba(185,255,57,0.3)]">
              <Check size={11} strokeWidth={3} />
            </span>
            {f}
          </li>
        ))}
      </ul>

      {onChoose && (
        <button type="button" onClick={() => onChoose(pkg)} className="relative z-10 btn-primary mt-6 w-full rounded-xl text-sm font-semibold shadow-[0_0_20px_rgba(185,255,57,0.3)]">
          Choose {pkg.name}
          <ArrowUpRight size={16} />
        </button>
      )}
    </article>
  );
}

/* ---------------------------------------------------------- Testimonial */

export function TestimonialCard({ item }: { item: Testimonial }) {
  const [a, b] = ['#B9FF39', '#FF7A45'];

  return (
    <article className="card flex h-full flex-col p-6 rounded-3xl border border-ink-700/50 shadow-card relative overflow-hidden">
      {/* decorative corner gradient */}
      <div className="absolute top-0 right-0 h-8 w-24 bg-gradient-to-l from-accent/20 to-transparent" />
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-4 mb-5">
          <Rating value={item.rating} />
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-accent/80 to-accent-dim font-display text-sm font-bold text-ink-950 shadow-[0_0_15px_rgba(185,255,57,0.3)]">
            {item.client
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')}
          </span>
        </div>
        <p className="flex-1 text-[15px] leading-relaxed text-ink-200">“{item.text}”</p>
        <div className="mt-6 flex items-center gap-3 border-t border-ink-700 pt-4">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-accent/80 to-accent-dim font-display text-sm font-bold text-ink-950 ring-2 ring-accent/20 ring-offset-2 ring-offset-ink-950">
            {item.client
              .split(' ')
              .map((w) => w[0])
              .slice(0, 2)
              .join('')}
          </span>
          <div>
            <p className="text-sm font-semibold text-white">{item.client}</p>
            <p className="text-xs text-ink-400">
              {item.role} · {item.project}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------ FAQ */

export function FaqItem({ item, open, onToggle }: { item: Faq; open: boolean; onToggle: () => void }) {
  return (
    <div className="card overflow-hidden rounded-3xl border border-ink-700/50 shadow-card group">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-ink-800/60 sm:px-8"
      >
        <span className="font-display text-[15px] font-semibold text-white sm:text-base">
          {item.question}
        </span>
        <ChevronDown
          size={18}
          className={cx(
            'shrink-0 text-accent transition-transform duration-300',
            open && 'rotate-180',
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeInOut' }}
          >
            <p className="px-6 pb-6 text-sm leading-relaxed text-ink-300 sm:px-8">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --------------------------------------------------------------- Service */

const ICONS: Record<string, JSX.Element> = {
  palette: <span className="text-lg">🎨</span>,
  code: <span className="text-lg">⌨️</span>,
  cart: <span className="text-lg">🛍️</span>,
  layout: <span className="text-lg">📊</span>,
  sparkles: <span className="text-lg">✨</span>,
  shield: <span className="text-lg">🛡️</span>,
};

export function ServiceCard({ service, index = 0 }: { service: Service; index?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.45, delay: (index % 3) * 0.07 }}
      className="card card-hover p-6 rounded-3xl border border-ink-700/50 shadow-card relative overflow-hidden"
    >
      {/* decorative top-right glow */}
      <div className="absolute top-0 right-0 h-6 w-20 bg-gradient-to-l from-accent/15 to-transparent" />
      <div className="relative z-10">
        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-accent/30 bg-accent/10 shadow-[0_0_15px_rgba(185,255,57,0.2)]">
          {ICONS[service.icon] ?? ICONS.palette}
        </div>
        <h3 className="relative z-10 mt-5 font-display text-lg font-semibold text-white">{service.title}</h3>
        <p className="relative z-10 mt-2 text-sm leading-relaxed text-ink-300">{service.description}</p>
        <ul className="relative z-10 mt-5 space-y-1.5">
          {service.points.map((p) => (
            <li key={p} className="flex items-center gap-2 text-[13px] text-ink-300">
              <Check size={13} className="text-accent" /> {p}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------- Availability row */

export function AvailabilityRow({ designer }: { designer: Designer }) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-300">
      <span className="inline-flex items-center gap-1.5">
        <Clock size={14} className="text-accent" />
        ~{designer.avg_delivery_days} day average delivery
      </span>
      <span className="inline-flex items-center gap-1.5">
        <MapPin size={14} className="text-accent" /> Hyderabad · remote worldwide
      </span>
    </div>
  );
}
