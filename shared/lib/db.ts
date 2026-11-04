/**
 * Data layer for Duo Pixel Agency.
 *
 * Works two ways:
 *  1. Supabase mode  — when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY are set,
 *     every read/write goes to Postgres, Storage, Auth and Realtime.
 *  2. Local demo mode — when they are empty, the app runs entirely in the
 *     browser (localStorage) with the full seed data so every button works
 *     without any backend.
 *
 * Every Supabase call is wrapped so a missing table/row falls back to the
 * local layer instead of breaking the UI.
 */
import { ATTACHMENTS_BUCKET, getSupabase, getSupabaseOrNull, supabaseEnabled } from './supabase';
import * as seed from './seed';
import type {
  Booking,
  BookingFile,
  BookingStatus,
  ContactMessage,
  Designer,
  DesignerSlug,
  Package,
  Review,
} from './types';
import { bookingCode } from './format';

const K = {
  bookings: 'dpa.bookings.v1',
  designers: 'dpa.designers.v1',
  packages: 'dpa.packages.v1',
  messages: 'dpa.messages.v1',
  reviews: 'dpa.reviews.v1',
};

/* ------------------------------------------------------------------ */
/* Local storage helpers                                              */
/* ------------------------------------------------------------------ */

function readLocal<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocal<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Quota exceeded — keep the session usable, just do not persist.
    console.warn('Could not persist to localStorage', error);
  }
}

/* ------------------------------------------------------------------ */
/* Realtime bus (local mode + cross-tab sync)                          */
/* ------------------------------------------------------------------ */

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeBookings(cb: Listener): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key && e.key.startsWith('dpa.')) cb();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

function notify(): void {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (error) {
      console.warn(error);
    }
  });
}

/* ------------------------------------------------------------------ */
/* Seed bootstrap                                                      */
/* ------------------------------------------------------------------ */

function ensureSeed(): void {
  if (!window.localStorage.getItem(K.designers)) writeLocal(K.designers, seed.DESIGNERS);
  if (!window.localStorage.getItem(K.packages)) writeLocal(K.packages, seed.PACKAGES);
  if (!window.localStorage.getItem(K.reviews)) writeLocal(K.reviews, seed.REVIEWS);
}
ensureSeed();

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/* ------------------------------------------------------------------ */
/* Bookings                                                            */
/* ------------------------------------------------------------------ */

export interface NewBookingInput {
  designer_slug: DesignerSlug | null;
  website_type: string;
  website_name: string;
  description: string;
  pages_needed: string;
  features: string[];
  style_preferences: string;
  reference_links: string;
  files: BookingFile[];
  budget: string;
  deadline: string;
  language: string;
  package_id: string | null;
  client_name: string;
  client_phone: string;
  client_email: string;
  contact_method: string;
  client_uid?: string | null;
}

function localBookings(): Booking[] {
  return readLocal<Booking[]>(K.bookings, []);
}

function sortBookings(list: Booking[]): Booking[] {
  return [...list].sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
}

export async function listBookings(): Promise<Booking[]> {
  if (supabaseEnabled) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return data as Booking[];
    console.warn('Supabase bookings read failed, using local data', error);
  }
  return sortBookings(localBookings());
}

export async function getBookingByCode(code: string): Promise<Booking | null> {
  const normalized = code.trim().toUpperCase();
  if (supabaseEnabled) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('bookings')
      .select('*')
      .eq('booking_code', normalized)
      .maybeSingle();
    if (!error && data) return data as Booking;
    if (error) console.warn('Supabase booking lookup failed', error);
  }
  return localBookings().find((b) => b.booking_code === normalized) ?? null;
}

/** Phone + code lookup used by the public tracking page (no login). */
export async function trackBooking(code: string, phone: string): Promise<Booking | null> {
  const booking = await getBookingByCode(code);
  if (!booking) return null;
  const digits = (s: string) => s.replace(/\D/g, '');
  const a = digits(booking.client_phone);
  const b = digits(phone);
  const matches =
    a === b || (a.length >= 10 && b.length >= 10 && a.slice(-10) === b.slice(-10));
  return matches ? booking : null;
}

