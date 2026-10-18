"use client";

import { useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListIcon,
  ListOrderedIcon,
  TextAlignEndIcon,
  TextAlignCenterIcon,
  TextAlignStartIcon,
  LinkIcon,
  ImageIcon,
  TableIcon,
} from "lucide-react";
import type { Editor } from "@tiptap/react";
import TiptapHeadingDropdown from "./TipTapHeadingDropdown";
import { uploadFile } from "@/lib/api/upload";

type TiptapMenuProps = {
  editor: Editor;
};

const TiptapMenu = ({ editor }: TiptapMenuProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleLink = () => {
    const previous = editor.getAttributes("link").href ?? "";
    const url = window.prompt("Link URL (leave empty to remove the link)", previous);
    if (url === null) return;

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
    }
  };

  const handleImageFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const uploaded = await uploadFile(file);
      if (!uploaded.isImage) {
        toast.error("That file is not an image.");
        return;
      }
      editor.chain().focus().setImage({ src: uploaded.url, alt: "" }).run();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const tableActions: [string, () => void][] = [
    ["+ Row", () => editor.chain().focus().addRowAfter().run()],
    ["+ Col", () => editor.chain().focus().addColumnAfter().run()],
    ["− Row", () => editor.chain().focus().deleteRow().run()],
    ["− Col", () => editor.chain().focus().deleteColumn().run()],
    ["Delete table", () => editor.chain().focus().deleteTable().run()],
  ];

  return (
    <div
      className="flex flex-wrap gap-2 my-4"
      // Keep focus (and the text selection) in the editor when a toolbar
      // button is clicked, otherwise the editor blurs and resets first
      onMouseDown={(e) => e.preventDefault()}
    >
      <TiptapHeadingDropdown editor={editor} />
      <ButtonGroup className="hidden sm:flex">
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <BoldIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <ItalicIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon />
        </Button>
      </ButtonGroup>

      <ButtonGroup className="hidden sm:flex">
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <ListIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrderedIcon />
        </Button>
      </ButtonGroup>

      <ButtonGroup className="hidden sm:flex">
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <TextAlignStartIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <TextAlignCenterIcon />
        </Button>

        <Button
          variant="outline"
          size="icon"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <TextAlignEndIcon />
        </Button>
      </ButtonGroup>

      <ButtonGroup className="hidden sm:flex">
        <Button
          variant="outline"
          size="icon"
          aria-label="Link"
          className={editor.isActive("link") ? "bg-accent" : ""}
          onClick={handleLink}
        >
          <LinkIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Insert image"
          onClick={() => imageInputRef.current?.click()}
        >
          <ImageIcon />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Insert table"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <TableIcon />
        </Button>
      </ButtonGroup>
      <input
        ref={imageInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.gif,.webp"
        className="hidden"
        onChange={(e) => handleImageFile(e.target.files?.[0])}
      />

      {editor.isActive("table") && (
        <ButtonGroup className="hidden sm:flex">
          {tableActions.map(([label, action]) => (
            <Button key={label} variant="outline" size="sm" onClick={action}>
              {label}
            </Button>
          ))}
        </ButtonGroup>
      )}
    </div>
  );
};

export default TiptapMenu;
