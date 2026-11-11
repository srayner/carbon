"use client";

import React from "react";
import { EditableProps } from "@/types/blocks";
import Tiptap from "@/components/ui/TipTap";
import { getTokenStyle } from "@/lib/block-tokens";

const RichTextEditable = ({ block, onChange }: EditableProps<"RichText">) => (
  // The block's theme settings (text size, colour, spacing...) as on the site
  <div style={getTokenStyle(block.properties)}>
    <Tiptap
      format="html"
      initialValue={block.properties.content ?? ""}
      onChange={(content) => onChange({ content })}
    />
  </div>
);

export default RichTextEditable;
