"use client";

import { useRef, useState } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapMenu from "./TipTapMenu";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import { TextColorMark } from "@/lib/tiptap-text-color";
import { plainTextToHtml } from "@/lib/editor-text";

interface TiptapProps {
  // What the block stores: rich text as HTML, or plain text (Heading, Paragraph)
  format: "html" | "text";
  // The stored value; read once, when the editor is created
  initialValue: string;
  // Called after every edit with the value in the same format, so the page
  // knows about changes while the user is still typing
  onChange: (value: string) => void;
  showMenu?: boolean;
}

const Tiptap = ({ format, initialValue, onChange, showMenu = true }: TiptapProps) => {
  const read = (editor: Editor) =>
    format === "text" ? editor.getText({ blockSeparator: " " }) : editor.getHTML();

  // The stored value as it was when the editor was created; the prop follows
  // the edits after that
  const [stored] = useState(initialValue);

  // Tiptap compares these options by identity on every render and resets the
  // view when they differ. Edits re-render the page, so they are made once.
  const [options] = useState(() => ({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        link: { openOnClick: false },
      }),
      Image,
      TableKit,
      TextColorMark,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
    ],
    content: format === "text" ? plainTextToHtml(stored) : stored || "<p></p>",
    editorProps: {
      attributes: {
        class: "p-2",
      },
    },
  }));

  // The editor's own version of the stored value. The editor tidies what it
  // loads (e.g. it adds an empty paragraph after a final table), so its value
  // can differ from the stored one with nothing changed. While it matches
  // this, the stored value is reported unchanged: an edit that is undone, or
  // deleted again, leaves the page with nothing to save.
  const loaded = useRef<string | null>(null);
  const edited = useRef(false);

  const editor = useEditor({
    ...options,
    immediatelyRender: false,
    onCreate: ({ editor }) => {
      loaded.current = read(editor);
    },
    onUpdate: ({ editor, transaction }) => {
      const value = read(editor);
      // The tidying arrives as an update whose own transaction changed
      // nothing; only the editor's plugins added to it. Until the user edits,
      // that is part of loading, not a change.
      if (!transaction.docChanged) {
        if (!edited.current) loaded.current = value;
        return;
      }
      edited.current = true;
      onChange(value === loaded.current ? stored : value);
    },
  });

  if (!editor) return null;

  return (
    <div>
      {showMenu && <TiptapMenu editor={editor} />}
      {/* The text takes its size from the block, as on the site */}
      <EditorContent
        editor={editor}
        className="prose w-full max-w-none"
        style={{ fontSize: "inherit" }}
      />
    </div>
  );
};

export default Tiptap;
