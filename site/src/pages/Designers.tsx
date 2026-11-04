import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { AvailabilityRow } from '@/components/cards';
import { Reveal, SectionHeading, Spinner } from '@/components/ui';
import { useDesigners } from '@/lib/useDesigners';
import { AGENCY } from '@/lib/seed';
import { contactWhatsAppMessage, whatsappLink } from '@/lib/format';

export default function Designers() {
  const designers = useDesigners();

  useEffect(() => {
    document.title = 'Our Designers — Duo Pixel Agency';
  }, []);

  return (
    <div className="container-x py-14 sm:py-20">
      <SectionHeading
        eyebrow="The team"
        title="Meet the two designers behind every project"
        description="Both work inside the same process and the same quality bar. Choose by specialty — or let us match you."
      />

      {!designers ? (
        <Spinner label="Loading designers…" />
      ) : (
        <div className="space-y-6">
          {designers.map((d, i) => (
            <Reveal key={d.slug} delay={i * 0.08}>
              <article className="card overflow-hidden">
                <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="font-display text-2xl font-bold text-white">{d.name}</h2>
                      <span
                        className={
                          d.availability === 'Available'
                            ? 'rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-accent'
                            : 'rounded-full border border-amber-soft/40 bg-amber-soft/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-soft'
                        }
                      >
                        {d.availability}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-accent">{d.title}</p>
                    <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-300">{d.bio}</p>

                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {d.skills.map((s) => (
                        <span key={s} className="chip !py-1 !text-[11px]">
                          {s}
                        </span>
                      ))}
                    </div>

                    <div className="mt-5">
                      <AvailabilityRow designer={d} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 lg:w-56">
                    <Link to={`/designer/${d.slug}`} className="btn-ghost w-full">
                      View full profile <ArrowUpRight size={16} />
                    </Link>
                    <Link to={`/book?designer=${d.slug}`} className="btn-primary w-full">
                      Book {d.short_name}
                    </Link>
                    <a
                      href={whatsappLink(AGENCY.whatsapp, contactWhatsAppMessage())}
                      target="_blank"
                      rel="noreferrer"
                      className="text-center text-xs text-ink-400 transition hover:text-accent"
                    >
                      or chat on WhatsApp first
                    </a>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}

          <Reveal>
            <div className="card flex flex-col items-start gap-4 border-dashed p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-lg font-semibold text-white">
                  Not sure who to pick?
                </h3>
                <p className="mt-1 text-sm text-ink-300">
                  Choose “No preference” while booking and we will assign whoever is the best fit
                  for your website type.
                </p>
              </div>
              <Link to="/book" className="btn-primary shrink-0">
                Book a Design <ArrowUpRight size={16} />
              </Link>
            </div>
          </Reveal>
        </div>
      )}
    </div>
  );
}
