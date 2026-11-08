import type { CSSProperties } from "react";
import { TOKEN_PROPERTIES } from "@/config/blocks/shared";

// Each shared property -> the CSS it sets, given a token name
const CSS: Record<string, (token: string) => CSSProperties> = {
  paddingSize: (t) => ({ padding: `var(--site-space-${t})` }),
  // Longhands, set after Padding so they win on the sides they cover
  paddingX: (t) => ({
    paddingLeft: `var(--site-space-${t})`,
    paddingRight: `var(--site-space-${t})`,
  }),
  paddingY: (t) => ({
    paddingTop: `var(--site-space-${t})`,
    paddingBottom: `var(--site-space-${t})`,
  }),
  marginTopSize: (t) => ({ marginTop: `var(--site-space-${t})` }),
  marginBottomSize: (t) => ({ marginBottom: `var(--site-space-${t})` }),
  radius: (t) => ({ borderRadius: `var(--site-radius-${t})` }),
  border: (t) => ({
    borderWidth: `var(--site-border-${t})`,
    borderStyle: t === "none" ? "none" : "solid",
  }),
  borderColor: (t) => ({ borderColor: `var(--site-color-${t})` }),
  shadow: (t) => ({ boxShadow: `var(--site-shadow-${t})` }),
  background: (t) => ({ backgroundColor: `var(--site-color-${t})` }),
  textColor: (t) => ({ color: `var(--site-color-${t})` }),
  fontRole: (t) => ({ fontFamily: `var(--site-font-${t})` }),
  textSize: (t) => ({ fontSize: `var(--site-text-${t})` }),
};

/**
 * A block's token properties as inline CSS using the theme's variables. A
 * value that is not one of the property's tokens is ignored (the properties
 * come from the database), and only the public site defines the variables.
 */
export const getTokenStyle = (
  properties: Record<string, unknown>
): CSSProperties => {
  let style: CSSProperties = {};

  for (const prop of TOKEN_PROPERTIES) {
    const value = properties[prop.name];
    if (typeof value !== "string" || value === "") continue;
    if (!(prop.values as readonly string[]).includes(value)) continue;
    style = { ...style, ...CSS[prop.name](value) };
  }

  return style;
};