export async function createBooking(input: NewBookingInput): Promise<Booking> {
  const now = new Date().toISOString();
  const booking: Booking = {
    id: newId(),
    booking_code: bookingCode(),
    status: 'Pending',
    history: [{ status: 'Pending', at: now, note: 'Booking request received' }],
    rating: null,
    review: null,
    internal_note: '',
    client_uid: input.client_uid ?? null,
    created_at: now,
    updated_at: now,
    ...input,
  };

  if (supabaseEnabled) {
    const sb = getSupabase();
    const { data, error } = await sb.from('bookings').insert(booking).select().single();
    if (!error && data) {
      notify();
      return data as Booking;
    }
    console.warn('Supabase booking insert failed, saving locally', error);
  }

  const list = localBookings();
  list.unshift(booking);
  writeLocal(K.bookings, list);
  notify();
  return booking;
}

export async function updateBooking(
  id: string,
  patch: Partial<Booking>,
): Promise<Booking | null> {
  const next = { ...patch, updated_at: new Date().toISOString() };

  if (supabaseEnabled) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('bookings')
      .update(next)
      .eq('id', id)
      .select()
      .maybeSingle();
    if (!error && data) {
      notify();
      return data as Booking;
    }
    if (error) console.warn('Supabase booking update failed', error);
  }

  const list = localBookings();
  const idx = list.findIndex((b) => b.id === id);
  if (idx === -1) return null;
  list[idx] = { ...list[idx], ...next };
  writeLocal(K.bookings, list);
  notify();
  return list[idx];
}

/** Move a booking to a new status and append it to the public timeline. */
export async function setBookingStatus(
  id: string,
  status: BookingStatus,
  note?: string,
): Promise<Booking | null> {
  const current = (await listBookings()).find((b) => b.id === id);
  if (!current) return null;
  const history = [
    ...current.history,
    { status, at: new Date().toISOString(), ...(note ? { note } : {}) },
  ];
  return updateBooking(id, { status, history });
}

/** Designer accepts a booking (from the unassigned pool or a direct request). */
export async function claimBooking(
  id: string,
  designer: DesignerSlug,
): Promise<Booking | null> {
  const current = (await listBookings()).find((b) => b.id === id);
  if (!current) return null;
  const history = [
    ...current.history,
    {
      status: 'Accepted' as BookingStatus,
      at: new Date().toISOString(),
      note: `${designer === 'markanti' ? 'Markanti' : 'Sundar'} accepted this project`,
    },
  ];
  return updateBooking(id, {
    designer_slug: designer,
    status: 'Accepted',
    history,
  });
}

export async function saveReview(
  id: string,
  rating: number,
  review: string,
): Promise<Booking | null> {
  return updateBooking(id, { rating, review });
}

/* ------------------------------------------------------------------ */
/* Designers + packages (editable from the dashboard)                  */
/* ------------------------------------------------------------------ */

export async function listDesigners(): Promise<Designer[]> {
  if (supabaseEnabled) {
    const sb = getSupabase();
    const { data, error } = await sb.from('designers').select('*').order('name');
    if (!error && data && data.length) return data as Designer[];
    if (error) console.warn('Supabase designers read failed, using seed data', error);
  }
  return readLocal<Designer[]>(K.designers, seed.DESIGNERS);
}

export async function getDesigner(slug: DesignerSlug): Promise<Designer | null> {
  const list = await listDesigners();
  return list.find((d) => d.slug === slug) ?? null;
}

export async function updateDesigner(
  slug: DesignerSlug,
  patch: Partial<Designer>,
): Promise<Designer | null> {
  const list = await listDesigners();
  const idx = list.findIndex((d) => d.slug === slug);
  if (idx === -1) return null;
  const next = { ...list[idx], ...patch };

  if (supabaseEnabled) {
    const sb = getSupabase();
    const { error } = await sb.from('designers').update(patch).eq('slug', slug);
    if (error) console.warn('Supabase designer update failed, applied locally', error);
  }
  list[idx] = next;
  writeLocal(K.designers, list);
  notify();
  return next;
}

export async function listPackages(): Promise<Package[]> {
  if (supabaseEnabled) {
    const sb = getSupabase();
    const { data, error } = await sb.from('packages').select('*').order('price');
    if (!error && data && data.length) return data as Package[];
    if (error) console.warn('Supabase packages read failed, using seed data', error);
  }
  return readLocal<Package[]>(K.packages, seed.PACKAGES);
}

