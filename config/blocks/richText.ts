import { LayoutList } from "lucide-react";

export const RichTextBlockConfig = {
  name: "RichText",
  icon: LayoutList,
  properties: [
    // Appearance group
    {
      name: "backgroundColor",
      displayName: "Background Color",
      type: "color",
      default: "transparent",
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
