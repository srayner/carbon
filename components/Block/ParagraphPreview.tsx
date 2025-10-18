"use client";

import React from "react";
import { ParagraphBlock } from "@/types/blocks";

type ParagraphEditableProps = {
  paragraph: ParagraphBlock;
};

const ParagraphEditable: React.FC<ParagraphEditableProps> = ({ paragraph }) => {
  console.log("Paragraph", paragraph);
  const { content } = paragraph;

  return <p>{content}</p>;
};

export default ParagraphEditable;
