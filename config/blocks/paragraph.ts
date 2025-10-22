import { Pilcrow } from "lucide-react";

export const ParagraphBlockConfig = {
  name: "Paragraph",
  icon: Pilcrow,
  properties: [
    // Appearance group
    {
      name: "fontFamily",
      displayName: "Font Family",
      type: "string",
      default: "inherit",
      group: "Appearance",
      allowInherit: true,
    },
    {
      name: "fontSize",
      displayName: "Font Size",
      type: "string",
      default: "1rem",
      group: "Appearance",
      allowInherit: true,
    },
    {
      name: "fontWeight",
      displayName: "Font Weight",
      type: "enum",
      values: ["normal", "bold", "lighter", "bolder"],
      default: "normal",
      group: "Appearance",
      allowInherit: true,
    },
    {
      name: "lineHeight",
      displayName: "Line Height",
      type: "string",
      default: "1.6",
      group: "Appearance",
      allowInherit: true,
    },
    {
      name: "color",
      displayName: "Text Color",
      type: "color",
      default: "#000000",
      group: "Appearance",
      allowInherit: true,
    },
    {
      name: "backgroundColor",
      displayName: "Background Color",
      type: "color",
      default: "transparent",
      group: "Appearance",
      allowInherit: true,
    },
    {
      name: "textAlign",
      displayName: "Text Alignment",
      type: "enum",
      values: ["left", "center", "right", "justify"],
      default: "left",
      group: "Appearance",
      allowInherit: true,
    },

    // Layout group
    {
      name: "marginTop",
      displayName: "Margin Top",
      type: "string",
      default: "0px",
      group: "Layout",
      allowInherit: true,
    },
    {
      name: "marginBottom",
      displayName: "Margin Bottom",
      type: "string",
      default: "1rem",
      group: "Layout",
      allowInherit: true,
    },
    {
      name: "padding",
      displayName: "Padding",
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

    // Content
    {
      name: "content",
      displayName: "Text Content",
      type: "string",
      default:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus luctus urna sed urna ultricies ac tempor dui sagittis.",
      group: "Content",
    },
  ],
} as const;
