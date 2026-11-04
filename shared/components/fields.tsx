import { motion } from 'framer-motion';
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import { cx } from '../lib/format';

interface FieldShellProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  htmlFor: string;
  children: ReactNode;
}

function FieldShell({ label, error, hint, required, htmlFor, children }: FieldShellProps) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">
        {label}
        {required && <span className="ml-1 text-accent">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-ink-400">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  hint?: string;
};

/**
 * NOTE: the field components forward refs so React Hook Form's register()
 * ref reaches the DOM element — without it RHF cannot read typed values.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, id, required, ...rest },
  ref,
) {
  const fieldId = id ?? `f-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} htmlFor={fieldId}>
      <input
        id={fieldId}
        ref={ref}
        aria-invalid={Boolean(error)}
        className={cx('input', error && 'input-error')}
        {...rest}
      />
    </FieldShell>
  );
});

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  hint?: string;
};

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  function TextAreaField({ label, error, hint, id, required, ...rest }, ref) {
    const fieldId = id ?? `f-${label.replace(/\W+/g, '-').toLowerCase()}`;
    return (
      <FieldShell label={label} error={error} hint={hint} required={required} htmlFor={fieldId}>
        <textarea
          id={fieldId}
          ref={ref}
          aria-invalid={Boolean(error)}
          className={cx('input min-h-[120px] resize-y', error && 'input-error')}
          {...rest}
        />
      </FieldShell>
    );
  },
);

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
};

export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { label, error, hint, id, options, required, ...rest },
  ref,
) {
  const fieldId = id ?? `f-${label.replace(/\W+/g, '-').toLowerCase()}`;
  return (
    <FieldShell label={label} error={error} hint={hint} required={required} htmlFor={fieldId}>
      <select
        id={fieldId}
        ref={ref}
        aria-invalid={Boolean(error)}
        className={cx('input appearance-none', error && 'input-error')}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-ink-900">
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
});

/** Pill-style checkbox used for features / pages / options grids. */
export function CheckPill({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <label
      className={cx(
        'flex cursor-pointer select-none items-center gap-2.5 rounded-xl border px-3.5 py-3 text-sm transition',
        checked
          ? 'border-accent/60 bg-accent/10 text-white'
          : 'border-ink-600 bg-ink-900/70 text-ink-300 hover:border-ink-500 hover:text-ink-100',
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only"
      />
      <span
        className={cx(
          'grid h-4 w-4 shrink-0 place-items-center rounded border transition',
          checked ? 'border-accent bg-accent text-ink-950' : 'border-ink-500',
        )}
        aria-hidden="true"
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M1.5 5.2 4 7.6 8.5 2.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {label}
    </label>
  );
}

/** Choice card used in steps 1, 2, 4 and 5. */
export function ChoiceCard({
  title,
  description,
  selected,
  onSelect,
  icon,
  badge,
}: {
  title: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
  icon?: ReactNode;
  badge?: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cx(
        'relative w-full rounded-2xl border p-4 text-left transition',
        selected
          ? 'border-accent bg-accent/10 shadow-glow'
          : 'border-ink-600 bg-ink-900/70 hover:border-ink-500',
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <span
            className={cx(
              'grid h-9 w-9 shrink-0 place-items-center rounded-lg border text-sm',
              selected ? 'border-accent/50 bg-accent/15 text-accent' : 'border-ink-600 bg-ink-800 text-ink-300',
            )}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className={cx('text-sm font-semibold', selected ? 'text-white' : 'text-ink-100')}>
              {title}
            </p>
            {badge && (
              <span className="rounded-full bg-ink-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink-400">
                {badge}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs leading-relaxed text-ink-400">{description}</p>
          )}
        </div>
        <span
          className={cx(
            'mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2',
            selected ? 'border-accent bg-accent' : 'border-ink-500',
          )}
          aria-hidden="true"
        >
          {selected && (
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M1.5 5.2 4 7.6 8.5 2.6" stroke="#0A0A0C" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
      </div>
    </button>
  );
}

/* ------------------------------------------------------------- Step bar */

export function StepProgress({
  step,
  total,
  title,
  description,
}: {
  step: number;
  total: number;
  title: string;
  description: string;
}) {
  const pct = Math.round((step / total) * 100);
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Step {step} of {total}
          </p>
          <h1 className="mt-2 font-display text-2xl font-bold text-white sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-300">{description}</p>
        </div>
        <div className="hidden shrink-0 text-right sm:block">
          <p className="font-display text-3xl font-bold text-white">{pct}%</p>
          <p className="text-[11px] uppercase tracking-wider text-ink-400">complete</p>
        </div>
      </div>

      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-ink-800">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent-dim to-accent"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 140, damping: 24 }}
        />
      </div>

      <div className="mt-3 flex gap-1.5">
        {Array.from({ length: total }).map((_, i) => (
          <span
            key={i}
            className={cx(
              'h-1.5 flex-1 rounded-full transition',
              i < step ? 'bg-accent/70' : 'bg-ink-800',
            )}
          />
        ))}
      </div>
    </div>
  );
}
