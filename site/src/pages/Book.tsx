import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  FileUp,
  Sparkles,
  Upload,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import Avatar from '@/components/Avatar';
import { ChoiceCard, CheckPill, StepProgress, TextAreaField, TextField, SelectField } from '@/components/fields';
import { BackLink } from '@/components/ui';
import { createBooking, sendConfirmationEmail, uploadAttachment, type EmailResult } from '@/lib/db';
import { inr, mailto, normalizePhone } from '@/lib/format';
import { portalUrl } from '@/lib/links';
import {
  AGENCY,
  BUDGET_OPTIONS,
  CONTACT_METHODS,
  DEADLINE_OPTIONS,
  DESIGNER_OPTIONS,
  FEATURE_OPTIONS,
  LANGUAGE_OPTIONS,
  PACKAGES,
  WEBSITE_TYPES,
} from '@/lib/seed';
import { useDesigners, usePackages } from '@/lib/useDesigners';
import type { Booking, BookingFile, DesignerSlug } from '@/lib/types';

const TOTAL_STEPS = 6;

const bookingSchema = z.object({
  designer_slug: z.string().min(1, 'Choose a designer — or pick “No preference”'),
  website_type: z.string().min(1, 'Choose the type of website'),
  website_name: z.string().min(2, 'Give your project a working name'),
  description: z
    .string()
    .min(30, 'Describe what you want in at least 30 characters — this is the brief we design from'),
  pages_needed: z.string().min(2, 'Tell us roughly which pages you need'),
  features: z.array(z.string()).min(1, 'Pick at least one feature you need'),
  style_preferences: z.string(),
  reference_links: z
    .string()
    .refine(
      (v) => v.trim() === '' || v.trim().split(/\s+/).every((u) => /^https?:\/\/\S+$/i.test(u)),
      'Add full links (https://…) separated by spaces, or leave this blank',
    ),
  budget: z.string().min(1, 'Choose a budget range'),
  deadline: z.string().min(1, 'Pick a timeline'),
  language: z.string().min(1, 'Choose a language'),
  package_id: z.string(),
  client_name: z.string().min(2, 'Enter your name'),
  client_phone: z
    .string()
    .min(10, 'Enter at least 10 digits')
    .regex(/^[+\d\s()-]{10,18}$/, 'Enter a valid phone number'),
  client_email: z.string().email('Enter a valid email address'),
  contact_method: z.string().min(1, 'Tell us how to reach you'),
});

type FormValues = z.infer<typeof bookingSchema>;

const STEP_FIELDS: Record<number, Array<keyof FormValues>> = {
  1: ['designer_slug'],
  2: ['website_type'],
  3: ['website_name', 'description', 'pages_needed', 'features', 'reference_links'],
  4: ['budget', 'deadline', 'language'],
  5: ['client_name', 'client_phone', 'client_email', 'contact_method'],
  6: [],
};

const STEP_META: Record<number, { title: string; description: string }> = {
  1: {
    title: 'Who should design it?',
    description:
      'Pick a designer by specialty, or let us assign whoever is the best fit and free first.',
  },
  2: {
    title: 'What are we building?',
    description: 'This decides the structure, timeline and which designer we match you with.',
  },
  3: {
    title: 'Tell us about the website',
    description: 'The more detail you give, the closer the first design lands. Rough notes are fine.',
  },
  4: {
    title: 'Budget, timeline and language',
    description: 'This helps us confirm feasibility before we reply — no surprises later.',
  },
  5: {
    title: 'How do we reach you?',
    description: 'We reply within one working day on your preferred channel.',
  },
  6: {
    title: 'Review and submit',
    description: 'Check everything below. You can jump back to fix any section before sending.',
  },
};

const DEFAULTS: FormValues = {
  designer_slug: '',
  website_type: '',
  website_name: '',
  description: '',
  pages_needed: '',
  features: [],
  style_preferences: '',
  reference_links: '',
  budget: '',
  deadline: '',
  language: LANGUAGE_OPTIONS[0],
  package_id: '',
  client_name: '',
  client_phone: '',
  client_email: '',
  contact_method: CONTACT_METHODS[0],
};

function stepOf(step: number): Array<keyof FormValues> {
  return STEP_FIELDS[step];
}

