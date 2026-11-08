import type { CSSProperties } from "react";
import { SPACING_STEPS } from "@/lib/theme";

/*
 * The Container block's layout options and the flexbox CSS they set. Shared
 * by its config (the choices), its View and its Editable (the CSS).
 */
export const ELEMENTS = ["div", "span"] as const;
export const DIRECTIONS = ["column", "row"] as const;
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
 * The flexbox CSS for a Container's properties. Values come from the
 * database, so anything that is not one of the options falls back to the
 * default instead of reaching the page.
 */
export const getContainerStyle = (
  properties: Record<string, unknown>
): CSSProperties => {
  const gap = pick(["", ...SPACING_STEPS], properties.gap, "");
  return {
    flexDirection: pick(DIRECTIONS, properties.direction, "column"),
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
 */
export const getGrowStyle = (properties: Record<string, unknown>): CSSProperties => {
  const grow = pick(GROW_OPTIONS, properties.grow, "content");
  return grow === "content" ? {} : { flex: `${grow} 1 0` };
};
