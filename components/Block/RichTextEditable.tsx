"use client";

import React, { useEffect, useRef } from "react";
import { RichTextBlock } from "@/types/blocks";
import Tiptap, { TiptapHandle } from "@/components/ui/TipTap";

type RichTextEditableProps = {
  richText: RichTextBlock;
  onUpdate: (blockId: string, content: string) => void;
};

const RichTextEditable: React.FC<RichTextEditableProps> = ({
  richText,
  onUpdate,
}) => {
  const { content } = richText;
  const tiptapRef = useRef<TiptapHandle | null>(null);

  const handleBlur = (content: string) => {
    onUpdate(richText.id, content);
  };

  useEffect(() => {
    if (tiptapRef.current) {
      tiptapRef.current.setContent(content);
    }
  }, [content]);

  return <Tiptap ref={tiptapRef} onBlur={handleBlur} />;
};

export default RichTextEditable;
