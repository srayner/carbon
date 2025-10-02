"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Hello World! 🌎️</p>",
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
  });

  return (
    <div>
      <div style={{ marginBottom: "0.5rem" }}>
        <button
          onClick={() => editor?.chain().focus().toggleBold().run()}
          disabled={!editor?.can().toggleBold()}
        >
          Bold
        </button>
        <button
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          disabled={!editor?.can().toggleItalic()}
        >
          Italic
        </button>
        <button
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          disabled={!editor?.can().toggleHeading({ level: 2 })}
        >
          H2
        </button>
      </div>
      <EditorContent editor={editor} />;
    </div>
  );
};

export default Tiptap;
