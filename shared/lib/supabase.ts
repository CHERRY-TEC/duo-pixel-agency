import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/** True when real Supabase credentials are configured. */
export const supabaseEnabled = Boolean(url && key && url.startsWith('http'));

let client: SupabaseClient | null = null;

/** Lazily create the Supabase client (only when configured). */
export function getSupabase(): SupabaseClient {
  if (!supabaseEnabled) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  if (!client) {
    client = createClient(url as string, key as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}

/** Same as getSupabase() but returns null instead of throwing. */
export function getSupabaseOrNull(): SupabaseClient | null {
  if (!supabaseEnabled) return null;
  return getSupabase();
}

/** Bucket used for booking attachments (logo, sketches). */
export const ATTACHMENTS_BUCKET = 'booking-attachments';
