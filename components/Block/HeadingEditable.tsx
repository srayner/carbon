"use client";

import React, { useRef } from "react";
import { EditableProps } from "@/types/blocks";
import Tiptap, { TiptapHandle } from "@/components/ui/TipTap";

const HeadingEditable = ({ block, onChange }: EditableProps<"Heading">) => {
  const { content } = block.properties;
  const tiptapRef = useRef<TiptapHandle | null>(null);

  const handleBlur = (content: string) => {
    const rawText = content.replace(/<[^>]*>/g, "");
    onChange({ content: rawText });
  };

  // TipTap expects HTML, wrap plain text content in <p> tag
  const htmlContent = `<p>${content || ''}</p>`;

  return (
    <Tiptap
      ref={tiptapRef}
      showMenu={false}
      onBlur={handleBlur}
      initialContent={htmlContent}
    />
  );
};

export default HeadingEditable;
