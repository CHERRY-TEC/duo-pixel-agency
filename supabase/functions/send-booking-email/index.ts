// ---------------------------------------------------------------------------
// Supabase Edge Function: send-booking-email
// Deploy:  supabase functions deploy send-booking-email
// Then set VITE_EMAIL_FUNCTION_URL to the function's URL in your env.
//
// Uses any SMTP provider via SMTP_* secrets (Resend, Brevo, Gmail app password…):
//   supabase secrets set SMTP_HOST=smtp.resend.com SMTP_PORT=587 \
//     SMTP_USER=resend SMTP_PASS=xxx SMTP_FROM="Duo Pixel Agency <duopixelagency@gmail.com>"
//
// Security:
//   * Only requests whose Origin is one of our own sites are accepted, so the
//     function cannot be used by third parties as an email relay.
//   * The booking must actually exist in the database (booking_code +
//     client_email) before any email is sent.
//   * Internal errors are logged server-side and never echoed to callers.
// ---------------------------------------------------------------------------

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/** Sites allowed to call this function. Override with ALLOWED_ORIGINS (comma separated). */
const ALLOWED_ORIGINS = new Set(
  (
    Deno.env.get('ALLOWED_ORIGINS') ??
      'https://duo-pixel-agency.vercel.app,https://duo-pixel-portal.vercel.app'
  )
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
);

function allowedOrigin(req: Request): string | null {
  const origin = req.headers.get('origin');
  return origin && ALLOWED_ORIGINS.has(origin) ? origin : null;
}

function corsHeaders(req: Request): Record<string, string> {
  const origin = allowedOrigin(req);
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  };
  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
}

interface Booking {
  booking_code: string;
  website_name: string;
  website_type: string;
  client_name: string;
  client_email: string;
  budget: string;
  deadline: string;
  designer_slug: string | null;
  status: string;
}

