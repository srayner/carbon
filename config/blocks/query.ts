import { ListFilter } from "lucide-react";

// Lists the published pages in a category, as cards or as plain links
export const QueryBlockConfig = {
  name: "Query",
  icon: ListFilter,
  properties: [
    // Content group
    {
      name: "category",
      displayName: "Category",
      type: "category",
      default: "",
      group: "Content",
    },
    {
      name: "includeSubcategories",
      displayName: "Include sub-categories",
      type: "boolean",
      default: "true",
      group: "Content",
    },
    {
      name: "orderBy",
      displayName: "Order",
      type: "enum",
      values: ["newest", "oldest", "title"],
      default: "newest",
      group: "Content",
    },
    {
      name: "limit",
      displayName: "Maximum pages",
      type: "string",
      default: "12",
      group: "Content",
    },

    // Appearance group
    {
      name: "display",
      displayName: "Display as",
      type: "enum",
      values: ["cards", "list"],
      default: "cards",
      group: "Appearance",
    },
    {
      name: "columns",
      displayName: "Columns (cards)",
      type: "enum",
      values: ["1", "2", "3", "4"],
      default: "3",
      group: "Appearance",
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
