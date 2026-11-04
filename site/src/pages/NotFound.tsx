import { Link } from 'react-router-dom';
import { ArrowUpRight, Home, MessageCircle } from 'lucide-react';
import { useEffect } from 'react';
import { contactWhatsAppMessage, whatsappLink } from '@/lib/format';
import { AGENCY } from '@/lib/seed';

export default function NotFound() {
  useEffect(() => {
    document.title = 'Page not found — Duo Pixel Agency';
  }, []);

  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center py-16 text-center">
      <p className="font-mono text-7xl font-bold text-accent">404</p>
      <h1 className="mt-4 font-display text-2xl font-bold text-white sm:text-3xl">
        This page drifted off the grid
      </h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-300">
        The link may be old, or the page moved. Everything else is one tap away.
      </p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link to="/" className="btn-primary">
          <Home size={16} /> Back to home
        </Link>
        <Link to="/book" className="btn-ghost">
          Book a Design <ArrowUpRight size={16} />
        </Link>
        <a
          href={whatsappLink(AGENCY.whatsapp, contactWhatsAppMessage())}
          target="_blank"
          rel="noreferrer"
          className="btn-ghost"
        >
          <MessageCircle size={16} /> WhatsApp us
        </a>
      </div>
    </div>
  );
}
