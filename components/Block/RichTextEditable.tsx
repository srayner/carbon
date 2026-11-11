"use client";

import React, { useRef } from "react";
import { EditableProps } from "@/types/blocks";
import Tiptap, { TiptapHandle } from "@/components/ui/TipTap";
import { getTokenStyle } from "@/lib/block-tokens";

const RichTextEditable = ({ block, onChange }: EditableProps<"RichText">) => {
  const { content } = block.properties;
  const tiptapRef = useRef<TiptapHandle | null>(null);

  const handleChange = (content: string) => {
    onChange({ content });
  };

  // The block's theme settings (text size, colour, spacing...) as on the site
  return (
    <div style={getTokenStyle(block.properties)}>
      <Tiptap ref={tiptapRef} onChange={handleChange} initialContent={content} />
    </div>
  );
};

export default RichTextEditable;
