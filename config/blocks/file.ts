import { FileDown } from "lucide-react";
import { SHARED_PROPERTIES } from "./shared";

export const FileBlockConfig = {
  name: "File",
  icon: FileDown,
  properties: [
    // Content group
    {
      name: "file",
      displayName: "File",
      type: "file",
      default: "",
      group: "Content",
    },
    {
      name: "label",
      displayName: "Link Text",
      type: "string",
      default: "Download",
      group: "Content",
    },
    {
      name: "description",
      displayName: "Description",
      type: "string",
      default: "",
      group: "Content",
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
