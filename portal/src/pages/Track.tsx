import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  CalendarClock,
  MessageCircle,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import { StatusPill, Timeline } from '@/components/ui';
import { TextField } from '@/components/fields';
import { trackBooking } from '@/lib/db';
import { siteUrl } from '@/lib/links';
import { bookingWhatsAppMessage, formatDate, normalizeCode, whatsappLink } from '@/lib/format';
import { AGENCY } from '@/lib/seed';
import type { Booking } from '@/lib/types';

const schema = z.object({
  code: z.string().min(4, 'Enter your booking ID (for example DPA-7K2M9Q)'),
  phone: z.string().min(10, 'Enter the phone number you booked with'),
});

type FormValues = z.infer<typeof schema>;

export default function Track() {
  const [params] = useSearchParams();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { code: params.get('code') ?? '', phone: '' },
  });

  useEffect(() => {
    document.title = 'Track your booking — Duo Pixel Agency';
  }, []);

  // Keep the code field in sync when arriving with ?code= (e.g. from the
  // confirmation page) after the form has already mounted once.
  const codeParam = params.get('code');
  useEffect(() => {
    if (codeParam) setValue('code', codeParam, { shouldValidate: true });
  }, [codeParam, setValue]);

  const onSubmit = async (values: FormValues) => {
    setSearching(true);
    setError('');
    setBooking(null);
    try {
      const found = await trackBooking(normalizeCode(values.code), values.phone);
      if (!found) {
        setError(
          'No booking matched that ID and phone number. Check both and try again — or WhatsApp us.',
        );
      } else {
        setBooking(found);
      }
    } catch (e) {
      console.warn(e);
      setError('Something went wrong while searching. Please try again.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="container-x py-12 sm:py-16">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          <span className="eyebrow">Order tracking</span>
          <h1 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl">
            Track your booking
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-300">
            Enter the booking ID from your confirmation screen plus the phone number you booked
            with. No login needed.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="card mt-8 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-[1.1fr_1fr_auto] sm:items-end">
            <TextField
              label="Booking ID"
              placeholder="DPA-7K2M9Q"
              error={errors.code?.message}
              {...register('code')}
            />
            <TextField
              label="Phone / WhatsApp number"
              placeholder="98765 43210"
              inputMode="tel"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <button
              type="submit"
              disabled={searching}
              className="btn-primary h-[50px] w-full sm:w-auto"
            >
              {searching ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/30 border-t-ink-950" />
              ) : (
                <Search size={16} />
              )}
              Track
            </button>
          </div>

          {error && (
            <p role="alert" className="mt-4 rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <p className="mt-4 flex items-center gap-2 text-xs text-ink-400">
            <ShieldCheck size={13} className="text-accent" /> We only show your project to whoever
            knows both your booking ID and phone number.
          </p>
        </form>

        {booking && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-6 space-y-5"
          >
            <div className="card p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold tracking-widest text-accent">
                    {booking.booking_code}
                  </p>
                  <h2 className="mt-1 font-display text-xl font-bold text-white">
                    {booking.website_name}
                  </h2>
                  <p className="mt-1 text-sm text-ink-400">
                    {booking.website_type} · booked {formatDate(booking.created_at)}
                  </p>
                </div>
                <StatusPill status={booking.status} />
              </div>

              <div className="mt-5 grid gap-3 border-t border-ink-700 pt-5 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-ink-400">Designer</p>
                  <p className="mt-1 text-ink-100">
                    {booking.designer_slug === 'markanti'
                      ? 'Markanti Hanmanth'
                      : booking.designer_slug === 'sundar'
                        ? 'Sundar'
                        : 'Not assigned yet'}
                  </p>
                </div>
                <div>
                  <p className="text-ink-400">Budget</p>
                  <p className="mt-1 text-ink-100">{booking.budget}</p>
                </div>
                <div>
                  <p className="text-ink-400">Deadline</p>
                  <p className="mt-1 text-ink-100">{booking.deadline}</p>
                </div>
              </div>
            </div>

            <div className="card p-5 sm:p-6">
              <h3 className="flex items-center gap-2 font-display text-base font-semibold text-white">
                <CalendarClock size={16} className="text-accent" /> Status timeline
              </h3>
              <div className="mt-5">
                <Timeline history={booking.history} current={booking.status} />
              </div>
            </div>

            {booking.review && booking.rating && (
              <div className="card p-5">
                <p className="text-[11px] uppercase tracking-wider text-ink-400">
                  Your review
                </p>
                <p className="mt-2 text-sm text-ink-200">“{booking.review}”</p>
              </div>
            )}

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={whatsappLink(AGENCY.whatsapp, bookingWhatsAppMessage(booking))}
                target="_blank"
                rel="noreferrer"
                className="btn-primary flex-1"
              >
                <MessageCircle size={16} /> Ask about this booking
              </a>
              <a href={siteUrl('/book')} className="btn-ghost flex-1">
                Start a new booking <ArrowUpRight size={16} />
              </a>
            </div>
          </motion.div>
        )}

        {!booking && (
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ['Pending', 'Request received, waiting for acceptance'],
              ['In Design', 'Your design is being worked on'],
              ['Delivered', 'Ready for your review and handover'],
            ].map(([title, body]) => (
              <div key={title} className="card p-4">
                <p className="text-sm font-semibold text-white">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-400">{body}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