export default function Book() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const designers = useDesigners();
  const packages = usePackages();

  const [step, setStep] = useState(1);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [direction, setDirection] = useState(1);
  const [consent, setConsent] = useState(false);

  const designerParam = params.get('designer');
  const packageParam = params.get('package');

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: DEFAULTS,
    mode: 'onBlur',
  });

  useEffect(() => {
    document.title = 'Book a Design — Duo Pixel Agency';
  }, []);

  useEffect(() => {
    if (designerParam === 'markanti' || designerParam === 'sundar') {
      setValue('designer_slug', designerParam, { shouldValidate: step >= 1 });
    } else if (designerParam === 'any') {
      setValue('designer_slug', 'any', { shouldValidate: true });
    }
  }, [designerParam, setValue, step]);

  useEffect(() => {
    if (packageParam) {
      const pkg = (packages ?? PACKAGES).find((p) => p.id === packageParam);
      if (pkg) {
        setValue('package_id', pkg.id, { shouldValidate: true });
        setValue('website_type', pkg.website_types[0] ?? 'Other', { shouldValidate: true });
      }
    }
  }, [packageParam, packages, setValue]);

  const designerChoice = watch('designer_slug');
  const websiteType = watch('website_type');
  const features = watch('features') ?? [];
  const budget = watch('budget');
  const deadline = watch('deadline');
  const language = watch('language');
  const contactMethod = watch('contact_method');
  const packageId = watch('package_id');

  const chosenDesigner = useMemo(
    () => (designers ?? []).find((d) => d.slug === designerChoice),
    [designers, designerChoice],
  );
  const chosenPackage = useMemo(
    () => (packages ?? PACKAGES).find((p) => p.id === packageId),
    [packages, packageId],
  );

  const goNext = async () => {
    const fields = stepOf(step);
    const ok = fields.length ? await trigger(fields, { shouldFocus: true }) : true;
    if (!ok) return;
    setDirection(1);
    setStep((s) => Math.min(TOTAL_STEPS, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const jumpTo = (target: number) => {
    setDirection(target > step ? 1 : -1);
    setStep(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleFeature = (feature: string, checked: boolean) => {
    const current = getValues('features') ?? [];
    const next = checked ? [...current, feature] : current.filter((f) => f !== feature);
    setValue('features', next, { shouldValidate: step >= 3, shouldDirty: true });
  };

  const onFilesPicked = (list: FileList | null) => {
    if (!list) return;
    const picked = Array.from(list);
    const tooBig = picked.filter((f) => f.size > 8 * 1024 * 1024);
    if (tooBig.length) {
      setUploadError(`“${tooBig[0].name}” is over 8 MB. Please upload a smaller file.`);
      return;
    }
    setUploadError('');
    setPendingFiles((prev) => [...prev, ...picked].slice(0, 5));
  };

  const removeFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    setUploadError('');
    try {
      const uploaded: BookingFile[] = [];
      for (const file of pendingFiles) {
        uploaded.push(await uploadAttachment(file));
      }

      const designerSlug: DesignerSlug | null =
        values.designer_slug === 'markanti' || values.designer_slug === 'sundar'
          ? values.designer_slug
          : null;

      const booking = await createBooking({
        designer_slug: designerSlug,
        website_type: values.website_type,
        website_name: values.website_name,
        description: values.description,
        pages_needed: values.pages_needed,
        features: values.features,
        style_preferences: values.style_preferences || 'Open to suggestions',
        reference_links: values.reference_links,
        files: uploaded,
        budget: values.budget,
        deadline: values.deadline,
        language: values.language,
        package_id: values.package_id || null,
        client_name: values.client_name,
        client_phone: normalizePhone(values.client_phone),
        client_email: values.client_email,
        contact_method: values.contact_method,
      });

      const emailStatus = await sendConfirmationEmail(booking);
      navigate(`/confirmation/${booking.booking_code}`, {
        replace: true,
        state: { booking, emailStatus } as { booking: Booking; emailStatus: EmailResult },
      });
    } catch (error) {
      console.warn(error);
      setUploadError('Something went wrong while submitting. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const reviewRows: Array<{ label: string; value: string; edit: number }> = [
    { label: 'Designer', value: chosenDesigner ? chosenDesigner.name : 'No preference — assign anyone', edit: 1 },
    { label: 'Website type', value: websiteType, edit: 2 },
    { label: 'Project name', value: getValues('website_name'), edit: 3 },
    { label: 'Description', value: getValues('description'), edit: 3 },
    { label: 'Pages needed', value: getValues('pages_needed'), edit: 3 },
    { label: 'Features', value: features.join(', '), edit: 3 },
    { label: 'Style preferences', value: getValues('style_preferences') || 'Not specified', edit: 3 },
    { label: 'Reference links', value: getValues('reference_links') || 'None', edit: 3 },
    { label: 'Package', value: chosenPackage ? chosenPackage.name : 'Not selected', edit: 4 },
    { label: 'Budget', value: budget, edit: 4 },
    { label: 'Deadline', value: deadline, edit: 4 },
    { label: 'Communication language', value: language, edit: 4 },
    { label: 'Name', value: getValues('client_name'), edit: 5 },
    { label: 'Phone / WhatsApp', value: getValues('client_phone'), edit: 5 },
    { label: 'Email', value: getValues('client_email'), edit: 5 },
    { label: 'Preferred contact', value: contactMethod, edit: 5 },
  ];

  const err = (name: keyof FormValues) => errors[name]?.message as string | undefined;

  return (
    <div className="container-x py-10 sm:py-14">
      <BackLink to="/">Home</BackLink>

      <div className="mx-auto mt-4 max-w-3xl">
        <StepProgress step={step} total={TOTAL_STEPS} {...STEP_META[step]} />

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={{ opacity: 0, x: direction * 28 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -28 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* ------------------------------------------------ STEP 1 */}
              {step === 1 && (
                <div className="space-y-3">
                  {DESIGNER_OPTIONS.map((opt) => {
                    const d = (designers ?? []).find((x) => x.slug === opt.slug);
                    return (
                      <ChoiceCard
                        key={opt.label}
                        title={opt.label}
                        description={
                          opt.slug === null
                            ? 'We match you based on website type and availability — usually the faster option.'
                            : d
                              ? `${d.title} · ~${d.avg_delivery_days} days · ${d.availability}`
                              : undefined
                        }
                        icon={
                          d ? (
                            <Avatar designer={d} size={26} className="rounded-md" />
                          ) : (
                            <Sparkles size={15} />
                          )
                        }
                        badge={d ? d.availability : 'Recommended'}
                        selected={designerChoice === (opt.slug ?? 'any')}
                        onSelect={() =>
                          setValue('designer_slug', opt.slug ?? 'any', {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                      />
                    );
                  })}
                  {err('designer_slug') && (
                    <p role="alert" className="text-sm text-red-400">
                      {err('designer_slug')}
                    </p>
                  )}
                </div>
              )}

              {/* ------------------------------------------------ STEP 2 */}
              {step === 2 && (
                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {WEBSITE_TYPES.map((type, i) => (
                      <ChoiceCard
                        key={type}
                        title={type}
                        description={
                          type === 'Landing page'
                            ? 'One page, one goal — sales, leads or a launch.'
                            : type === 'Business'
                              ? 'Multi-page site for a shop, clinic or service.'
                              : type === 'Portfolio'
                                ? 'Show your work and get contacted.'
                                : type === 'E-commerce'
                                  ? 'Products, cart, checkout and payments.'
                                  : type === 'Web app'
                                    ? 'Logins, dashboards and user roles.'
                                    : type === 'College / Event Portal'
                                      ? 'Registrations, notices, results and more.'
                                      : 'Something unusual — describe it in step 3.'
                        }
                        icon={<span className="text-xs font-bold">{String(i + 1).padStart(2, '0')}</span>}
                        selected={websiteType === type}
                        onSelect={() =>
                          setValue('website_type', type, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                      />
                    ))}
                  </div>
                  {err('website_type') && (
                    <p role="alert" className="text-sm text-red-400">
                      {err('website_type')}
                    </p>
                  )}
                </div>
              )}

              {/* ------------------------------------------------ STEP 3 */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                      label="Website / project name"
                      placeholder="e.g. Nivaas Realty, CampusPort"
                      required
                      error={err('website_name')}
                      {...register('website_name')}
                    />
                    <TextField
                      label="Pages you think you need"
                      placeholder="Home, About, Services, Contact…"
                      hint="Not sure? Write “not sure — recommend for me”."
                      required
                      error={err('pages_needed')}
                      {...register('pages_needed')}
                    />
                  </div>

                  <TextAreaField
                    label="What do you want the website to do?"
                    placeholder="Describe your business, who visits the site, and what they should be able to do. Mention anything you have already tried."
                    required
                    error={err('description')}
                    {...register('description')}
                  />

                  <div>
                    <span className="label">
                      Features needed <span className="text-accent">*</span>
                    </span>
                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {FEATURE_OPTIONS.map((f) => (
                        <CheckPill
                          key={f}
                          label={f}
                          checked={features.includes(f)}
                          onChange={(checked) => toggleFeature(f, checked)}
                        />
                      ))}
                    </div>
                    {err('features') && (
                      <p role="alert" className="mt-2 text-sm text-red-400">
                        {err('features')}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextAreaField
                      label="Colour / style preferences"
                      placeholder="e.g. dark theme with green accent, or “match my Instagram”"
                      hint="Optional — we will propose a direction if you skip this."
                      style={{ minHeight: 110 }}
                      {...register('style_preferences')}
                    />
                    <TextAreaField
                      label="Reference website links"
                      placeholder="https://example.com https://another-site.com"
                      hint="Sites you like — separate links with a space."
                      style={{ minHeight: 110 }}
                      error={err('reference_links')}
                      {...register('reference_links')}
                    />
                  </div>

                  <div className="rounded-2xl border border-ink-700 bg-ink-900/70 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-medium text-ink-200">
                        <FileUp size={16} className="text-accent" />
                        Upload logo, sketches or screenshots
                        <span className="text-ink-400">(optional · max 5 files · 8 MB each)</span>
                      </div>
                      <label className="btn-ghost cursor-pointer !px-4 !py-2">
                        <Upload size={15} /> Choose files
                        <input
                          type="file"
                          multiple
                          className="sr-only"
                          accept="image/*,.pdf,.doc,.docx,.txt,.svg"
                          onChange={(e) => onFilesPicked(e.target.files)}
                        />
                      </label>
                    </div>

                    {uploadError && (
                      <p role="alert" className="mt-3 text-sm text-red-400">
                        {uploadError}
                      </p>
                    )}

                    {pendingFiles.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {pendingFiles.map((f, i) => (
                          <li
                            key={`${f.name}-${i}`}
                            className="flex items-center justify-between gap-3 rounded-xl border border-ink-700 bg-ink-850 px-3 py-2.5"
                          >
                            <div className="min-w-0">
                              <p className="truncate text-sm text-ink-100">{f.name}</p>
                              <p className="text-xs text-ink-400">
                                {(f.size / 1024).toFixed(0)} KB · ready to upload
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeFile(i)}
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-ink-600 text-ink-400 transition hover:border-red-400 hover:text-red-400"
                              aria-label={`Remove ${f.name}`}
                            >
                              <X size={14} />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------ STEP 4 */}
              {step === 4 && (
                <div className="space-y-6">
                  <div>
                    <span className="label">
                      Budget range <span className="text-accent">*</span>
                    </span>
                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {BUDGET_OPTIONS.map((b) => (
                        <CheckPill
                          key={b}
                          label={b}
                          checked={budget === b}
                          onChange={() =>
                            setValue('budget', b, { shouldValidate: true, shouldDirty: true })
                          }
                        />
                      ))}
                    </div>
                    {err('budget') && (
                      <p role="alert" className="mt-2 text-sm text-red-400">
                        {err('budget')}
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="label">
                      Deadline <span className="text-accent">*</span>
                    </span>
                    <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                      {DEADLINE_OPTIONS.map((d) => (
                        <CheckPill
                          key={d}
                          label={d}
                          checked={deadline === d}
                          onChange={() =>
                            setValue('deadline', d, { shouldValidate: true, shouldDirty: true })
                          }
                        />
                      ))}
                    </div>
                    {err('deadline') && (
                      <p role="alert" className="mt-2 text-sm text-red-400">
                        {err('deadline')}
                      </p>
                    )}
                  </div>

                  <SelectField
                    label="Preferred language for communication"
                    options={LANGUAGE_OPTIONS.map((l) => ({ value: l, label: l }))}
                    error={err('language')}
                    {...register('language')}
                  />

                  <SelectField
                    label="Package (optional)"
                    hint="You can change this after we talk — nothing is charged now."
                    options={[
                      { value: '', label: 'Not sure yet — recommend one' },
                      ...(packages ?? PACKAGES).map((p) => ({
                        value: p.id,
                        label: `${p.name} — ${p.price ? inr(p.price) : 'custom quote'}`,
                      })),
                    ]}
                    {...register('package_id')}
                  />
                </div>
              )}

              {/* ------------------------------------------------ STEP 5 */}
              {step === 5 && (
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <TextField
                      label="Your name"
                      placeholder="e.g. Priya Sharma"
                      autoComplete="name"
                      required
                      error={err('client_name')}
                      {...register('client_name')}
                    />
                    <TextField
                      label="Phone / WhatsApp number"
                      placeholder="98765 43210"
                      inputMode="tel"
                      autoComplete="tel"
                      required
                      error={err('client_phone')}
                      {...register('client_phone')}
                    />
                  </div>
                  <TextField
                    label="Email"
                    type="email"
                    placeholder="you@company.com"
                    autoComplete="email"
                    required
                    error={err('client_email')}
                    {...register('client_email')}
                  />

                  <div>
                    <span className="label">
                      Preferred contact method <span className="text-accent">*</span>
                    </span>
                    <div className="grid gap-2.5 sm:grid-cols-3">
                      {CONTACT_METHODS.map((m) => (
                        <ChoiceCard
                          key={m}
                          title={m}
                          description={
                            m === 'WhatsApp'
                              ? 'Quickest — usually within a few hours'
                              : m === 'Phone call'
                                ? 'We call at a time that suits you'
                                : 'Written brief and quote by email'
                          }
                          selected={contactMethod === m}
                          onSelect={() =>
                            setValue('contact_method', m, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                        />
                      ))}
                    </div>
                    {err('contact_method') && (
                      <p role="alert" className="text-sm text-red-400">
                        {err('contact_method')}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* ------------------------------------------------ STEP 6 */}
              {step === 6 && (
                <div className="space-y-4">
                  <div className="card divide-y divide-ink-700 overflow-hidden">
                    {reviewRows.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-start justify-between gap-4 px-5 py-3.5"
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] uppercase tracking-wider text-ink-400">
                            {row.label}
                          </p>
                          <p className="mt-1 whitespace-pre-line break-words text-sm text-ink-100">
                            {row.value || '—'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => jumpTo(row.edit)}
                          className="shrink-0 rounded-full border border-ink-600 px-3 py-1 text-[11px] font-semibold text-ink-300 transition hover:border-accent/50 hover:text-accent"
                        >
                          Edit
                        </button>
                      </div>
                    ))}

                    {pendingFiles.length > 0 && (
                      <div className="px-5 py-3.5">
                        <p className="text-[11px] uppercase tracking-wider text-ink-400">
                          Attached files
                        </p>
                        <ul className="mt-2 space-y-1">
                          {pendingFiles.map((f) => (
                            <li key={f.name} className="text-sm text-ink-100">
                              📎 {f.name}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-ink-700 bg-ink-900/70 p-4 text-sm text-ink-300">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-[#B9FF39]"
                    />
                    <span>
                      I understand this is a request, not a payment. Duo Pixel Agency will confirm
                      scope and price on WhatsApp before any work starts.
                    </span>
                  </label>
                  {!consent && (
                    <p role="alert" className="text-xs font-medium text-amber-soft">
                      Tick the box above to enable Submit booking.
                    </p>
                  )}

                  {uploadError && (
                    <p role="alert" className="text-sm text-red-400">
                      {uploadError}
                    </p>
                  )}

                  <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 text-sm text-ink-300">
                    After submitting you will get a booking ID like{' '}
                    <span className="font-mono font-semibold text-accent">DPA-7K2M9Q</span>, a
                    confirmation email, and a WhatsApp button with your details pre-filled.
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* nav */}
          <div className="mt-8 flex items-center justify-between gap-3 border-t border-ink-800 pt-6">
            {step > 1 ? (
              <button type="button" onClick={goBack} className="btn-ghost">
                <ArrowLeft size={16} /> Back
              </button>
            ) : (
              <Link to="/" className="btn-ghost">
                Cancel
              </Link>
            )}

            {step < TOTAL_STEPS ? (
              <button
                key="nav-next"
                type="button"
                onClick={(e) => {
                  /*
                   * Cancel the click's default action. goNext() advances to step 6
                   * within the same click, and React reuses this button node for the
                   * step-6 submit button — without preventDefault() the browser would
                   * then submit the form straight away and skip the review step.
                   */
                  e.preventDefault();
                  void goNext();
                }}
                className="btn-primary"
              >
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button
                key="nav-submit"
                type="submit"
                disabled={submitting || !consent}
                className="btn-primary min-w-[190px]"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/30 border-t-ink-950" />
                    Submitting…
                  </>
                ) : (
                  <>
                    Submit booking <Check size={16} />
                  </>
                )}
              </button>
            )}
          </div>

          {/* step dots (clickable) */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => i + 1 < step && jumpTo(i + 1)}
                disabled={i + 1 > step}
                className={`h-2 rounded-full transition-all ${
                  i + 1 === step ? 'w-7 bg-accent' : i + 1 < step ? 'w-4 bg-accent/50' : 'w-4 bg-ink-700'
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>
        </form>

        <p className="mt-8 text-center text-xs text-ink-400">
          Need help filling this?{' '}
          <a
            href={mailto(
              AGENCY.email,
              'Help with booking form',
              'Hi! I am stuck on the booking form. My project is about:',
            )}
            className="text-accent underline-offset-2 hover:underline"
          >
            Email us
          </a>{' '}
          or{' '}
          <a href={portalUrl('/track')} className="text-accent underline-offset-2 hover:underline">
            track an existing booking
          </a>
          .
        </p>
      </div>
    </div>
  );
}
