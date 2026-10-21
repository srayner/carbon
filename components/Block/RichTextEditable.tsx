"use client";

import React, { useRef } from "react";
import { EditableProps } from "@/types/blocks";
import Tiptap, { TiptapHandle } from "@/components/ui/TipTap";

const RichTextEditable = ({ block, onChange }: EditableProps<"RichText">) => {
  const { content } = block.properties;
  const tiptapRef = useRef<TiptapHandle | null>(null);

  const handleBlur = (content: string) => {
    onChange({ content });
  };

  return (
    <Tiptap
      ref={tiptapRef}
      onBlur={handleBlur}
      initialContent={content}
    />
  );
};

export default RichTextEditable;
