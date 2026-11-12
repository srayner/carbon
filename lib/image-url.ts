/*
 * Which image addresses a block may use as its background. The address goes
 * into CSS as url("..."), so besides refusing script and data addresses it
 * must not hold anything that could end that value early and add CSS of its
 * own: quotes, brackets, backslashes or control characters (line breaks).
 */
export const IMAGE_URL_HINT =
  "Use an uploaded image, a path on this site (/images/hero.jpg) or a web address (https://...).";

const UNSAFE = /["'()\\\u0000-\u001f\u007f]/;
const WEB = /^https?:\/\//i;

/** The address to put in url("..."), or null when it must not be used. */
export const safeImageUrl = (url: unknown): string | null => {
  if (typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed || UNSAFE.test(trimmed)) return null;
  // A site path (uploads are under /files) or a web address; nothing else
  return trimmed.startsWith("/") || WEB.test(trimmed) ? trimmed : null;
};
