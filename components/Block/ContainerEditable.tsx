"use client";

import React from "react";
import { EditableProps } from "@/types/blocks";
import { getContainerStyle } from "@/lib/container-style";

// Shows the container's layout on the canvas. Its children are drawn inside
// it by the block editor.
const ContainerEditable = ({
  block,
  children,
}: EditableProps<"Container"> & { children?: React.ReactNode }) => {
  const hasChildren = React.Children.count(children) > 0;
  return (
    <div
      className="block-container min-h-12 rounded-sm border border-dashed border-current/30 p-2"
      style={getContainerStyle(block.properties)}
    >
      {hasChildren ? (
        children
      ) : (
        <p className="m-0 self-center text-sm opacity-60">Empty container</p>
      )}
    </div>
  );
};

export default ContainerEditable;