export async function updatePackage(
  id: string,
  patch: Partial<Package>,
): Promise<Package | null> {
  const list = await listPackages();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  const next = { ...list[idx], ...patch };

  if (supabaseEnabled) {
    const sb = getSupabase();
    const { error } = await sb.from('packages').update(patch).eq('id', id);
    if (error) console.warn('Supabase package update failed, applied locally', error);
  }
  list[idx] = next;
  writeLocal(K.packages, list);
  notify();
  return next;
}

/* ------------------------------------------------------------------ */
/* Reviews seeded per designer                                         */
/* ------------------------------------------------------------------ */

export async function listReviews(): Promise<Review[]> {
  if (supabaseEnabled) {
    const sb = getSupabase();
    const { data, error } = await sb.from('reviews').select('*').order('date', { ascending: false });
    if (!error && data && data.length) return data as Review[];
    if (error) console.warn('Supabase reviews read failed, using seed data', error);
  }
  return readLocal<Review[]>(K.reviews, seed.REVIEWS);
}

/* ------------------------------------------------------------------ */
/* Contact messages                                                    */
/* ------------------------------------------------------------------ */

export async function createMessage(
  input: Omit<ContactMessage, 'id' | 'created_at'>,
): Promise<ContactMessage> {
  const message: ContactMessage = {
    id: newId(),
    created_at: new Date().toISOString(),
    ...input,
  };
  if (supabaseEnabled) {
    const sb = getSupabase();
    const { data, error } = await sb.from('contact_messages').insert(message).select().single();
    if (!error && data) return data as ContactMessage;
    console.warn('Supabase message insert failed, saving locally', error);
  }
  const list = readLocal<ContactMessage[]>(K.messages, []);
  list.unshift(message);
  writeLocal(K.messages, list);
  return message;
}

export async function listMessages(): Promise<ContactMessage[]> {
  if (supabaseEnabled) {
    const sb = getSupabase();
    const { data, error } = await sb
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) return data as ContactMessage[];
  }
  return readLocal<ContactMessage[]>(K.messages, []);
}

/* ------------------------------------------------------------------ */
/* Storage uploads                                                     */
/* ------------------------------------------------------------------ */

export async function uploadAttachment(file: File): Promise<BookingFile> {
  const base = { name: file.name, size: file.size, type: file.type };

  if (supabaseEnabled) {
    const sb = getSupabase();
    const ext = file.name.includes('.') ? file.name.split('.').pop() : 'bin';
    const path = `bookings/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await sb.storage.from(ATTACHMENTS_BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });
    if (!error) {
      const { data } = sb.storage.from(ATTACHMENTS_BUCKET).getPublicUrl(path);
      return { ...base, url: data.publicUrl };
    }
    console.warn('Supabase upload failed, storing metadata only', error);
  }

  // Local demo mode: keep a data URL for small files so the dashboard can show it.
  if (file.size <= 500_000) {
    const dataUrl = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
    if (dataUrl) return { ...base, url: dataUrl };
  }
  return base;
}

/* ------------------------------------------------------------------ */
/* Confirmation email (Supabase Edge Function)                         */
/* ------------------------------------------------------------------ */

export type EmailResult = 'sent' | 'skipped' | 'failed';

export async function sendConfirmationEmail(booking: Booking): Promise<EmailResult> {
  const endpoint = import.meta.env.VITE_EMAIL_FUNCTION_URL as string | undefined;
  if (!endpoint) return 'skipped';
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ booking }),
    });
    return res.ok ? 'sent' : 'failed';
  } catch (error) {
    console.warn('Confirmation email failed', error);
    return 'failed';
  }
}

/* ------------------------------------------------------------------ */
/* Realtime subscription (Supabase)                                     */
/* ------------------------------------------------------------------ */

export function watchBookings(onChange: () => void): () => void {
  const localUnsub = subscribeBookings(onChange);
  const sb = getSupabaseOrNull();
  if (!sb) return localUnsub;

  const channel = sb
    .channel('bookings-changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'bookings' },
      () => onChange(),
    )
    .subscribe();

  return () => {
    localUnsub();
    sb.removeChannel(channel);
  };
}
