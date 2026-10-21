import type { CSSProperties } from "react";
import { SHARED_PROPERTIES } from "@/config/blocks/shared";

// Each shared property -> the CSS it sets, given a token name
const CSS: Record<string, (token: string) => CSSProperties> = {
  paddingSize: (t) => ({ padding: `var(--space-${t})` }),
  marginTopSize: (t) => ({ marginTop: `var(--space-${t})` }),
  marginBottomSize: (t) => ({ marginBottom: `var(--space-${t})` }),
  radius: (t) => ({ borderRadius: `var(--radius-${t})` }),
  border: (t) => ({
    borderWidth: `var(--border-${t})`,
    borderStyle: t === "none" ? "none" : "solid",
  }),
  shadow: (t) => ({ boxShadow: `var(--shadow-${t})` }),
  background: (t) => ({ backgroundColor: `var(--color-${t})` }),
  textColor: (t) => ({ color: `var(--color-${t})` }),
  fontRole: (t) => ({ fontFamily: `var(--font-${t})` }),
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

  for (const prop of SHARED_PROPERTIES) {
    const value = properties[prop.name];
    if (typeof value !== "string" || value === "") continue;
    if (!(prop.values as readonly string[]).includes(value)) continue;
    style = { ...style, ...CSS[prop.name](value) };
  }

  return style;
};
