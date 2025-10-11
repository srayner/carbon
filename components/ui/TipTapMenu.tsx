"use client";

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
} from "lucide-react";
import type { Editor } from "@tiptap/react";
import TiptapHeadingDropdown from "./TipTapHeadingDropdown";

type TiptapMenuProps = {
  editor: Editor;
};

const TiptapMenu = ({ editor }: TiptapMenuProps) => {
  return (
    <div className="flex gap-2 my-4">
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
    </div>
  );
};

export default TiptapMenu;
