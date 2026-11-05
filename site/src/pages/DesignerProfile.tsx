import { useEffect, useMemo } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowUpRight, CalendarClock, Mail, MessageCircle, Wrench } from 'lucide-react';
import Avatar from '@/components/Avatar';
import { AvailabilityRow, ProjectCard } from '@/components/cards';
import { Rating, Reveal, SectionHeading, Spinner, Stat } from '@/components/ui';
import { AGENCY, PROJECTS } from '@/lib/seed';
import { formatDate, whatsappLink } from '@/lib/format';
import { useDesigner, useReviews } from '@/lib/useDesigners';

export default function DesignerProfile() {
  const { slug } = useParams();
  const designer = useDesigner(slug);
  const reviews = useReviews();

  const projects = useMemo(
    () => PROJECTS.filter((p) => p.designer === slug),
    [slug],
  );

  const myReviews = useMemo(
    () => (reviews ?? []).filter((r) => r.designer === slug),
    [reviews, slug],
  );

  useEffect(() => {
    if (designer) document.title = `${designer.name} — Duo Pixel Agency`;
  }, [designer]);

  if (!designer && reviews) return <Navigate to="/designers" replace />;
  if (!designer) return <Spinner label="Loading profile…" />;

  const avgRating =
    myReviews.length > 0
      ? myReviews.reduce((sum, r) => sum + r.rating, 0) / myReviews.length
      : designer.stats.rating;

  const message = `Hi ${designer.short_name}! I saw your profile on Duo Pixel Agency and would like to discuss a project.`;

  return (
    <div className="pb-4">
      {/* header */}
      <section className="relative overflow-hidden border-b border-ink-800">
        <div className="absolute inset-0 pixel-grid opacity-60" aria-hidden="true" />
        <div
          className="absolute -top-24 right-0 h-72 w-72 rounded-full blur-[110px]"
          style={{ background: `${designer.photo_color[0]}22` }}
          aria-hidden="true"
        />
        <div className="container-x relative py-10 sm:py-14">
          <Link
            to="/designers"
            className="text-sm text-ink-400 transition hover:text-accent"
          >
            ← All designers
          </Link>

          <div className="mt-6 grid gap-7 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <Avatar designer={designer} size={112} className="shrink-0 rounded-3xl" />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display text-3xl font-bold text-white sm:text-4xl">
                    {designer.name}
                  </h1>
                  <span
                    className={
                      designer.availability === 'Available'
                        ? 'rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent'
                        : 'rounded-full border border-amber-soft/40 bg-amber-soft/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-soft'
                    }
                  >
                    {designer.availability}
                  </span>
                </div>
                <p className="mt-1.5 text-sm font-semibold text-accent">{designer.title}</p>
                <p className="mt-1 text-sm text-ink-400">
                  {designer.experience} · {designer.availability_note}
                </p>
                <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-200">
                  {designer.bio}
                </p>
                <div className="mt-5">
                  <AvailabilityRow designer={designer} />
                </div>
              </div>
            </div>

            <div className="flex w-full flex-col gap-3 lg:w-64">
              <Link to={`/book?designer=${designer.slug}`} className="btn-primary">
                Book {designer.short_name} <ArrowUpRight size={16} />
              </Link>
              <a
                href={whatsappLink(designer.whatsapp || AGENCY.whatsapp, message)}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                <MessageCircle size={16} /> Message on WhatsApp
              </a>
              <a href={`mailto:${designer.email}`} className="btn-ghost">
                <Mail size={16} /> {designer.email}
              </a>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat value={designer.stats.projects} label="Projects" />
            <Stat value={designer.stats.clients} label="Happy clients" />
            <Stat value={`${avgRating.toFixed(1)}★`} label="Avg. rating" />
            <Stat value={`${designer.avg_delivery_days} days`} label="Avg. delivery" />
          </div>
        </div>
      </section>

      {/* skills + tools */}
      <section className="container-x grid gap-8 py-12 sm:py-16 lg:grid-cols-2">
        <Reveal>
          <div className="card h-full p-6">
            <h2 className="font-display text-lg font-semibold text-white">Skills</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {designer.skills.map((s) => (
                <span key={s} className="chip transition hover:border-accent/50 hover:text-accent">
                  {s}
                </span>
              ))}
            </div>
            <div className="mt-6 border-t border-ink-700 pt-5 text-sm">
              <p className="text-ink-400">Average delivery</p>
              <p className="mt-1 font-display text-lg font-bold text-white">
                {designer.avg_delivery_days} days
              </p>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="card h-full p-6">
            <h2 className="flex items-center gap-2 font-display text-lg font-semibold text-white">
              <Wrench size={16} className="text-accent" /> Tools I use
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {designer.tools.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-accent/25 bg-accent/5 p-4">
              <CalendarClock size={16} className="mt-0.5 shrink-0 text-accent" />
              <p className="text-sm leading-relaxed text-ink-300">
                {designer.availability === 'Available'
                  ? `Currently taking new work. ${designer.availability_note}.`
                  : `Fully booked right now — ${designer.availability_note}. You can still book; work starts when a slot opens.`}
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* portfolio */}
      <section className="border-y border-ink-800 bg-ink-900/50">
        <div className="container-x py-12 sm:py-16">
          <SectionHeading
            eyebrow="Portfolio"
            title={`Projects by ${designer.short_name}`}
            description="Click any card to open the live site."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <ProjectCard key={p.id} project={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* reviews */}
      <section className="container-x py-12 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            eyebrow="Reviews"
            title="What clients say"
            className="mb-0"
          />
          <div className="mb-10 flex items-center gap-3 rounded-2xl border border-ink-700 bg-ink-850 px-5 py-3">
            <span className="font-display text-3xl font-bold text-white">
              {avgRating.toFixed(1)}
            </span>
            <div>
              <Rating value={avgRating} showValue={false} size={16} />
              <p className="text-xs text-ink-400">{myReviews.length} verified reviews</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {myReviews.map((r, i) => (
            <Reveal key={r.id} delay={i * 0.06}>
              <article className="card flex h-full flex-col p-6">
                <div className="flex items-center justify-between gap-3">
                  <Rating value={r.rating} />
                  <span className="text-xs text-ink-400">{formatDate(r.date)}</span>
                </div>
                <p className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-200">“{r.text}”</p>
                <div className="mt-5 border-t border-ink-700 pt-4">
                  <p className="text-sm font-semibold text-white">{r.client}</p>
                  <p className="text-xs text-ink-400">
                    {r.role} · {r.project}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-x pb-4">
        <Reveal>
          <div className="card relative overflow-hidden p-8 text-center sm:p-12">
            <div className="absolute inset-0 pixel-grid opacity-40" aria-hidden="true" />
            <div className="relative">
              <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
                Want {designer.short_name} to work on your website?
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-300">
                Booking takes about six minutes. You will get a booking ID straight away and a
                reply within one working day.
              </p>
              <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
                <Link to={`/book?designer=${designer.slug}`} className="btn-primary">
                  Book {designer.short_name} <ArrowUpRight size={16} />
                </Link>
                <Link to="/pricing" className="btn-ghost">
                  See packages
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
