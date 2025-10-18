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
  const { content } = paragraph;
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

  return <Tiptap ref={tiptapRef} showMenu={false} onBlur={handleBlur} />;
};

export default ParagraphEditable;
