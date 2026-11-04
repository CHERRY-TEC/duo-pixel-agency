import { motion } from 'framer-motion';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  MessageCircle,
  Star,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from '@/components/Avatar';
import { DesignerCard, FaqItem, ProjectCard, ServiceCard, TestimonialCard } from '@/components/cards';
import ProjectArt from '@/components/ProjectArt';
import { Rating, Reveal, SectionHeading } from '@/components/ui';
import { contactWhatsAppMessage, whatsappLink } from '@/lib/format';
import {
  AGENCY,
  DESIGNERS,
  FAQS,
  HOW_IT_WORKS,
  PROJECTS,
  SERVICES,
  TESTIMONIALS,
} from '@/lib/seed';

const MARQUEE = [
  'Landing pages',
  'Business websites',
  'Online stores',
  'Dashboards',
  'College portals',
  'Booking systems',
  'AI-integrated sites',
  'PWAs',
  'Brand refreshes',
];

function Hero() {
  const featured = PROJECTS[0];

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 pixel-grid opacity-70" aria-hidden="true" />
      <div
        className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-accent/10 blur-[130px]"
        aria-hidden="true"
      />
      <div
        className="absolute right-[-140px] top-40 h-72 w-72 rounded-full bg-[#3E7BFF]/10 blur-[110px]"
        aria-hidden="true"
      />

      <div className="container-x relative pb-16 pt-14 sm:pb-24 sm:pt-20 lg:pt-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <motion.span
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="eyebrow"
            >
              <span className="h-1.5 w-1.5 animate-blink rounded-full bg-accent" />
              2 slots open this month
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.08 }}
              className="mt-6 text-balance font-display text-[38px] font-bold leading-[1.04] text-white sm:text-6xl lg:text-[64px]"
            >
              Tell us the website you want.
              <span className="mt-1 block text-accent">We design it.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16 }}
              className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink-300 sm:text-lg"
            >
              {AGENCY.tagline} Pick a designer, describe your project in six short steps and get a
              booking ID in under a minute. No calls required to start — most projects begin on
              WhatsApp.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.24 }}
              className="mt-8 flex flex-col gap-3 sm:flex-row"
            >
              <Link to="/book" className="btn-primary group">
                Book a Design
                <ArrowUpRight size={17} className="transition group-hover:translate-x-0.5" />
              </Link>
              <a
                href={whatsappLink(AGENCY.whatsapp, contactWhatsAppMessage())}
                target="_blank"
                rel="noreferrer"
                className="btn-ghost"
              >
                <MessageCircle size={17} />
                Chat on WhatsApp
              </a>
            </motion.div>

            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.34 }}
              className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-300"
            >
              {['Fixed quotes', 'Daily progress on WhatsApp', 'Source code is yours'].map((t) => (
                <li key={t} className="inline-flex items-center gap-2">
                  <CheckCircle2 size={15} className="text-accent" /> {t}
                </li>
              ))}
            </motion.ul>
          </div>

          {/* hero visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="card overflow-hidden">
              <ProjectArt project={featured} className="h-56 w-full sm:h-64" />
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-semibold text-white">
                    {featured.title}
                  </p>
                  <p className="text-xs text-ink-400">Live project · {featured.category}</p>
                </div>
                <span className="rounded-full bg-accent px-3 py-1.5 text-[11px] font-bold text-ink-950">
                  Delivered
                </span>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="card absolute -bottom-8 -left-3 hidden w-56 p-4 sm:block"
            >
              <div className="flex items-center gap-3">
                <Avatar designer={DESIGNERS[0]} size={44} className="rounded-lg" />
                <div>
                  <p className="text-sm font-semibold text-white">Markanti</p>
                  <p className="text-[11px] text-accent">Available now</p>
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                {[92, 74, 86].map((w, i) => (
                  <div key={i} className="h-1.5 rounded-full bg-ink-700">
                    <div className="h-full rounded-full bg-accent/70" style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="card absolute -right-3 -top-6 hidden p-4 sm:block"
            >
              <p className="text-[11px] uppercase tracking-wider text-ink-400">Avg. delivery</p>
              <p className="font-display text-2xl font-bold text-white">7 days</p>
              <p className="mt-1 flex items-center gap-1 text-[11px] text-accent">
                <Zap size={11} /> on schedule
              </p>
            </motion.div>
          </motion.div>
        </div>

        {/* stats strip */}
        <div className="mt-16 grid grid-cols-2 gap-3 sm:mt-20 sm:grid-cols-4">
          {[
            ['100+', 'websites shipped'],
            ['4.9/5', 'average rating'],
            ['7 days', 'fastest launch'],
            ['100%', 'fixed-price quotes'],
          ].map(([value, label], i) => (
            <Reveal key={label} delay={i * 0.06} className="card px-4 py-5 text-center sm:px-5">
              <p className="font-display text-2xl font-bold text-white sm:text-3xl">{value}</p>
              <p className="mt-1 text-[11px] uppercase tracking-wider text-ink-400">{label}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* marquee */}
      <div className="relative overflow-hidden border-y border-ink-700/60 bg-ink-900/70 py-3.5">
        <div className="flex w-max animate-marquee gap-10">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="flex items-center gap-3 whitespace-nowrap text-sm font-medium uppercase tracking-wider text-ink-400"
            >
              <span className="h-1.5 w-1.5 bg-accent" />
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how" className="container-x py-16 sm:py-24">
      <SectionHeading
        eyebrow="How it works"
        title="Three steps from idea to live website"
        description="No lengthy calls, no confusing proposals. The whole booking takes about six minutes."
      />
      <div className="grid gap-5 md:grid-cols-3">
        {HOW_IT_WORKS.map((item, i) => (
          <Reveal key={item.step} delay={i * 0.08}>
            <div className="card relative h-full overflow-hidden p-6">
              <span className="absolute -right-3 -top-5 font-display text-[86px] font-bold text-ink-800/80">
                {item.step}
              </span>
              <div className="relative">
                <span className="inline-flex h-9 items-center rounded-full border border-accent/40 bg-accent/10 px-3 text-[11px] font-bold uppercase tracking-wider text-accent">
                  Step {item.step}
                </span>
                <h3 className="mt-4 font-display text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-300">{item.body}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-8">
        <Link to="/book" className="btn-primary">
          Start your booking <ArrowRight size={16} />
        </Link>
      </Reveal>
    </section>
  );
}

function Services() {
  return (
    <section id="services" className="border-y border-ink-800 bg-ink-900/50">
      <div className="container-x py-16 sm:py-24">
        <SectionHeading
          eyebrow="Services"
          title="Everything you need, designed and built"
          description="One team for the design, the code, the launch and the small stuff afterwards."
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((s, i) => (
            <ServiceCard key={s.id} service={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedWork() {
  const work = PROJECTS.slice(0, 3);
  return (
    <section className="container-x py-16 sm:py-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <SectionHeading
          eyebrow="Featured work"
          title="Sites we have shipped"
          description="Real projects across portals, stores and landing pages — click through to visit them."
          className="mb-0"
        />
        <Link
          to="/designers"
          className="mb-10 inline-flex items-center gap-1.5 text-sm font-semibold text-accent transition hover:gap-2.5"
        >
          See both designers <ArrowUpRight size={15} />
        </Link>
      </div>
      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {work.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} />
        ))}
      </div>
    </section>
  );
}

function DesignersSection() {
  return (
    <section id="designers" className="border-y border-ink-800 bg-ink-900/50">
      <div className="container-x py-16 sm:py-24">
        <SectionHeading
          eyebrow="The team"
          title="Two designers. Pick yours."
          description="Markanti designs and builds. Sundar specialises in pages that convert. Choose either — or tell us to assign the best fit."
        />
        <div className="grid gap-5 md:grid-cols-2">
          {DESIGNERS.map((d) => (
            <div key={d.slug}>
              <DesignerCard designer={d} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="container-x py-16 sm:py-24">
      <SectionHeading
        eyebrow="Client reviews"
        title="What clients say after launch"
        description="Ratings come from real completed projects on the platform."
        align="center"
      />
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {TESTIMONIALS.map((t, i) => (
          <Reveal key={t.id} delay={i * 0.06}>
            <TestimonialCard item={t} />
          </Reveal>
        ))}
      </div>
      <Reveal className="mt-8 flex justify-center">
        <div className="flex items-center gap-3 rounded-full border border-ink-700 bg-ink-850 px-5 py-3">
          <Rating value={4.9} />
          <span className="text-sm text-ink-300">
            from <strong className="text-white">83 verified reviews</strong>
          </span>
          <span className="flex -space-x-2">
            {DESIGNERS.map((d) => (
              <Avatar key={d.slug} designer={d} size={26} className="rounded-full ring-2 ring-ink-850" />
            ))}
          </span>
        </div>
      </Reveal>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState<string | null>(FAQS[0]?.id ?? null);
  return (
    <section id="faq" className="border-t border-ink-800 bg-ink-900/50">
      <div className="container-x py-16 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionHeading
              eyebrow="FAQ"
              title="Questions clients ask first"
              description="Still unsure about something? Message us on WhatsApp — we reply within one working day."
            />
            <a
              href={whatsappLink(AGENCY.whatsapp, 'Hi! I have a question about booking a website.')}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost"
            >
              <MessageCircle size={16} /> Ask on WhatsApp
            </a>
          </div>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <FaqItem
                key={f.id}
                item={f}
                open={open === f.id}
                onToggle={() => setOpen(open === f.id ? null : f.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="container-x pb-4 pt-16 sm:pt-24">
      <Reveal>
        <div className="relative overflow-hidden rounded-3xl border border-accent/30 bg-gradient-to-br from-accent/15 via-ink-850 to-ink-900 p-8 sm:p-12">
          <div className="absolute inset-0 pixel-grid opacity-50" aria-hidden="true" />
          <div className="relative max-w-2xl">
            <span className="eyebrow">
              <Star size={12} /> Free 30-minute call
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
              Ready to see your website in the first draft?
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-300">
              Fill the booking form now — it takes about six minutes. You will get a booking ID
              immediately and a WhatsApp reply within one working day.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/book" className="btn-primary">
                Book a Design <ArrowUpRight size={16} />
              </Link>
              <Link to="/pricing" className="btn-ghost">
                See pricing
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export default function Home() {
  useEffect(() => {
    document.title = 'Duo Pixel Agency — Two designers. One pixel-perfect website.';
  }, []);

  return (
    <div>
      <Hero />
      <HowItWorks />
      <Services />
      <FeaturedWork />
      <DesignersSection />
      <Testimonials />
      <Faq />
      <CtaBand />
    </div>
  );
}
