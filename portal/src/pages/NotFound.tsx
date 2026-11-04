import { ArrowUpRight, MapPin } from 'lucide-react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { siteUrl } from '@/lib/links';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page not found — Duo Pixel Agency';
  }, []);

  return (
    <div className="container-x flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-mono text-7xl font-bold text-accent">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">
        Nothing on this screen
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-300">
        The portal page you asked for does not exist. Your bookings and the tracking page are
        one tap away.
      </p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link to="/track" className="btn-primary">
          <MapPin size={16} /> Track a booking
        </Link>
        <Link to="/account/my-bookings" className="btn-ghost">
          My bookings <ArrowUpRight size={16} />
        </Link>
        <a href={siteUrl('/')} className="btn-ghost">
          Back to the website
        </a>
      </div>
    </div>
  );
}
