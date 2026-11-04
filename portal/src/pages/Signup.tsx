import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowUpRight, Mail, UserPlus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import Logo from '@/components/Logo';
import { TextField } from '@/components/fields';
import { useAuth } from '@/lib/auth';
import { siteUrl } from '@/lib/links';

const schema = z
  .object({
    name: z.string().min(2, 'Enter your name'),
    email: z.string().email('Enter a valid email address'),
    password: z.string().min(8, 'Use at least 8 characters'),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, {
    message: 'Passwords do not match',
    path: ['confirm'],
  });

type FormValues = z.infer<typeof schema>;

export default function Signup() {
  const { user, loading, signUp, signInWithGoogle, mode } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [notice, setNotice] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', password: '', confirm: '' },
  });

  useEffect(() => {
    document.title = 'Create an account — Duo Pixel Agency';
  }, []);

  if (!loading && user) {
    return <Navigate to={user.role === 'designer' ? '/dashboard' : '/account/my-bookings'} replace />;
  }

  const onSubmit = async (values: FormValues) => {
    setServerError('');
    setNotice('');
    try {
      await signUp(values.email, values.password, values.name);
      if (mode === 'supabase') {
        setNotice(
          'Check your inbox — we sent you a confirmation link. Click it, then log in.',
        );
      } else {
        navigate('/account/my-bookings', { replace: true });
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Could not create the account.');
    }
  };

  const onGoogle = async () => {
    setServerError('');
    try {
      await signInWithGoogle();
      if (mode === 'local') navigate('/account/my-bookings', { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Google sign-in failed.');
    }
  };

  return (
    <div className="container-x py-12 sm:py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="mx-auto max-w-md"
      >
        <div className="card p-6 sm:p-8">
          <a href={siteUrl('/')} className="inline-block">
            <Logo size={28} />
          </a>

          <h1 className="mt-6 font-display text-2xl font-bold text-white">Create your account</h1>
          <p className="mt-2 text-sm text-ink-300">
            Optional — but it lets you see every booking and its timeline in one place.
          </p>

          {notice && (
            <p className="mt-5 rounded-xl border border-accent/40 bg-accent/10 p-3.5 text-sm text-ink-200">
              {notice}
            </p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
            <TextField
              label="Full name"
              autoComplete="name"
              placeholder="e.g. Priya Sharma"
              error={errors.name?.message}
              {...register('name')}
            />
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Password"
                type="password"
                autoComplete="new-password"
                placeholder="8+ characters"
                error={errors.password?.message}
                {...register('password')}
              />
              <TextField
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                placeholder="Repeat it"
                error={errors.confirm?.message}
                {...register('confirm')}
              />
            </div>

            {serverError && (
              <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-300">
                {serverError}
              </p>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Creating account…' : 'Sign up'}
              <UserPlus size={16} />
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-ink-500">
            <span className="h-px flex-1 bg-ink-700" /> or <span className="h-px flex-1 bg-ink-700" />
          </div>

          <button type="button" onClick={onGoogle} className="btn-ghost w-full">
            <Mail size={16} /> Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-ink-300">
            Already registered?{' '}
            <Link to="/login" className="font-semibold text-accent hover:underline">
              Log in <ArrowUpRight size={13} className="inline" />
            </Link>
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-ink-400">
          Prefer not to sign up?{' '}
          <a href={siteUrl('/book')} className="text-accent hover:underline">
            Book a design as a guest
          </a>
          {' — '}your booking ID still tracks everything.
        </p>
      </motion.div>
    </div>
  );
}
