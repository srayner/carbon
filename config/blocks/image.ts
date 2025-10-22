import { Image } from "lucide-react";

export const ImageBlockConfig = {
  name: "Image",
  icon: Image,
  properties: [
    // Content group
    {
      name: "src",
      displayName: "Image Source",
      type: "string",
      default: "",
      group: "Content",
    },
    {
      name: "alt",
      displayName: "Alt Text",
      type: "string",
      default: "",
      group: "Content",
    },
    {
      name: "caption",
      displayName: "Caption",
      type: "string",
      default: "",
      group: "Content",
      allowInherit: true,
    },

    // Appearance group
    {
      name: "width",
      displayName: "Width",
      type: "string",
      default: "100%",
      group: "Appearance",
      allowInherit: true,
    },
    {
      name: "height",
      displayName: "Height",
      type: "string",
      default: "auto",
      group: "Appearance",
      allowInherit: true,
    },
    {
      name: "objectFit",
      displayName: "Object Fit",
      type: "enum",
      values: ["contain", "cover", "fill"],
      default: "cover",
      group: "Appearance",
      allowInherit: true,
    },
    {
      name: "borderRadius",
      displayName: "Border Radius",
      type: "string",
      default: "0px",
      group: "Appearance",
      allowInherit: true,
    },
    {
      name: "filter",
      displayName: "CSS Filter",
      type: "string",
      default: "",
      group: "Appearance",
      allowInherit: true,
    },

    // Layout group
    {
      name: "alignment",
      displayName: "Alignment",
      type: "enum",
      values: ["left", "center", "right"],
      default: "center",
      group: "Layout",
      allowInherit: true,
    },
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
      default: "0px",
      group: "Layout",
      allowInherit: true,
    },
    {
      name: "marginLeft",
      displayName: "Margin Left",
      type: "string",
      default: "0px",
      group: "Layout",
      allowInherit: true,
    },
    {
      name: "marginRight",
      displayName: "Margin Right",
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
  ],
} as const;
