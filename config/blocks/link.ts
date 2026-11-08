import { Link } from "lucide-react";
import { SHARED_PROPERTIES } from "./shared";

export const LINK_STYLES = ["plain", "button", "outline"] as const;
export const LINK_UNDERLINES = ["auto", "none", "hover", "always"] as const;

// A text link or a button. Style picks a look from the theme (see .site-link
// in globals.css); the theme tokens below override it. A menu is Links in a
// row Container.
export const LinkBlockConfig = {
  name: "Link",
  icon: Link,
  properties: [
    // Content group
    {
      name: "label",
      displayName: "Text",
      type: "string",
      default: "Link text",
      group: "Content",
    },
    {
      name: "url",
      displayName: "Link to",
      type: "url",
      default: "/",
      group: "Content",
    },
    {
      name: "newTab",
      displayName: "Open in a new tab",
      type: "boolean",
      default: "false",
      group: "Content",
    },

    // Appearance group
    {
      name: "style",
      displayName: "Style",
      type: "enum",
      values: LINK_STYLES,
      default: "plain",
      group: "Appearance",
    },
    {
      // "auto" follows the style: plain links underline on hover, buttons never
      name: "underline",
      displayName: "Underline",
      type: "enum",
      values: LINK_UNDERLINES,
      default: "auto",
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
