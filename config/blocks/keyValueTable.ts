import { Table2 } from "lucide-react";
import { SHARED_PROPERTIES } from "./shared";

// A list of facts, such as a project's specifications. The rows are edited on
// the canvas and saved as a JSON string (see lib/key-value-rows.ts).
export const KeyValueTableBlockConfig = {
  name: "KeyValueTable",
  icon: Table2,
  properties: [
    // Content group
    {
      name: "rows",
      displayName: "Rows",
      type: "string",
      default: JSON.stringify([
        { key: "Key", value: "Value" },
        { key: "Another key", value: "Another value" },
      ]),
      group: "Content",
    },

    // Appearance group
    {
      name: "keyWidth",
      displayName: "Key Column Width",
      type: "enum",
      values: ["1/4", "1/3", "1/2"],
      default: "1/3",
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

    // Theme tokens, the same for every block
    ...SHARED_PROPERTIES,
  ],
} as const;
