"use client";

import React, { useRef } from "react";
import { EditableProps } from "@/types/blocks";
import Tiptap, { TiptapHandle } from "@/components/ui/TipTap";

const ParagraphEditable = ({ block, onChange }: EditableProps<"Paragraph">) => {
  const { content } = block.properties;
  const tiptapRef = useRef<TiptapHandle | null>(null);

  const handleBlur = (content: string) => {
    const rawText = content.replace(/<[^>]*>/g, "");
    onChange({ content: rawText });
  };

  // TipTap expects HTML, so wrap the plain text content in a <p> tag
  const escaped = (content || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return (
    <Tiptap
      ref={tiptapRef}
      showMenu={false}
      onBlur={handleBlur}
      initialContent={`<p>${escaped}</p>`}
    />
  );
};

export default ParagraphEditable;