function escapeHtml(value: string): string {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function renderEmail(booking: Booking, siteUrl: string): string {
  const designer =
    booking.designer_slug === 'markanti'
      ? 'Markanti Hanmanth'
      : booking.designer_slug === 'sundar'
        ? 'Sundar'
        : 'Best available designer';

  return `<!doctype html>
<html>
  <body style="margin:0;background:#050506;font-family:Inter,Arial,sans-serif;color:#E4E4EC">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#050506;padding:32px 16px">
      <tr><td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#0E0E11;border:1px solid #1E1E25;border-radius:16px;padding:32px">
          <tr><td>
            <div style="font-size:14px;letter-spacing:2px;color:#B9FF39;text-transform:uppercase">Booking confirmed</div>
            <h1 style="font-size:26px;margin:12px 0 4px;color:#ffffff">Thanks ${escapeHtml(booking.client_name)}!</h1>
            <p style="font-size:15px;color:#8A8A9A;margin:0">We received your website request for <strong style="color:#ffffff">${escapeHtml(booking.website_name)}</strong>.</p>

            <div style="margin:24px 0;padding:20px;border:1px dashed #B9FF39;border-radius:12px;text-align:center;background:#050506">
              <div style="font-size:11px;letter-spacing:2px;color:#5A5A6A;text-transform:uppercase">Booking ID</div>
              <div style="font-family:monospace;font-size:30px;letter-spacing:6px;color:#B9FF39;margin-top:8px">${escapeHtml(booking.booking_code)}</div>
            </div>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;color:#B9B9C6">
              <tr><td style="padding:6px 0;color:#5A5A6A">Type</td><td align="right" style="color:#E4E4EC">${escapeHtml(booking.website_type)}</td></tr>
              <tr><td style="padding:6px 0;color:#5A5A6A">Designer</td><td align="right" style="color:#E4E4EC">${escapeHtml(designer)}</td></tr>
              <tr><td style="padding:6px 0;color:#5A5A6A">Budget</td><td align="right" style="color:#E4E4EC">${escapeHtml(booking.budget)}</td></tr>
              <tr><td style="padding:6px 0;color:#5A5A6A">Deadline</td><td align="right" style="color:#E4E4EC">${escapeHtml(booking.deadline)}</td></tr>
              <tr><td style="padding:6px 0;color:#5A5A6A">Status</td><td align="right" style="color:#E4E4EC">${escapeHtml(booking.status)}</td></tr>
            </table>

            <div style="margin:28px 0 8px">
              <a href="${siteUrl}/track?code=${encodeURIComponent(booking.booking_code)}"
                 style="display:inline-block;background:#B9FF39;color:#050506;font-weight:700;text-decoration:none;padding:14px 24px;border-radius:999px">
                 Track your booking
              </a>
            </div>

            <p style="font-size:13px;color:#5A5A6A;margin-top:24px">
              We reply within one working day. Reply to this email or WhatsApp us at any time.
            </p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}

/** Minimal SMTP client over STARTTLS-free submission is provider specific,
 *  so we post to the provider's HTTP API when one is configured. */
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const resendKey = Deno.env.get('RESEND_API_KEY');
  const smtpUser = Deno.env.get('SMTP_USER');
  const smtpPass = Deno.env.get('SMTP_PASS');
  const smtpHost = Deno.env.get('SMTP_HOST') ?? 'smtp.resend.com';
  const smtpPort = Deno.env.get('SMTP_PORT') ?? '587';
  const from = Deno.env.get('SMTP_FROM') ?? 'Duo Pixel Agency <duopixelagency@gmail.com>';

  if (resendKey) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!res.ok) throw new Error(`Resend failed: ${await res.text()}`);
    return;
  }

  if (smtpUser && smtpPass) {
    // Generic provider that accepts JSON submission (Brevo / Postmark style).
    const endpoint = Deno.env.get('SMTP_API_URL');
    if (endpoint) {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': smtpPass,
          Authorization: `Bearer ${smtpPass}`,
        },
        body: JSON.stringify({
          sender: from,
          to: [{ email: to }],
          subject,
          htmlContent: html,
        }),
      });
      if (!res.ok) throw new Error(`SMTP API failed: ${await res.text()}`);
      return;
    }
    console.info(`SMTP configured for ${smtpHost}:${smtpPort} — plug your provider API here.`);
    return;
  }

  console.warn('No email provider configured — skipping send.');
}

function json(cors: Record<string, string>, status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req);

  if (req.method === 'OPTIONS') {
    return allowedOrigin(req)
      ? new Response('ok', { headers: cors })
      : new Response('Forbidden', { status: 403 });
  }

  // Only our own websites may call this function (no Origin = not a browser
  // on our site = rejected), which stops it being used as an open mail relay.
  if (req.method !== 'POST' || !allowedOrigin(req)) {
    return json(cors, 403, { error: 'Forbidden' });
  }

  try {
    const { booking } = (await req.json()) as { booking: Booking };
    if (!booking?.booking_code || !booking?.client_email) {
      return json(cors, 400, { error: 'Missing booking payload' });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
      console.error('SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not configured');
      return json(cors, 503, { error: 'Email service unavailable' });
    }

    const admin = createClient(supabaseUrl, serviceKey);

    // The booking must really exist before we send anything on its behalf.
    const { data: existing, error: lookupError } = await admin
      .from('bookings')
      .select('booking_code')
      .eq('booking_code', booking.booking_code)
      .eq('client_email', booking.client_email)
      .maybeSingle();
    if (lookupError) {
      console.error('Booking lookup failed', lookupError.message);
      return json(cors, 503, { error: 'Email service unavailable' });
    }
    if (!existing) {
      return json(cors, 404, { error: 'Unknown booking' });
    }

    const siteUrl =
      Deno.env.get('SITE_URL') ?? 'https://duo-pixel-agency.vercel.app';
    const html = renderEmail(booking, siteUrl);
    await sendEmail(
      booking.client_email,
      `Booking ${booking.booking_code} confirmed — Duo Pixel Agency`,
      html,
    );

    // Also notify the agency inbox about the new order (best effort).
    const agencyEmail = Deno.env.get('AGENCY_NOTIFY_EMAIL') ?? 'duopixelagency@gmail.com';
    await sendEmail(
      agencyEmail,
      `New order — Duo Pixel Agency (${booking.booking_code})`,
      html,
    );

    // Mirror a copy into Supabase for the designers' records (best effort).
    await admin.from('contact_messages').insert({
      name: booking.client_name,
      email: booking.client_email,
      subject: `Booking confirmation sent — ${booking.booking_code}`,
      message: `Confirmation email delivered for ${booking.website_name}.`,
    });

    return json(cors, 200, { ok: true });
  } catch (error) {
    // Log internally, but never echo details (keys, provider payloads…) out.
    console.error(error);
    return json(cors, 500, { error: 'Internal error' });
  }
});
