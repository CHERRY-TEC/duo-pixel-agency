import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';
import { Reveal, SectionHeading } from '@/components/ui';
import { SelectField, TextAreaField, TextField } from '@/components/fields';
import { createMessage } from '@/lib/db';
import { contactWhatsAppMessage, mailto, normalizePhone, whatsappLink } from '@/lib/format';
import { AGENCY } from '@/lib/seed';

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email address'),
  phone: z
    .string()
    .min(10, 'Enter at least 10 digits')
    .regex(/^[+\d\s()-]{10,18}$/, 'Enter a valid phone number'),
  subject: z.string().min(1, 'Pick a subject'),
  message: z.string().min(20, 'Tell us a little more (at least 20 characters)'),
});

type FormValues = z.infer<typeof schema>;

const SUBJECTS = [
  { value: '', label: 'Select a subject…' },
  { value: 'New website enquiry', label: 'New website enquiry' },
  { value: 'Existing booking question', label: 'Question about a booking' },
  { value: 'Pricing / quote', label: 'Pricing / quote' },
  { value: 'Partnership', label: 'Partnership / reseller' },
  { value: 'Something else', label: 'Something else' },
];

export default function Contact() {
  const [sent, setSent] = useState<{ name: string; email: string } | null>(null);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '' },
  });

  useEffect(() => {
    document.title = 'Contact — Duo Pixel Agency';
  }, []);

  const onSubmit = async (values: FormValues) => {
    setServerError('');
    try {
      await createMessage({
        name: values.name,
        email: values.email,
        phone: normalizePhone(values.phone),
        subject: values.subject,
        message: values.message,
      });
      setSent({ name: values.name, email: values.email });
      reset();
    } catch (error) {
      setServerError('Could not send your message. Please try WhatsApp instead.');
      console.warn(error);
    }
  };

  const waHref = whatsappLink(AGENCY.whatsapp, contactWhatsAppMessage());
  const emailHref = mailto(
    AGENCY.email,
    'Website enquiry',
    'Hi Duo Pixel Agency,\n\nI would like to discuss a website project.\n\n',
  );

  return (
    <div className="pb-4">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pixel-grid opacity-60" aria-hidden="true" />
        <div className="container-x relative py-14 sm:py-20">
          <SectionHeading
            eyebrow="Contact"
            title="Talk to us on WhatsApp, email or right here"
            description="Most projects start with one message. We reply within one working day, Monday to Saturday."
            align="center"
          />

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: <MessageCircle size={18} />,
                title: 'WhatsApp',
                body: `+${AGENCY.whatsapp}`,
                sub: 'Fastest reply',
                href: waHref,
                external: true,
              },
              {
                icon: <Mail size={18} />,
                title: 'Email',
                body: AGENCY.email,
                sub: 'For detailed briefs',
                href: `mailto:${AGENCY.email}`,
                external: false,
              },
              {
                icon: <MapPin size={18} />,
                title: 'Studio',
                body: AGENCY.city,
                sub: 'Remote worldwide',
                href: '#contact-form',
                external: false,
              },
            ].map((c) => {
              const inner = (
                <>
                  <span className="grid h-11 w-11 place-items-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                    {c.icon}
                  </span>
                  <div className="mt-4">
                    <p className="text-xs uppercase tracking-wider text-ink-400">{c.title}</p>
                    <p className="mt-1 truncate font-display text-base font-semibold text-white">
                      {c.body}
                    </p>
                    <p className="mt-1 text-xs text-ink-400">{c.sub}</p>
                  </div>
                </>
              );
              return c.external ? (
                <a
                  key={c.title}
                  href={c.href}
                  target="_blank"
                  rel="noreferrer"
                  className="card card-hover block p-5"
                >
                  {inner}
                </a>
              ) : (
                <a key={c.title} href={c.href} className="card card-hover block p-5">
                  {inner}
                </a>
              );
            })}
          </div>
        </div>
      </section>

      <section id="contact-form" className="container-x grid gap-8 py-12 sm:py-16 lg:grid-cols-[1.1fr_0.9fr]">
        <Reveal>
          <div className="card p-6 sm:p-8">
            <h2 className="font-display text-xl font-bold text-white">Send us a message</h2>
            <p className="mt-2 text-sm text-ink-300">
              Fill this in and your message lands in our inbox straight away.
            </p>

            {sent ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 rounded-2xl border border-accent/40 bg-accent/10 p-6"
              >
                <span className="grid h-11 w-11 place-items-center rounded-full bg-accent text-ink-950">
                  <Send size={18} />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-white">
                  Thanks {sent.name.split(' ')[0]} — message received!
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">
                  We reply within one working day. If it is urgent, WhatsApp us and we will get
                  back sooner.
                </p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <a href={waHref} target="_blank" rel="noreferrer" className="btn-primary">
                    <MessageCircle size={16} /> Continue on WhatsApp
                  </a>
                  <button type="button" onClick={() => setSent(null)} className="btn-ghost">
                    Send another message
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Your name"
                    placeholder="e.g. Priya Sharma"
                    autoComplete="name"
                    required
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <TextField
                    label="Phone / WhatsApp"
                    placeholder="98765 43210"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                    error={errors.email?.message}
                    {...register('email')}
                  />
                  <SelectField
                    label="Subject"
                    options={SUBJECTS}
                    required
                    error={errors.subject?.message}
                    {...register('subject')}
                  />
                </div>
                <TextAreaField
                  label="Message"
                  placeholder="Tell us what you need — a new website, a redesign, or a question about a booking."
                  required
                  error={errors.message?.message}
                  {...register('message')}
                />

                {serverError && (
                  <p role="alert" className="text-sm font-medium text-red-400">
                    {serverError}
                  </p>
                )}

                <button type="submit" disabled={isSubmitting} className="btn-primary w-full sm:w-auto">
                  {isSubmitting ? 'Sending…' : 'Send message'}
                  <Send size={16} />
                </button>

                <p className="flex items-center gap-2 text-xs text-ink-400">
                  <ShieldCheck size={13} className="text-accent" /> We never share your details.
                  One reply, no spam.
                </p>
              </form>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="space-y-4">
            <div className="card relative overflow-hidden p-6">
              <div className="absolute inset-0 pixel-grid opacity-40" aria-hidden="true" />
              <div className="relative">
                <h3 className="font-display text-lg font-semibold text-white">
                  Prefer a quick chat?
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-300">
                  Send your idea in one WhatsApp message — voice notes are fine. We will reply with
                  an honest estimate and timeline.
                </p>
                <a href={waHref} target="_blank" rel="noreferrer" className="btn-primary mt-5">
                  <MessageCircle size={16} /> Open WhatsApp
                </a>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-display text-lg font-semibold text-white">Office hours</h3>
              <ul className="mt-4 space-y-3 text-sm text-ink-300">
                <li className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-2">
                    <Clock size={14} className="text-accent" /> Monday – Saturday
                  </span>
                  <span className="text-ink-200">9:30am – 7:00pm IST</span>
                </li>
                <li className="flex items-center justify-between gap-3">
                  <span>Sunday</span>
                  <span className="text-ink-400">WhatsApp only</span>
                </li>
              </ul>
              <div className="mt-5 border-t border-ink-700 pt-4 text-sm text-ink-300">
                <p className="inline-flex items-center gap-2">
                  <MapPin size={14} className="text-accent" /> {AGENCY.city}
                </p>
                <a
                  href={emailHref}
                  className="mt-2 flex items-center gap-2 text-ink-300 transition hover:text-accent"
                >
                  <Mail size={14} className="text-accent" /> {AGENCY.email}
                </a>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="font-display text-lg font-semibold text-white">
                Ready to start instead?
              </h3>
              <p className="mt-2 text-sm text-ink-300">
                The booking form takes about six minutes and gives you a tracking ID instantly.
              </p>
              <Link to="/book" className="btn-primary mt-5">
                Book a Design <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
