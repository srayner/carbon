import { LINK_STYLES, LINK_UNDERLINES } from "@/config/blocks/link";

type LinkStyle = (typeof LINK_STYLES)[number];
type Underline = Exclude<(typeof LINK_UNDERLINES)[number], "auto">;

// Plain links underline on hover; buttons never do
const STYLE_UNDERLINE: Record<LinkStyle, Underline> = {
  plain: "hover",
  button: "none",
  outline: "none",
};

/**
 * The classes that give a Link its look from the theme (see .site-link in
 * globals.css). Values come from the database, so anything unknown falls
 * back to a plain link.
 */
export const getLinkClasses = (properties: Record<string, unknown>): string => {
  const style = (LINK_STYLES as readonly unknown[]).includes(properties.style)
    ? (properties.style as LinkStyle)
    : "plain";
  const underline =
    properties.underline !== "auto" &&
    (LINK_UNDERLINES as readonly unknown[]).includes(properties.underline)
      ? (properties.underline as Underline)
      : STYLE_UNDERLINE[style];
  return `not-prose site-link site-link-${style} site-link-underline-${underline}`;
};
