"use client";

import React from "react";
import { ParagraphBlock } from "@/types/blocks";

type ParagraphEditableProps = {
  paragraph: ParagraphBlock;
};

const ParagraphEditable: React.FC<ParagraphEditableProps> = ({ paragraph }) => {
  const { content } = paragraph.properties;

  return <p>{content}</p>;
};

export default ParagraphEditable;
