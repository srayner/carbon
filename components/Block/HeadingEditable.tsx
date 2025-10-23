"use client";

import React, { useEffect, useRef, useState } from "react";
import { HeadingBlock } from "@/types/blocks";

interface HeadingEditableProps {
  block: HeadingBlock;
  onUpdate: (blockId: string, content: string) => void;
}

const HeadingEditable: React.FC<HeadingEditableProps> = ({
  block,
  onUpdate,
}) => {
  const { id, properties } = block;
  const { content, level } = properties;
  const ref = useRef<HTMLHeadingElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Sync external content only when not focused
  useEffect(() => {
    if (!isFocused && ref.current && ref.current.innerText !== content) {
      ref.current.innerText = content;
    }
  }, [content, isFocused]);

  // Periodically push updates while focused
  useEffect(() => {
    if (!isFocused) return;

    const interval = setInterval(() => {
      if (ref.current) {
        onUpdate(id, ref.current.innerText);
      }
    }, 300); // adjust interval as needed

    return () => clearInterval(interval);
  }, [isFocused, id, onUpdate]);

  const handleFocus = () => setIsFocused(true);
  const handleBlur = () => {
    setIsFocused(false);
    if (ref.current) onUpdate(id, ref.current.innerText);
  };

  const HeadingTag = (level as keyof JSX.IntrinsicElements) || "h1";

  return (
    <HeadingTag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onFocus={handleFocus}
      onBlur={handleBlur}
      className="outline-none"
    >
      {content}
    </HeadingTag>
  );
};

export default HeadingEditable;
