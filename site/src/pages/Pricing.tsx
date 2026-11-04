import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Check, Info, MessageCircle } from 'lucide-react';
import { PackageCard } from '@/components/cards';
import { Reveal, SectionHeading, Spinner } from '@/components/ui';
import { AGENCY } from '@/lib/seed';
import { contactWhatsAppMessage, whatsappLink } from '@/lib/format';
import { usePackages } from '@/lib/useDesigners';
import type { Package } from '@/lib/types';

const INCLUDED = [
  'Custom design — never a bought template',
  'Mobile-first responsive build',
  'SEO basics, analytics and fast hosting setup',
  'Fixed quote agreed before work starts',
  'Source code and full ownership handed over',
  '30 days of free fixes after launch',
];

export default function Pricing() {
  const packages = usePackages();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Pricing & Packages — Duo Pixel Agency';
  }, []);

  const choose = (pkg: Package) => {
    navigate(`/book?package=${pkg.id}`);
  };

  return (
    <div className="pb-4">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pixel-grid opacity-60" aria-hidden="true" />
        <div className="container-x relative py-14 sm:py-20">
          <SectionHeading
            eyebrow="Pricing"
            title="Simple packages, fixed prices"
            description="Every price below is what you pay — no hourly surprises. Pick a package while booking and we will confirm scope on the first call."
            align="center"
          />
          <div className="mx-auto flex max-w-2xl flex-wrap justify-center gap-2">
            {['No hidden fees', '50% to start, 50% at launch', 'GST invoice provided'].map((t) => (
              <span key={t} className="chip">
                <Check size={12} className="text-accent" /> {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {!packages ? (
        <Spinner label="Loading packages…" />
      ) : (
        <section className="container-x">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg, i) => (
              <Reveal key={pkg.id} delay={(i % 3) * 0.07} className="h-full">
                <PackageCard pkg={pkg} onChoose={choose} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* what is included */}
      <section className="mt-16 border-y border-ink-800 bg-ink-900/50">
        <div className="container-x grid gap-8 py-14 sm:py-20 lg:grid-cols-[1fr_1.1fr]">
          <SectionHeading
            eyebrow="Always included"
            title="Whatever package you pick"
            description="These are not add-ons. They are part of how every Duo Pixel project runs."
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {INCLUDED.map((item, i) => (
              <Reveal key={item} delay={i * 0.05}>
                <div className="card flex h-full items-start gap-3 p-4">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-ink-950">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  <p className="text-sm leading-relaxed text-ink-200">{item}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* process + custom quote */}
      <section className="container-x grid gap-6 py-14 sm:py-20 lg:grid-cols-2">
        <Reveal>
          <div className="card h-full p-6 sm:p-8">
            <h3 className="font-display text-xl font-bold text-white">Payment schedule</h3>
            <ul className="mt-5 space-y-4">
              {[
                ['50%', 'To reserve your slot and start design'],
                ['25%', 'When you approve the design and we start building'],
                ['25%', 'On launch day, before handover'],
              ].map(([pct, text]) => (
                <li key={pct} className="flex items-start gap-4">
                  <span className="grid h-12 w-14 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/10 font-display text-sm font-bold text-accent">
                    {pct}
                  </span>
                  <p className="pt-2 text-sm leading-relaxed text-ink-300">{text}</p>
                </li>
              ))}
            </ul>
            <p className="mt-6 flex items-start gap-2 rounded-xl border border-ink-700 bg-ink-800/60 p-4 text-xs leading-relaxed text-ink-400">
              <Info size={14} className="mt-0.5 shrink-0 text-accent" />
              Domain, hosting and third-party services are billed at actual cost with receipts —
              we never mark them up.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="card relative h-full overflow-hidden p-6 sm:p-8">
            <div className="absolute inset-0 pixel-grid opacity-40" aria-hidden="true" />
            <div className="relative">
              <span className="eyebrow">Custom scope</span>
              <h3 className="mt-4 font-display text-xl font-bold text-white">
                Something outside these boxes?
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-300">
                AI features, migrations, internal tools, integrations with your existing software —
                tell us the outcome you want and we will send a written scope with a fixed price
                and timeline within 24 hours.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link to="/book?package=custom" className="btn-primary">
                  Request a quote <ArrowUpRight size={16} />
                </Link>
                <a
                  href={whatsappLink(AGENCY.whatsapp, contactWhatsAppMessage())}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-ghost"
                >
                  <MessageCircle size={16} /> Ask on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      <section className="container-x pb-4 text-center">
        <Reveal>
          <h2 className="font-display text-2xl font-bold text-white">
            Still comparing? Start with a booking — it is free.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-300">
            Submit the form, get a booking ID, and we will tell you honestly which package fits —
            even if it is the cheaper one.
          </p>
          <Link to="/book" className="btn-primary mt-6">
            Book a Design <ArrowUpRight size={16} />
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
