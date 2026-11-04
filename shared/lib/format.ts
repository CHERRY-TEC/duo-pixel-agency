/** Small formatting + link helpers shared across the app. */

export function bookingCode(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 6; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return `DPA-${out}`;
}

export function normalizeCode(raw: string): string {
  const clean = raw.trim().toUpperCase().replace(/\s+/g, '');
  if (/^DPA/.test(clean)) return clean;
  if (/^[A-Z0-9]{6}$/.test(clean)) return `DPA-${clean}`;
  return clean;
}

export function normalizePhone(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
  if (digits.length === 10) digits = `91${digits}`;
  return digits;
}

export function inr(value: number): string {
  if (!value) return 'Custom';
  return `₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)}`;
}

export function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return iso;
  }
}

export function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export function daysAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  return months === 1 ? 'a month ago' : `${months} months ago`;
}

export function whatsappLink(number: string, message: string): string {
  const n = normalizePhone(number);
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}

export function mailto(email: string, subject: string, body: string): string {
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function bookingWhatsAppMessage(b: {
  booking_code: string;
  website_type: string;
  website_name: string;
  designer_slug: string | null;
  budget: string;
}): string {
  const who = b.designer_slug ? b.designer_slug : 'any available designer';
  return [
    `Hi Duo Pixel Agency! 👋`,
    `I just booked a design.`,
    ``,
    `Booking ID: ${b.booking_code}`,
    `Website: ${b.website_name || '(not named yet)'}`,
    `Type: ${b.website_type}`,
    `Designer: ${who === 'markanti' ? 'Markanti Hanmanth' : who === 'sundar' ? 'Sundar' : 'No preference'}`,
    `Budget: ${b.budget}`,
    ``,
    `I'd like to discuss the next step.`,
  ].join('\n');
}

export function contactWhatsAppMessage(): string {
  return 'Hi Duo Pixel Agency! I would like to discuss a website project.';
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
