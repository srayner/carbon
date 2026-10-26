import { z } from "zod";

/*
 * The site theme: fixed token names whose values the admin can change. Blocks
 * and components refer to the names (as CSS variables), never to the values.
 * No server-only imports here, so the admin form can share the definitions.
 */

export const COLOR_ROLES = [
  "background",
  "surface",
  "text",
  "muted",
  "accent",
  "border",
] as const;
export const FONT_ROLES = ["heading", "body", "mono"] as const;
export const SPACING_STEPS = ["none", "xs", "s", "m", "l", "xl"] as const;
export const RADIUS_STEPS = ["none", "s", "m", "l", "full"] as const;
export const BORDER_STEPS = ["none", "thin", "medium", "thick"] as const;
export const SHADOW_STEPS = ["none", "s", "m", "l"] as const;

export type ColorRole = (typeof COLOR_ROLES)[number];
export type FontRole = (typeof FONT_ROLES)[number];
export type SpacingStep = (typeof SPACING_STEPS)[number];
export type RadiusStep = (typeof RADIUS_STEPS)[number];
export type BorderStep = (typeof BORDER_STEPS)[number];
export type ShadowStep = (typeof SHADOW_STEPS)[number];

/* ----- Fonts ----- */

type FontOption = {
  label: string;
  stack: string; // the CSS font-family value
  google?: string; // the family as named in a Google Fonts URL
  kind: "sans" | "serif" | "mono";
};

export const FONTS = {
  system: {
    label: "System sans",
    stack:
      'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    kind: "sans",
  },
  "system-serif": {
    label: "System serif",
    stack: 'ui-serif, Georgia, Cambria, "Times New Roman", serif',
    kind: "serif",
  },
  "system-mono": {
    label: "System mono",
    stack:
      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace',
    kind: "mono",
  },
  inter: {
    label: "Inter",
    stack: '"Inter", ui-sans-serif, system-ui, sans-serif',
    google: "Inter:wght@400;500;600;700",
    kind: "sans",
  },
  "space-grotesk": {
    label: "Space Grotesk",
    stack: '"Space Grotesk", ui-sans-serif, system-ui, sans-serif',
    google: "Space+Grotesk:wght@400;500;600;700",
    kind: "sans",
  },
  "dm-sans": {
    label: "DM Sans",
    stack: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    google: "DM+Sans:wght@400;500;600;700",
    kind: "sans",
  },
  "work-sans": {
    label: "Work Sans",
    stack: '"Work Sans", ui-sans-serif, system-ui, sans-serif',
    google: "Work+Sans:wght@400;500;600;700",
    kind: "sans",
  },
  roboto: {
    label: "Roboto",
    stack: '"Roboto", ui-sans-serif, system-ui, sans-serif',
    google: "Roboto:wght@400;500;700",
    kind: "sans",
  },
  "open-sans": {
    label: "Open Sans",
    stack: '"Open Sans", ui-sans-serif, system-ui, sans-serif',
    google: "Open+Sans:wght@400;600;700",
    kind: "sans",
  },
  poppins: {
    label: "Poppins",
    stack: '"Poppins", ui-sans-serif, system-ui, sans-serif',
    google: "Poppins:wght@400;500;600;700",
    kind: "sans",
  },
  lora: {
    label: "Lora",
    stack: '"Lora", ui-serif, Georgia, serif',
    google: "Lora:wght@400;500;600;700",
    kind: "serif",
  },
  merriweather: {
    label: "Merriweather",
    stack: '"Merriweather", ui-serif, Georgia, serif',
    google: "Merriweather:wght@400;700",
    kind: "serif",
  },
  "playfair-display": {
    label: "Playfair Display",
    stack: '"Playfair Display", ui-serif, Georgia, serif',
    google: "Playfair+Display:wght@400;500;600;700",
    kind: "serif",
  },
  "source-serif": {
    label: "Source Serif 4",
    stack: '"Source Serif 4", ui-serif, Georgia, serif',
    google: "Source+Serif+4:wght@400;600;700",
    kind: "serif",
  },
  "ibm-plex-mono": {
    label: "IBM Plex Mono",
    stack: '"IBM Plex Mono", ui-monospace, Menlo, monospace',
    google: "IBM+Plex+Mono:wght@400;500;600",
    kind: "mono",
  },
  "jetbrains-mono": {
    label: "JetBrains Mono",
    stack: '"JetBrains Mono", ui-monospace, Menlo, monospace',
    google: "JetBrains+Mono:wght@400;500;700",
    kind: "mono",
  },
  "fira-code": {
    label: "Fira Code",
    stack: '"Fira Code", ui-monospace, Menlo, monospace',
    google: "Fira+Code:wght@400;500;700",
    kind: "mono",
  },
} as const satisfies Record<string, FontOption>;

export type FontKey = keyof typeof FONTS;
export const FONT_KEYS = Object.keys(FONTS) as FontKey[];
export const fontOptions = (): [FontKey, FontOption][] =>
  FONT_KEYS.map((key) => [key, FONTS[key] as FontOption]);

/* ----- Shape and validation ----- */

// A length: 0, or a number with a unit
const LENGTH = /^(0|\d{1,4}(\.\d{1,3})?(px|rem|em|%|vw|ch))$/;
const HEX = /^#[0-9a-fA-F]{6}$/;

