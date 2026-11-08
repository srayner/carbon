import sanitizeHtml from "sanitize-html";
import { TEXT_COLOR_CLASSES } from "@/lib/text-colors";

/**
 * Clean rich text HTML before it is rendered on a public page. Keeps the
 * usual formatting, links, images, tables and the theme text colours
 * (lib/text-colors.ts), and drops scripts, event handlers, any other class
 * and anything else unexpected.
 */
export const sanitizeRichText = (html: string) =>
  sanitizeHtml(html, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "span"],
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      a: ["href", "name", "target", "rel"],
      img: ["src", "alt", "width", "height"],
      "*": ["style"],
    },
    allowedClasses: { span: TEXT_COLOR_CLASSES },
    allowedStyles: {
      "*": { "text-align": [/^(left|right|center|justify)$/] },
    },
    allowedSchemes: ["http", "https", "mailto"],
    // Links that open in a new tab must not be able to reach back to the page
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, rel: "noopener noreferrer" },
      }),
    },
  });
