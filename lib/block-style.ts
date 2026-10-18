import type { CSSProperties } from "react";
import { ALL_BLOCKS } from "@/config/blocks";

// Block properties that map straight onto a CSS property of the same name
const CSS_PROPERTIES = [
  "color",
  "fontWeight",
  "fontStyle",
  "fontFamily",
  "fontSize",
  "lineHeight",
  "backgroundColor",
  "textAlign",
  "marginTop",
  "marginBottom",
  "marginLeft",
  "marginRight",
  "paddingLeft",
  "paddingRight",
  "padding",
];

/**
 * Turn a block's properties into inline CSS.
 *
 * Only values the author changed from the block's default are applied, so
 * untouched properties follow the site's own typography instead of being
 * pinned to the defaults (for example Arial on a white background).
 */
export const getBlockStyle = (
  blockType: string,
  properties: Record<string, unknown>
): CSSProperties => {
  const config = ALL_BLOCKS.find((block) => block.name === blockType);
  if (!config) return {};

  const style: Record<string, string> = {};

  for (const prop of config.properties) {
    const value = properties[prop.name];
    if (typeof value !== "string" || value === "" || value === prop.default) {
      continue;
    }

    const cssName = prop.name === "alignment" ? "textAlign" : prop.name;
    if (CSS_PROPERTIES.includes(cssName)) {
      style[cssName] = value;
    }
  }

  return style as CSSProperties;
};
