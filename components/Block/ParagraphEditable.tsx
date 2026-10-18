"use client";

import React, { useEffect, useRef } from "react";
import { ParagraphBlock } from "@/types/blocks";
import Tiptap, { TiptapHandle } from "@/components/ui/TipTap";

type ParagraphEditableProps = {
  paragraph: ParagraphBlock;
  onUpdate: (blockId: string, content: string) => void;
};

const ParagraphEditable: React.FC<ParagraphEditableProps> = ({
  paragraph,
  onUpdate,
}) => {
  const { content } = paragraph.properties;
  const tiptapRef = useRef<TiptapHandle | null>(null);

  const handleBlur = (content: string) => {
    const rawText = content.replace(/<[^>]*>/g, "");
    onUpdate(paragraph.id, rawText);
  };

  useEffect(() => {
    if (tiptapRef.current) {
      tiptapRef.current.setContent(content);
    }
  }, [content]);

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
