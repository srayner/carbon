"use client";

import React, { useEffect, useState } from "react";
import type { Editor } from "@tiptap/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Level = 1 | 2 | 3 | 4 | 5 | 6;
type Props = {
  editor: Editor | null;
  maxLevel?: Level;
};

export default function TiptapHeadingDropdown({ editor, maxLevel = 3 }: Props) {
  const [value, setValue] = useState("0");

  useEffect(() => {
    if (!editor) return;

    const update = () => {
      if (editor.isActive("paragraph")) return setValue("0");

      for (let level = 1; level <= maxLevel; level++) {
        if (editor.isActive("heading", { level }))
          return setValue(String(level));
      }

      setValue("0");
    };

    // initial value
    update();

    // subscribe to updates
    editor.on("selectionUpdate", update);
    editor.on("transaction", update);

    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
    };
  }, [editor, maxLevel]);

  function onChange(val: string) {
    if (!editor) return;

    const level = parseInt(val, 10);
    editor.chain().focus();

    if (level === 0) editor.chain().focus().setParagraph().run();
    else
      editor
        .chain()
        .focus()
        .toggleHeading({ level: level as Level })
        .run();
  }

  return (
    <Select onValueChange={onChange} value={value}>
      <SelectTrigger className="w-40">
        <SelectValue placeholder="Paragraph" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="0">Paragraph</SelectItem>
        {Array.from({ length: maxLevel }, (_, i) => i + 1).map((lvl) => (
          <SelectItem key={lvl} value={String(lvl)}>
            {`Heading ${lvl}`}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
