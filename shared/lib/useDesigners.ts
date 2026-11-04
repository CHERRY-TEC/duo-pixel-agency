import { useEffect, useState } from 'react';
import { listDesigners, listPackages, listReviews, subscribeBookings } from './db';
import type { Designer, Package, Review } from './types';

/**
 * Live views over the designer / package / review tables.
 * Re-reads whenever the realtime bus fires, so dashboard edits show up
 * on the public pages without a manual refresh.
 */

export function useDesigners(): Designer[] | null {
  const [designers, setDesigners] = useState<Designer[] | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => listDesigners().then((d) => alive && setDesigners(d));
    load();
    const unsub = subscribeBookings(load);
    return () => {
      alive = false;
      unsub();
    };
  }, []);

  return designers;
}

export function useDesigner(slug: string | undefined): Designer | null {
  const designers = useDesigners();
  if (!designers) return null;
  return designers.find((d) => d.slug === slug) ?? null;
}

export function usePackages(): Package[] | null {
  const [packages, setPackages] = useState<Package[] | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => listPackages().then((p) => alive && setPackages(p));
    load();
    const unsub = subscribeBookings(load);
    return () => {
      alive = false;
      unsub();
    };
  }, []);

  return packages;
}

export function useReviews(): Review[] | null {
  const [reviews, setReviews] = useState<Review[] | null>(null);

  useEffect(() => {
    let alive = true;
    const load = () => listReviews().then((r) => alive && setReviews(r));
    load();
    const unsub = subscribeBookings(load);
    return () => {
      alive = false;
      unsub();
    };
  }, []);

  return reviews;
}
