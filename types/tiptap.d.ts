import "@tiptap/core";
import { TextAlignOptions } from "@tiptap/extension-text-align";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    textAlign: {
      setTextAlign: (alignment: TextAlignOptions["align"]) => ReturnType;
      unsetTextAlign: () => ReturnType;
    };
  }
}
