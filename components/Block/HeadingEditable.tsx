"use client";

import React, { useRef } from "react";
import { HeadingBlock } from "@/types/blocks";
import Tiptap, { TiptapHandle } from "@/components/ui/TipTap";

type ParagraphEditableProps = {
  heading: HeadingBlock;
  onUpdate: (blockId: string, content: string) => void;
};

const HeadingEditable: React.FC<ParagraphEditableProps> = ({
  heading,
  onUpdate,
}) => {
  const { content } = heading.properties;
  const tiptapRef = useRef<TiptapHandle | null>(null);

  const handleBlur = (content: string) => {
    const rawText = content.replace(/<[^>]*>/g, "");
    onUpdate(heading.id, rawText);
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
