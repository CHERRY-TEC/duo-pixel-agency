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
import { cx, inr } from '../lib/format';
import type { Designer, Faq, Package, Project, Service, Testimonial } from '../lib/types';

/* ------------------------------------------------------------ Designer */

export function DesignerCard({ designer }: { designer: Designer }) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      className="card group flex h-full flex-col overflow-hidden"
    >
      <div className="relative overflow-hidden bg-gradient-to-br from-ink-800 to-ink-900">
        <div className="absolute inset-0 pixel-grid opacity-60" />
        <div className="relative flex items-end gap-4 p-6">
          <Avatar designer={designer} size={96} className="rounded-2xl" />
          <div className="pb-1">
            <span
              className={cx(
                'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide',
                designer.availability === 'Available'
                  ? 'border-accent/40 bg-accent/10 text-accent'
                  : 'border-amber-soft/40 bg-amber-soft/10 text-amber-soft',
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {designer.availability}
            </span>
            <p className="mt-2 text-xs text-ink-400">{designer.availability_note}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="font-display text-xl font-bold text-white">{designer.name}</h3>
        <p className="mt-1 text-sm font-medium text-accent">{designer.title}</p>
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-300">{designer.bio}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {designer.skills.slice(0, 5).map((skill) => (
            <span key={skill} className="chip !py-1 !text-[11px]">
              {skill}
            </span>
          ))}
          {designer.skills.length > 5 && (
            <span className="chip !py-1 !text-[11px]">+{designer.skills.length - 5}</span>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 border-t border-ink-700 pt-4 text-center">
          <div>
            <p className="font-display text-base font-bold text-white">{designer.avg_delivery_days}d</p>
            <p className="text-[10px] uppercase tracking-wider text-ink-400">Avg delivery</p>
          </div>
          <div>
            <p className="font-display text-base font-bold text-white">{designer.stats.rating}</p>
            <p className="text-[10px] uppercase tracking-wider text-ink-400">Rating</p>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <Link to={`/designer/${designer.slug}`} className="btn-ghost flex-1 !px-4 !py-2.5">
            View profile
          </Link>
          <Link
            to={`/book?designer=${designer.slug}`}
            className="btn-primary flex-1 !px-4 !py-2.5"
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
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      className="card group overflow-hidden"
    >
      <div className="relative overflow-hidden">
        <ProjectArt
          project={project}
          className="h-52 w-full object-cover transition duration-500 group-hover:scale-[1.03] sm:h-56"
        />
        <span className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/55 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
          {project.category}
        </span>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-semibold text-white">{project.title}</h3>
          <span className="shrink-0 text-xs text-ink-400">{project.year}</span>
        </div>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-300">
          {project.description}
        </p>
        <a
          href={project.live_url}
          target="_blank"
          rel="noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition hover:gap-2.5"
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
  return (
    <article
      className={cx(
        'card relative flex h-full flex-col p-6',
        pkg.popular && 'border-accent/50 shadow-glow',
      )}
    >
      {pkg.popular && (
        <span className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-950">
          Most booked
        </span>
      )}
      <h3 className="font-display text-xl font-bold text-white">{pkg.name}</h3>
      <p className="mt-1.5 min-h-[44px] text-sm leading-relaxed text-ink-300">{pkg.summary}</p>

      <div className="mt-5 flex items-baseline gap-2">
        {editable ? (
          <label className="flex items-center gap-1 text-sm text-ink-300">
            ₹
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
            {pkg.price ? inr(pkg.price) : 'Custom'}
          </span>
        )}
        <span className="text-sm text-ink-400">{pkg.price_note}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-xs text-ink-400">
        <span className="inline-flex items-center gap-1.5">
          <Clock size={13} className="text-accent" /> {pkg.delivery}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Star size={13} className="text-amber-soft" /> Revision rounds included
        </span>
      </div>

      <ul className="mt-5 flex-1 space-y-2.5 border-t border-ink-700 pt-5">
        {pkg.features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-sm text-ink-200">
            <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent/15 text-accent">
              <Check size={11} strokeWidth={3} />
            </span>
            {f}
          </li>
        ))}
      </ul>

      {onChoose && (
        <button type="button" onClick={() => onChoose(pkg)} className="btn-primary mt-6 w-full">
          Choose {pkg.name}
          <ArrowUpRight size={16} />
        </button>
      )}
    </article>
  );
}

/* ---------------------------------------------------------- Testimonial */

export function TestimonialCard({ item }: { item: Testimonial }) {
  return (
    <article className="card flex h-full flex-col p-6">
      <Rating value={item.rating} />
      <p className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-200">“{item.text}”</p>
      <div className="mt-5 flex items-center gap-3 border-t border-ink-700 pt-4">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-accent/80 to-accent-dim font-display text-sm font-bold text-ink-950">
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
    </article>
  );
}

/* ------------------------------------------------------------------ FAQ */

export function FaqItem({ item, open, onToggle }: { item: Faq; open: boolean; onToggle: () => void }) {
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-ink-800/60 sm:px-6"
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
            <p className="px-5 pb-5 text-sm leading-relaxed text-ink-300 sm:px-6">{item.answer}</p>
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
      className="card card-hover p-6"
    >
      <div className="grid h-11 w-11 place-items-center rounded-xl border border-accent/30 bg-accent/10">
        {ICONS[service.icon] ?? ICONS.palette}
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-white">{service.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-300">{service.description}</p>
      <ul className="mt-4 space-y-1.5">
        {service.points.map((p) => (
          <li key={p} className="flex items-center gap-2 text-[13px] text-ink-300">
            <Check size={13} className="text-accent" /> {p}
          </li>
        ))}
      </ul>
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
