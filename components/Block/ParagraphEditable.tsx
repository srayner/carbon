"use client";

import React from "react";
import { EditableProps } from "@/types/blocks";
import Tiptap from "@/components/ui/TipTap";

// A paragraph is plain text: no menu, and the editor reports text, not HTML
const ParagraphEditable = ({ block, onChange }: EditableProps<"Paragraph">) => (
  <Tiptap
    format="text"
    showMenu={false}
    initialValue={block.properties.content ?? ""}
    onChange={(content) => onChange({ content })}
  />
);

export default ParagraphEditable;
