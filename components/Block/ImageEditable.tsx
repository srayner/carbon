import React from "react";
import { EditableProps } from "@/types/blocks";

// Preview of an image block in the editing area. Images are set from the
// block's properties panel, so this is display only.
const ImageEditable = ({ block }: EditableProps<"Image">) => {
  const { src, alt, caption, width, height, objectFit, alignment } =
    block.properties;

  if (!src) {
    return (
      <div className="my-2 rounded border-2 border-dashed p-6 text-center text-sm text-muted-foreground">
        No image yet. Select this block and upload one in the Block tab.
      </div>
    );
  }

  return (
    <figure style={{ textAlign: alignment || "center" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? ""}
        style={{
          display: "inline-block",
          width: width || "100%",
          height: height || "auto",
          objectFit: objectFit || "cover",
          margin: 0,
        }}
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
};

export default ImageEditable;