// A box-shadow: "none", or a list of offsets, blurs and colours. No quotes,
// semicolons or braces, so it cannot break out of the style it is placed in.
const SHADOW = /^[0-9a-zA-Z#(),.\s%-]{1,100}$/;

const length = z.string().regex(LENGTH, "Use a length such as 1rem or 16px.");
const shadow = z.string().regex(SHADOW, "Use a shadow such as 0 4px 12px rgba(0,0,0,0.12).");
const color = z.string().regex(HEX, "Use a hex colour such as #1a2b3c.");
const font = z.string().refine((key) => key in FONTS, "Unknown font.");

export const CUSTOM_CSS_MAX = 20000;

export const themeSchema = z.object({
  colors: z.object(
    Object.fromEntries(COLOR_ROLES.map((role) => [role, color])) as Record<
      ColorRole,
      typeof color
    >
  ),
  fonts: z.object(
    Object.fromEntries(FONT_ROLES.map((role) => [role, font])) as Record<
      FontRole,
      typeof font
    >
  ),
  spacing: z.object(
    Object.fromEntries(SPACING_STEPS.map((step) => [step, length])) as Record<
      SpacingStep,
      typeof length
    >
  ),
  radius: z.object(
    Object.fromEntries(RADIUS_STEPS.map((step) => [step, length])) as Record<
      RadiusStep,
      typeof length
    >
  ),
  borderWidth: z.object(
    Object.fromEntries(BORDER_STEPS.map((step) => [step, length])) as Record<
      BorderStep,
      typeof length
    >
  ),
  shadow: z.object(
    Object.fromEntries(SHADOW_STEPS.map((step) => [step, shadow])) as Record<
      ShadowStep,
      typeof shadow
    >
  ),
  // The widest the content column gets on a "narrow" template
  contentWidth: length,
  customCss: z.string().max(CUSTOM_CSS_MAX, "Custom CSS is too long."),
});

export type Theme = {
  colors: Record<ColorRole, string>;
  fonts: Record<FontRole, FontKey>;
  spacing: Record<SpacingStep, string>;
  radius: Record<RadiusStep, string>;
  borderWidth: Record<BorderStep, string>;
  shadow: Record<ShadowStep, string>;
  contentWidth: string;
  customCss: string;
};

/** The look of the "Maker Showcase" design: warm paper, ink and an orange accent. */
export const DEFAULT_THEME: Theme = {
  colors: {
    background: "#f4f2ec",
    surface: "#ffffff",
    text: "#141413",
    muted: "#5a5a55",
    accent: "#c2410c",
    border: "#d6d1c4",
  },
  fonts: {
    heading: "space-grotesk",
    body: "space-grotesk",
    mono: "ibm-plex-mono",
  },
  spacing: { none: "0", xs: "0.25rem", s: "0.5rem", m: "1rem", l: "2rem", xl: "4rem" },
  radius: { none: "0", s: "0.25rem", m: "0.5rem", l: "0.75rem", full: "9999px" },
  borderWidth: { none: "0", thin: "1px", medium: "2px", thick: "4px" },
  shadow: {
    none: "none",
    s: "0 1px 2px rgba(0, 0, 0, 0.08)",
    m: "0 4px 12px rgba(0, 0, 0, 0.12)",
    l: "0 12px 32px rgba(0, 0, 0, 0.16)",
  },
  contentWidth: "56rem",
  customCss: "",
};

/** Fills anything missing (an older or partial theme) from the defaults. */
export const withDefaults = (stored: unknown): Theme => {
  const value = (stored ?? {}) as Partial<Record<keyof Theme, unknown>>;
  const merged = { ...DEFAULT_THEME } as Record<string, unknown>;
  for (const key of Object.keys(DEFAULT_THEME) as (keyof Theme)[]) {
    const fallback = DEFAULT_THEME[key];
    const given = value[key];
    merged[key] =
      typeof fallback === "object" && given && typeof given === "object"
        ? { ...fallback, ...given }
        : given ?? fallback;
  }
  return merged as Theme;
};

/* ----- CSS ----- */

/** The theme as CSS variables, for the wrapper around the public site. */
export const themeVariables = (theme: Theme): Record<string, string> => {
  const vars: Record<string, string> = {};
  for (const role of COLOR_ROLES) vars[`--site-color-${role}`] = theme.colors[role];
  for (const role of FONT_ROLES) {
    vars[`--site-font-${role}`] = FONTS[theme.fonts[role]].stack;
  }
  for (const step of SPACING_STEPS) vars[`--site-space-${step}`] = theme.spacing[step];
  for (const step of RADIUS_STEPS) vars[`--site-radius-${step}`] = theme.radius[step];
  for (const step of BORDER_STEPS) vars[`--site-border-${step}`] = theme.borderWidth[step];
  for (const step of SHADOW_STEPS) vars[`--site-shadow-${step}`] = theme.shadow[step];
  vars["--site-content-width"] = theme.contentWidth;
  return vars;
};

/** One stylesheet URL for every Google font the theme uses, or null. */
export const googleFontsUrl = (theme: Theme): string | null => {
  const families = Array.from(
    new Set(
      FONT_ROLES.map((role) => {
        const option: FontOption = FONTS[theme.fonts[role]];
        return option.google;
      }).filter((family): family is string => !!family)
    )
  );
  if (families.length === 0) return null;
  return `https://fonts.googleapis.com/css2?${families
    .map((family) => `family=${family}`)
    .join("&")}&display=swap`;
};

/** Stops custom CSS from closing the <style> element it is placed in. */
export const escapeCustomCss = (css: string) =>
  css.replace(/<\/(style)/gi, "<\\/$1");
