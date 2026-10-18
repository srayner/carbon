// Paths that already belong to the app and can't be used as a page slug
export const RESERVED_SLUGS = ["admin", "api", "auth", "_next"];

export const slugify = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const getSlugError = (slug: string): string | null => {
  if (!slug) return "Slug is required.";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return "Slug can only contain lowercase letters, numbers and single hyphens.";
  }
  if (RESERVED_SLUGS.includes(slug)) {
    return `"${slug}" is reserved. Choose a different slug.`;
  }
  return null;
};
