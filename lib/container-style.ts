import type { CSSProperties } from "react";
import { SPACING_STEPS } from "@/lib/theme";

/*
 * The Container block's layout options and the flexbox CSS they set. Shared
 * by its config (the choices), its View and its Editable (the CSS).
 */
export const ELEMENTS = ["div", "span"] as const;
// "row" stacks into a column when the space it is in is narrow (see
// .block-row in globals.css); "row-fixed" stays a row at any width
export const DIRECTIONS = ["column", "row", "row-fixed"] as const;
export const DEFAULT_DIRECTION = "row";
export const DIRECTION_LABELS: Record<(typeof DIRECTIONS)[number], string> = {
  column: "Column",
  row: "Row (stacks on small screens)",
  "row-fixed": "Row, never stacks",
};
export const WIDTHS = ["full", "page", "content"] as const;
export const JUSTIFY_OPTIONS = ["start", "center", "end", "between"] as const;
export const ALIGN_OPTIONS = ["stretch", "start", "center", "end"] as const;
export const GROW_OPTIONS = ["content", "1", "2", "3"] as const;

const JUSTIFY: Record<(typeof JUSTIFY_OPTIONS)[number], string> = {
  start: "flex-start",
  center: "center",
  end: "flex-end",
  between: "space-between",
};
const ALIGN: Record<(typeof ALIGN_OPTIONS)[number], string> = {
  stretch: "stretch",
  start: "flex-start",
  center: "center",
  end: "flex-end",
};

const pick = <K extends string>(
  options: readonly K[],
  value: unknown,
  fallback: K
): K => (options.includes(value as K) ? (value as K) : fallback);

/**
 * A span Container is plain inline markup: a <span> around its children, with
 * no flexbox, no layout settings and no wrapper around each child. Anything
 * other than "span" is a div, the default.
 */
export const isInlineContainer = (properties: Record<string, unknown>) =>
  properties.element === "span";

/**
 * A div Container's classes. The direction is a class, not an inline style,
 * because a row stacks by a container query, which can't override inline CSS.
 * Anything that is not one of the options is the default.
 */
export const getContainerClass = (properties: Record<string, unknown>) =>
  `block-container block-${pick(DIRECTIONS, properties.direction, DEFAULT_DIRECTION)}`;

/**
 * The rest of a div Container's flexbox CSS. Values come from the database,
 * so anything that is not one of the options falls back to the default
 * instead of reaching the page.
 */
export const getContainerStyle = (
  properties: Record<string, unknown>
): CSSProperties => {
  const gap = pick(["", ...SPACING_STEPS], properties.gap, "");
  const width = pick(WIDTHS, properties.width, "full");
  return {
    // Capped at one of the theme's widths and centred in the space it is in
    ...(width !== "full" && {
      width: "100%",
      maxWidth: `var(--site-${width}-width)`,
      marginInline: "auto",
    }),
    justifyContent: JUSTIFY[pick(JUSTIFY_OPTIONS, properties.justify, "start")],
    alignItems: ALIGN[pick(ALIGN_OPTIONS, properties.align, "stretch")],
    ...(gap && { gap: `var(--site-space-${gap})` }),
  };
};

/**
 * The flexbox CSS for a block inside a container, from its Grow property.
 * "content" keeps the browser's default (sized by its content, taking no
 * spare space). A number starts the block from nothing and shares out all
 * the space by ratio, so two blocks on 1 get half each whatever their content.
 * It is a CSS variable that .block-item reads, so a stacked row can switch it
 * off (an inline `flex` could not be overridden).
 */
export const getGrowStyle = (properties: Record<string, unknown>): CSSProperties => {
  const grow = pick(GROW_OPTIONS, properties.grow, "content");
  return grow === "content" ? {} : ({ "--block-grow": `${grow} 1 0` } as CSSProperties);
};
