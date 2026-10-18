export type PageStatus = "draft" | "scheduled" | "live";

/**
 * A page is a draft with no publish date, scheduled while the date is in
 * the future, and live once the date has passed.
 */
export const getPageStatus = (
  publishedAt: Date | string | null | undefined,
  now: Date = new Date()
): PageStatus => {
  if (!publishedAt) return "draft";
  return new Date(publishedAt) <= now ? "live" : "scheduled";
};

export const isPageLive = (
  publishedAt: Date | string | null | undefined,
  now: Date = new Date()
) => getPageStatus(publishedAt, now) === "live";
