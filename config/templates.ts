import type { TemplateLayout } from "@/types/templates";

/** The template new pages start with (also what existing pages were given). */
export const DEFAULT_TEMPLATE_ID = "tpl_single_column";

const pageWithHeaderAndFooter = (
  contentWidth: TemplateLayout["contentWidth"]
): TemplateLayout => ({
  columns: ["1fr"],
  rows: ["auto", "1fr", "auto"],
  areas: [["header"], ["main"], ["footer"]],
  contentWidth,
  slots: { header: { kind: "HEADER" }, footer: { kind: "FOOTER" } },
});

const leftSidebar: TemplateLayout = {
  columns: ["240px", "1fr"],
  rows: ["auto", "1fr", "auto"],
  areas: [
    ["header", "header"],
    ["sidebar", "main"],
    ["footer", "footer"],
  ],
  contentWidth: "full",
  slots: {
    header: { kind: "HEADER" },
    sidebar: { kind: "GENERAL" },
    footer: { kind: "FOOTER" },
  },
};

// Keep in sync with the INSERTs in the add_templates and
// add_left_sidebar_preset migrations
export const PRESET_TEMPLATES = [
  {
    id: DEFAULT_TEMPLATE_ID,
    name: "Single column",
    description: "Header, a centred column of content, then footer.",
    layout: pageWithHeaderAndFooter("narrow"),
  },
  {
    id: "tpl_full_width",
    name: "Full width",
    description: "Header, full-width content, then footer.",
    layout: pageWithHeaderAndFooter("full"),
  },
  {
    id: "tpl_left_sidebar",
    name: "Left sidebar",
    description:
      "Header and footer across the top and bottom, a sidebar on the left, content beside it.",
    layout: leftSidebar,
  },
];
