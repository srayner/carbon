/*
 * Which link addresses a block may store and publish. Web and email
 * addresses, phone numbers and links within the site are allowed; anything
 * else that names a scheme (javascript:, data:, vbscript:, ...) is refused.
 */
export const ALLOWED_SCHEMES = ["http", "https", "mailto", "tel"] as const;

export const URL_HINT =
  "Use a web address (https://...), mailto:, tel:, a path on this site (/projects) or an #anchor.";

// Browsers ignore control characters and spaces inside a scheme, so
// "java\tscript:" still runs; they are removed before the scheme is read
const IGNORED = /[\u0000- \u007f]/g;
const SCHEME = /^([a-z][a-z0-9+.-]*):/i;

/** The address to put in href, or null when it must not be linked. */
export const safeHref = (url: unknown): string | null => {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const scheme = SCHEME.exec(trimmed.replace(IGNORED, ""))?.[1].toLowerCase();
  if (scheme === undefined) return trimmed; // a path, ?query or #anchor
  return (ALLOWED_SCHEMES as readonly string[]).includes(scheme) ? trimmed : null;
};
