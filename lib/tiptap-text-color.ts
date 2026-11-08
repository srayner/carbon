import { Mark } from "@tiptap/core";
import { TEXT_COLORS, TextColor, textColorClass, textColorOf } from "@/lib/text-colors";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textColor: {
      /** Colours the selection with a theme colour. */
      setTextColor: (color: TextColor) => ReturnType;
      /** Puts the selection back to the normal text colour. */
      unsetTextColor: () => ReturnType;
    };
  }
}

/**
 * A theme colour on some words, saved as <span class="site-text-accent">.
 * Only the colours in TEXT_COLORS are read back from saved HTML.
 */
export const TextColorMark = Mark.create({
  name: "textColor",

  addAttributes() {
    return {
      color: {
        default: null,
        parseHTML: (element) => textColorOf(element.getAttribute("class")),
        renderHTML: (attributes) =>
          TEXT_COLORS.includes(attributes.color)
            ? { class: textColorClass(attributes.color) }
            : {},
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[class]",
        getAttrs: (element) => (textColorOf(element.getAttribute("class")) ? null : false),
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["span", HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setTextColor:
        (color) =>
        ({ commands }) =>
          commands.setMark(this.name, { color }),
      unsetTextColor:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
    };
  },
});
