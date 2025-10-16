import React from "react";

interface HeadingBlock {
  id: string;
  type: "Heading";
  data: {
    content: string;
    level: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  };
}

interface HeadingPreviewProps {
  block: HeadingBlock;
}

export const isHeadingBlock = (block: any): block is HeadingBlock => {
  return block.type === "Heading" && block.data?.content !== undefined;
};

const HeadingPreview: React.FC<HeadingPreviewProps> = ({ block }) => {
  console.log(block.data);
  const { content, level } = block.data;

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
