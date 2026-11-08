"use client";

import React from "react";
import { EditableProps } from "@/types/blocks";
import { getContainerStyle, isInlineContainer } from "@/lib/container-style";

// Shows the container's layout on the canvas. Its children are drawn inside
// it by the block editor.
const ContainerEditable = ({
  block,
  children,
}: EditableProps<"Container"> & { children?: React.ReactNode }) => {
  const hasChildren = React.Children.count(children) > 0;

  // A span flows inline with its children, as on the site
  if (isInlineContainer(block.properties)) {
    return (
      <span className="rounded-sm outline-1 outline-dashed outline-current/30">
        {hasChildren ? children : <span className="text-sm opacity-60">Empty span</span>}
      </span>
    );
  }

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
