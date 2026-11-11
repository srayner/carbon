"use client";

import React from "react";
import { EditableProps } from "@/types/blocks";
import Tiptap from "@/components/ui/TipTap";

// A heading is plain text: no menu, and the editor reports text, not HTML
const HeadingEditable = ({ block, onChange }: EditableProps<"Heading">) => (
  <Tiptap
    format="text"
    showMenu={false}
    initialValue={block.properties.content ?? ""}
    onChange={(content) => onChange({ content })}
  />
);

export default HeadingEditable;
