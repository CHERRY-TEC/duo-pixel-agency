/**
 * Auth — Supabase Auth when configured, a local demo auth otherwise.
 * Both modes expose the same API so every button works either way.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getSupabase, supabaseEnabled } from './supabase';
import type { DesignerSlug, SessionUser } from './types';

const USERS_KEY = 'dpa.users.v1';
const SESSION_KEY = 'dpa.session.v1';

interface StoredUser {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'client' | 'designer' | 'admin';
  designer_slug: DesignerSlug | null;
}

/** Emails that get the agency admin role (sees every order). */
const ADMIN_EMAILS = ['admin@duopixel.agency'];

const DEMO_DESIGNERS: StoredUser[] = [
  {
    id: 'seed-admin',
    email: 'admin@duopixel.agency',
    name: 'Agency Admin',
    password: 'designer123',
    role: 'admin',
    designer_slug: null,
  },
  {
    id: 'seed-markanti',
    email: 'markanti@duopixel.agency',
    name: 'Markanti Hanmanth',
    password: 'designer123',
    role: 'designer',
    designer_slug: 'markanti',
  },
  {
    id: 'seed-sundar',
    email: 'sundar@duopixel.agency',
    name: 'Sundar',
    password: 'designer123',
    role: 'designer',
    designer_slug: 'sundar',
  },
];

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_DESIGNERS));
      return DEMO_DESIGNERS;
    }
    const parsed = JSON.parse(raw) as StoredUser[];
    // Always keep the seeded admin + designer logins available.
    const merged = [...parsed];
    DEMO_DESIGNERS.forEach((d) => {
      if (!merged.some((u) => u.email === d.email)) merged.push(d);
    });
    return merged;
  } catch {
    return DEMO_DESIGNERS;
  }
}

function writeUsers(users: StoredUser[]): void {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.warn(error);
  }
}

function readSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

function writeSession(user: SessionUser | null): void {
  try {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.warn(error);
  }
}

function nameFromEmail(email: string): string {
  const base = email.split('@')[0].replace(/[._-]+/g, ' ').trim();
  return base
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

interface AuthContextValue {
  user: SessionUser | null;
  loading: boolean;
  mode: 'supabase' | 'local';
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      if (supabaseEnabled) {
        const sb = getSupabase();
        const { data } = await sb.auth.getSession();
        if (cancelled) return;
        const session = data.session;
        if (session?.user) {
          const meta = session.user.user_metadata ?? {};
          const email = session.user.email ?? '';
          const designer = ['markanti@duopixel.agency', 'sundar@duopixel.agency'].includes(email)
            ? (email.startsWith('markanti') ? 'markanti' : 'sundar')
            : null;
          const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
          setUser({
            id: session.user.id,
            email,
            name: (meta.full_name as string) || nameFromEmail(email),
            role: isAdmin ? 'admin' : designer ? 'designer' : 'client',
            designer_slug: designer as DesignerSlug | null,
            provider: 'email',
          });
        }
        const { data: sub } = sb.auth.onAuthStateChange((_event, s) => {
          if (cancelled) return;
          if (!s?.user) {
            setUser(null);
            return;
          }
          const email = s.user.email ?? '';
          const designer = email.startsWith('markanti')
            ? 'markanti'
            : email.startsWith('sundar')
              ? 'sundar'
              : null;
          const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
          setUser({
            id: s.user.id,
            email,
            name: (s.user.user_metadata?.full_name as string) || nameFromEmail(email),
            role: isAdmin ? 'admin' : designer ? 'designer' : 'client',
            designer_slug: designer as DesignerSlug | null,
            provider: 'email',
          });
        });
        setLoading(false);
        return () => {
          cancelled = true;
          sub.subscription.unsubscribe();
        };
      }

      setUser(readSession());
      setLoading(false);
      return undefined;
    }

    const cleanup = boot();
    return () => {
      cancelled = true;
      void cleanup.then((fn) => fn && fn());
    };
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    if (supabaseEnabled) {
      const sb = getSupabase();
      const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (error) throw error;
      if (data.user && !data.session) {
        // Email confirmation enabled on the project.
        setUser(null);
        return;
      }
      return;
    }

    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists. Try logging in.');
    }
    if (password.length < 8) throw new Error('Password must be at least 8 characters.');
    const stored: StoredUser = {
      id: newId(),
      email,
      name: name || nameFromEmail(email),
      password,
      role: 'client',
      designer_slug: null,
    };
    writeUsers([...users, stored]);
    const session: SessionUser = {
      id: stored.id,
      email: stored.email,
      name: stored.name,
      role: 'client',
      designer_slug: null,
      provider: 'email',
    };
    writeSession(session);
    setUser(session);
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    if (supabaseEnabled) {
      const sb = getSupabase();
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return;
    }
    const match = readUsers().find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase(),
    );
    if (!match || match.password !== password) {
      throw new Error('Invalid email or password.');
    }
    const session: SessionUser = {
      id: match.id,
      email: match.email,
      name: match.name,
      role: match.role,
      designer_slug: match.designer_slug,
      provider: 'email',
    };
    writeSession(session);
    setUser(session);
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (supabaseEnabled) {
      const sb = getSupabase();
      const origin = window.location.origin;
      const { error } = await sb.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${origin}/account/my-bookings` },
      });
      if (error) throw error;
      return;
    }
    const session: SessionUser = {
      id: newId(),
      email: 'client@gmail.com',
      name: 'Google Client',
      role: 'client',
      designer_slug: null,
      provider: 'demo',
    };
    writeSession(session);
    setUser(session);
  }, []);

  const signOut = useCallback(async () => {
    if (supabaseEnabled) {
      const sb = getSupabase();
      await sb.auth.signOut();
    }
    writeSession(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      mode: supabaseEnabled ? 'supabase' : 'local',
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
    }),
    [user, loading, signUp, signIn, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `u-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
