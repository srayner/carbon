"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapMenu from "./TipTapMenu";
import TextAlign from "@tiptap/extension-text-align";
import { forwardRef, useImperativeHandle } from "react";

export interface TiptapHandle {
  getHTML: () => string;
  clearContent: () => void;
  setContent: (html: string) => void;
}

interface TiptapProps {
  showMenu?: boolean;
  onBlur?: (html: string) => void;
}

const Tiptap = forwardRef<TiptapHandle, TiptapProps>(
  ({ showMenu = true, onBlur }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
        }),
        TextAlign.configure({
          types: ["heading", "paragraph"],
        }),
      ],
      content: "<p>Hello World!</p>",
      immediatelyRender: false,
      editorProps: {
        attributes: {
          class: "p-2",
        },
      },
      onBlur: () => {
        if (onBlur) onBlur(editor?.getHTML() || "");
      },
    });

    useImperativeHandle(ref, () => ({
      getHTML: () => editor?.getHTML() || "",
      clearContent: () => editor?.commands.clearContent(),
      setContent: (html: string) => editor?.commands.setContent(html),
    }));

    if (!editor) return null;

    return (
      <div>
        {showMenu && <TiptapMenu editor={editor} />}
        <EditorContent
          editor={editor}
          className="prose prose-sm w-full max-w-none"
        />
      </div>
    );
  }
);

Tiptap.displayName = "Tiptap";

export default Tiptap;
