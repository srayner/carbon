export const FRAGMENT_KINDS = ["HEADER", "FOOTER", "GENERAL"] as const;
export type FragmentKind = (typeof FRAGMENT_KINDS)[number];

/**
 * The structure of a template, stored as JSON on Template.layout.
 *
 * `areas` is a CSS grid-template-areas matrix. The area named "main" shows the
 * page's own content; every other area name that appears in `slots` is filled
 * by a Fragment of the declared kind (assigned through TemplateSlot).
 */
export type TemplateLayout = {
  columns: string[];
  rows: string[];
  areas: string[][];
  contentWidth: "narrow" | "full";
  slots: Record<string, { kind: FragmentKind }>;
};
