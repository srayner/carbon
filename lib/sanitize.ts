import sanitizeHtml from "sanitize-html";

/**
 * Clean rich text HTML before it is rendered on a public page. Keeps the
 * usual formatting, links, images and tables, and drops scripts, event
 * handlers and anything else unexpected.
 */
export const sanitizeRichText = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ["src", "alt", "width", "height"],
      "*": ["style"],
    },
    allowedStyles: {
      "*": { "text-align": [/^(left|right|center|justify)$/] },
    },
    allowedSchemes: ["http", "https", "mailto"],
  });
