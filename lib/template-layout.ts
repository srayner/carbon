import type { CSSProperties } from "react";
import { FRAGMENT_KINDS, TemplateLayout } from "@/types/templates";

export const MAIN_AREA = "main";

const AREA_NAME = /^[a-z][a-z0-9-]*$/;

export const isValidAreaName = (name: string) => AREA_NAME.test(name);

/** Checks the JSON read from the database really is a layout. */
export const parseLayout = (value: unknown): TemplateLayout => {
  const layout = value as Partial<TemplateLayout> | null;
  const isStrings = (a: unknown): a is string[] =>
    Array.isArray(a) && a.every((x) => typeof x === "string");

  if (
    !layout ||
    !isStrings(layout.columns) ||
    !isStrings(layout.rows) ||
    !Array.isArray(layout.areas) ||
    !layout.areas.every(isStrings) ||
    !layout.slots ||
    typeof layout.slots !== "object"
  ) {
    throw new Error("Template layout is malformed.");
  }

  for (const [name, slot] of Object.entries(layout.slots)) {
    if (!isValidAreaName(name) || !FRAGMENT_KINDS.includes(slot?.kind)) {
      throw new Error(`Template layout has an invalid slot "${name}".`);
    }
  }

  return {
    columns: layout.columns,
    rows: layout.rows,
    areas: layout.areas,
    contentWidth: layout.contentWidth === "full" ? "full" : "narrow",
    slots: layout.slots,
  };
};

/** Distinct area names in grid order. */
export const areaNames = (layout: TemplateLayout) =>
  [...new Set(layout.areas.flat())].filter(isValidAreaName);

const quote = (areas: string[][]) =>
  areas.map((row) => `"${row.join(" ")}"`).join(" ");

/**
 * CSS variables for the `.template-grid` class (see globals.css). Wide
 * screens get the real grid; narrow ones stack the areas in reading order.
 */
export const gridVars = (layout: TemplateLayout) => {
  const names = areaNames(layout);
  return {
    "--grid-columns": layout.columns.join(" "),
    "--grid-rows": layout.rows.join(" "),
    "--grid-areas": quote(layout.areas),
    "--grid-rows-stacked": names
      .map((name) => (name === MAIN_AREA ? "1fr" : "auto"))
      .join(" "),
    "--grid-areas-stacked": quote(names.map((name) => [name])),
  } as CSSProperties;
};

/** The plain desktop grid, for the wireframe preview. */
export const gridStyle = (layout: TemplateLayout): CSSProperties => ({
  display: "grid",
  gridTemplateColumns: layout.columns.join(" "),
  gridTemplateRows: layout.rows.join(" "),
  gridTemplateAreas: quote(layout.areas),
});
