/**
 * Links between the two apps.
 *
 * The public website and the client/designer portal are separate SPAs. When
 * they are served from one origin (local dev, `npm run build` + preview, or a
 * single-domain deploy) these helpers return plain paths such as `/login`.
 *
 * Deploy them on two domains and set the matching env vars instead:
 *   VITE_PORTAL_URL=https://app.example.com
 *   VITE_SITE_URL=https://example.com
 */
const strip = (value: string | undefined): string => (value ?? '').replace(/\/+$/, '');

const portalBase = strip(import.meta.env.VITE_PORTAL_URL as string | undefined);
const siteBase = strip(import.meta.env.VITE_SITE_URL as string | undefined);

function join(base: string, path: string): string {
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
}

/** Absolute (or root-relative) URL of a route in the portal app. */
export function portalUrl(path: string): string {
  return join(portalBase, path);
}

/** Absolute (or root-relative) URL of a route in the public website. */
export function siteUrl(path: string): string {
  return join(siteBase, path);
}
