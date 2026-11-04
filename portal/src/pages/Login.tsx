import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { ArrowUpRight, KeyRound, LogIn, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import Logo from '@/components/Logo';
import { TextField } from '@/components/fields';
import { useAuth } from '@/lib/auth';
import { siteUrl } from '@/lib/links';

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { user, loading, signIn, signInWithGoogle, mode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const from = location.state?.from;

  const [serverError, setServerError] = useState('');
  const [googleError, setGoogleError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  useEffect(() => {
    document.title = 'Log in — Duo Pixel Agency';
  }, []);

  if (!loading && user) {
    return <Navigate to={user.role === 'designer' ? '/dashboard' : '/account/my-bookings'} replace />;
  }

  const onSubmit = async (values: FormValues) => {
    setServerError('');
    try {
      await signIn(values.email, values.password);
      const target =
        from ??
        (values.email.startsWith('markanti') || values.email.startsWith('sundar')
          ? '/dashboard'
          : '/account/my-bookings');
      navigate(target, { replace: true });
    } catch (error) {
      setServerError(error instanceof Error ? error.message : 'Could not sign in.');
    }
  };

  const onGoogle = async () => {
    setGoogleError('');
    try {
      await signInWithGoogle();
      if (mode === 'local') navigate('/account/my-bookings', { replace: true });
      // In Supabase mode the provider redirects away and back.
    } catch (error) {
      setGoogleError(error instanceof Error ? error.message : 'Google sign-in failed.');
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

          <h1 className="mt-6 font-display text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-ink-300">
            Log in to see your bookings, timelines and reviews.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 space-y-4">
            <TextField
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            {serverError && (
              <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-300">
                {serverError}
              </p>
            )}

            <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
              {isSubmitting ? 'Signing in…' : 'Log in'}
              <LogIn size={16} />
            </button>
          </form>

          <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-wider text-ink-500">
            <span className="h-px flex-1 bg-ink-700" /> or <span className="h-px flex-1 bg-ink-700" />
          </div>

          <button type="button" onClick={onGoogle} className="btn-ghost w-full">
            <Mail size={16} /> Continue with Google
          </button>
          {googleError && (
            <p role="alert" className="mt-3 text-sm text-red-400">
              {googleError}
            </p>
          )}

          {mode === 'local' && (
            <div className="mt-5 rounded-xl border border-accent/30 bg-accent/5 p-4">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-accent">
                <KeyRound size={13} /> Demo accounts (no Supabase configured)
              </p>
              <ul className="mt-2.5 space-y-1.5 font-mono text-xs text-ink-300">
                <li>
                  markanti@duopixel.agency · designer123{' '}
                  <span className="text-ink-500">(designer dashboard)</span>
                </li>
                <li>
                  sundar@duopixel.agency · designer123{' '}
                  <span className="text-ink-500">(designer dashboard)</span>
                </li>
                <li className="text-ink-400">or sign up as a client below</li>
              </ul>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-ink-300">
            No account yet?{' '}
            <Link to="/signup" className="font-semibold text-accent hover:underline">
              Sign up free <ArrowUpRight size={13} className="inline" />
            </Link>
          </p>
        </div>

        <p className="mt-5 text-center text-xs text-ink-400">
          Just want to check a booking?{' '}
          <Link to="/track" className="text-accent hover:underline">
            Track it without logging in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
