"use client";

import React from "react";
import { HeadingBlock, Block } from "@/types/blocks";

/** Type guard to check if a block is a HeadingBlock */
export const isHeadingBlock = (block: Block): block is HeadingBlock =>
  block.type === "Heading";

/** Props for the component */
interface HeadingPreviewProps {
  block: HeadingBlock;
}

/** Component */
const HeadingPreview: React.FC<HeadingPreviewProps> = ({ block }) => {
  const { content, level } = block.properties;

  switch (level) {
    case "h1":
      return <h1>{content}</h1>;
    case "h2":
      return <h2>{content}</h2>;
    case "h3":
      return <h3>{content}</h3>;
    case "h4":
      return <h4>{content}</h4>;
    case "h5":
      return <h5>{content}</h5>;
    case "h6":
      return <h6>{content}</h6>;
    default:
      return <h1>{content}</h1>;
  }
};

export default HeadingPreview;
