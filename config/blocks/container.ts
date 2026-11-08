import { SquareDashed } from "lucide-react";
import { SPACING_STEPS } from "@/lib/theme";
import {
  ALIGN_OPTIONS,
  DIRECTIONS,
  ELEMENTS,
  JUSTIFY_OPTIONS,
  WIDTHS,
} from "@/lib/container-style";
import { SHARED_PROPERTIES } from "./shared";

// Holds other blocks and lays them out in a row or a column. Its children are
// the blocks whose parentId is its id (see lib/block-tree.ts).
export const ContainerBlockConfig = {
  name: "Container",
  icon: SquareDashed,
  container: true,
  properties: [
    // Layout group. A span is inline markup, so the settings after it apply
    // to a div only (see isInlineContainer)
    {
      name: "element",
      displayName: "Element",
      type: "enum",
      values: ELEMENTS,
      default: "div",
      group: "Layout",
    },
    {
      // full fills the space it is in; page and content are the theme's widths
      name: "width",
      displayName: "Width",
      type: "enum",
      values: WIDTHS,
      default: "full",
      group: "Layout",
    },
    {
      name: "direction",
      displayName: "Direction",
      type: "enum",
      values: DIRECTIONS,
      default: "column",
      group: "Layout",
    },
    {
      name: "gap",
      displayName: "Gap",
      type: "enum",
      values: ["", ...SPACING_STEPS],
      default: "m",
      group: "Layout",
    },
    {
      name: "justify",
      displayName: "Justify",
      type: "enum",
      values: JUSTIFY_OPTIONS,
      default: "start",
      group: "Layout",
    },
    {
      name: "align",
      displayName: "Align",
      type: "enum",
      values: ALIGN_OPTIONS,
      default: "stretch",
      group: "Layout",
    },

    // Link group. With an address the container is an <a>, so the whole of
    // it is one link; it can't hold another link (see validateNestedLinks)
    {
      name: "url",
      displayName: "Link to",
      type: "url",
      default: "",
      group: "Link",
    },
    {
      name: "newTab",
      displayName: "Open in a new tab",
      type: "boolean",
      default: "false",
      group: "Link",
    },

    // Advanced group
    {
      name: "className",
      displayName: "CSS Class",
      type: "string",
      default: "",
      group: "Advanced",
    },
    {
      name: "cssId",
      displayName: "ID",
      type: "string",
      default: "",
      group: "Advanced",
    },

    // Theme tokens, the same for every block
    ...SHARED_PROPERTIES,
  ],
} as const;
