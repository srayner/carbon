"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { List, ListOrdered } from "lucide-react";

const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] prose prose-sm prose-li:list-disc prose-ol:list-decimal outline-none",
      },
    },
    content: "<p>Hello World!</p><p>Some starter text.</p>",
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
  });

  if (!editor) return null;

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <div className="bg-gray-100 p-2">
        <ButtonGroup>
          <Button
            variant={editor?.isActive("bold") ? "default" : "outline"}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            B
          </Button>
          <Button
            variant={editor?.isActive("italic") ? "default" : "outline"}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            disabled={!editor?.can().toggleBold()}
          >
            I
          </Button>
          <Button
            variant={editor?.isActive("strike") ? "default" : "outline"}
            onClick={() => editor?.chain().focus().toggleStrike().run()}
            disabled={!editor?.can().toggleItalic()}
          >
            S
          </Button>
        </ButtonGroup>
        <ButtonGroup>
          <Button
            variant={editor?.isActive("bulletList") ? "default" : "outline"}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            <List size={16} />
          </Button>
          <Button
            variant={editor?.isActive("orderedList") ? "default" : "outline"}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered size={16} />
          </Button>
        </ButtonGroup>
      </div>
      <div className="p-2">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Tiptap;
