import { LayoutGrid } from "lucide-react";
import { SHARED_PROPERTIES } from "./shared";

// Cards placed one after another are shown side by side in a grid
export const CardBlockConfig = {
  name: "Card",
  icon: LayoutGrid,
  properties: [
    // Content group
    {
      name: "title",
      displayName: "Title",
      type: "string",
      default: "Card title",
      group: "Content",
    },
    {
      name: "image",
      displayName: "Image",
      type: "image",
      default: "",
      group: "Content",
    },
    {
      name: "alt",
      displayName: "Image Alt Text",
      type: "string",
      default: "",
      group: "Content",
    },
    {
      name: "description",
      displayName: "Text",
      type: "richtext",
      default: "A short description.",
      group: "Content",
    },
    {
      name: "linkUrl",
      displayName: "Link URL",
      type: "string",
      default: "",
      group: "Content",
    },
    {
      name: "linkLabel",
      displayName: "Link Text",
      type: "string",
      default: "Read more",
      group: "Content",
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
