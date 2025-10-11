"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapMenu from "./TipTapMenu";
import TextAlign from "@tiptap/extension-text-align";

const Tiptap = () => {
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
  });

  if (!editor) return null;

  return (
    <div>
      <TiptapMenu editor={editor} />
      <EditorContent editor={editor} className="prose prose-sm" />
    </div>
  );
};

export default Tiptap;
