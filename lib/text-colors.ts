import type { ColorRole } from "@/lib/theme";

/*
 * The theme colours a word in rich text can be set to. The text keeps a
 * class naming the colour (.site-text-accent), not the colour itself, so it
 * follows the theme when the theme changes (see globals.css).
 */
export const TEXT_COLORS = ["accent", "muted"] as const satisfies readonly ColorRole[];
export type TextColor = (typeof TEXT_COLORS)[number];

export const textColorClass = (color: TextColor) => `site-text-${color}`;
export const TEXT_COLOR_CLASSES = TEXT_COLORS.map(textColorClass);

/** The colour a class names, or null when it isn't one of the choices. */
export const textColorOf = (className: string | null): TextColor | null =>
  TEXT_COLORS.find((color) => textColorClass(color) === className) ?? null;
