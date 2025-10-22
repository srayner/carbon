import { Heading } from "lucide-react";

export const HeadingBlockConfig = {
  name: "Heading",
  icon: Heading,
  properties: [
    // Appearance group
    {
      name: "color",
      displayName: "Text Color",
      type: "color",
      default: "#000000",
      group: "Appearance",
      allowInherit: true,
    },
    {
      name: "fontWeight",
      displayName: "Font Weight",
      type: "enum",
      values: ["normal", "bold", "bolder"],
      default: "normal",
      group: "Appearance",
      allowInherit: true,
    },
    {
      name: "fontStyle",
      displayName: "Font Style",
      type: "enum",
      values: ["normal", "italic", "oblique"],
      default: "normal",
      group: "Appearance",
      allowInherit: true,
    },
    {
      name: "fontFamily",
      displayName: "Font Family",
      type: "string",
      default: "Arial",
      group: "Appearance",
      allowInherit: true,
    },
    {
      name: "backgroundColor",
      displayName: "Background Color",
      type: "color",
      default: "#ffffff",
      group: "Appearance",
      allowInherit: true,
    },
    {
      name: "level",
      displayName: "Heading Level",
      type: "enum",
      values: ["h1", "h2", "h3", "h4"],
      default: "h1",
      group: "Appearance",
      allowInherit: true,
    },

    // Layout group
    {
      name: "alignment",
      displayName: "Alignment",
      type: "enum",
      values: ["left", "center", "right"],
      default: "left",
      group: "Layout",
      allowInherit: true,
    },
    {
      name: "marginTop",
      displayName: "Margin Top",
      type: "string", // now string for CSS units
      default: "0px",
      group: "Layout",
      allowInherit: true,
    },
    {
      name: "marginBottom",
      displayName: "Margin Bottom",
      type: "string",
      default: "0px",
      group: "Layout",
      allowInherit: true,
    },
    {
      name: "paddingLeft",
      displayName: "Padding Left",
      type: "string",
      default: "0px",
      group: "Layout",
      allowInherit: true,
    },
    {
      name: "paddingRight",
      displayName: "Padding Right",
      type: "string",
      default: "0px",
      group: "Layout",
      allowInherit: true,
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

    // Content group
    {
      name: "content",
      displayName: "Heading Text",
      type: "string",
      default: "My Fancy Heading",
      group: "Content",
    },
  ],
} as const;
