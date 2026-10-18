import "server-only";

/**
 * The canonical public origin used for metadata, the sitemap, and robots.txt.
 *
 * `NEXT_PUBLIC_SITE_URL` wins when it is set. Otherwise Vercel's own
 * `VERCEL_PROJECT_PRODUCTION_URL` is used, which every deployment gets for free, so a
 * project that has not set a separate variable still emits absolute URLs instead of
 * falling back to localhost. A value without a scheme is treated as https, and a
 * trailing slash is dropped so callers can concatenate paths safely.
 */
export function siteOrigin(): string | undefined {
  const raw = (process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL || "").trim();
  if (!raw) return undefined;
  try {
    return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`).origin;
  } catch {
    return undefined;
  }
}
