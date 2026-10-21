import React from "react";
import type { CSSProperties } from "react";
import { ViewProps } from "@/types/blocks";

// A single card, used by both the editing area and the public renderer
const CardView = ({
  block,
  style,
}: Pick<ViewProps<"Card">, "block"> & { style?: CSSProperties }) => {
  const { title, image, alt, description, linkUrl, linkLabel, className, cssId } =
    block.properties;

  return (
    <div
      id={cssId || undefined}
      style={style}
      className={`not-prose flex flex-col overflow-hidden rounded-site-l border bg-site-surface ${
        className ?? ""
      }`}
    >
      {image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt={alt ?? ""}
          className="aspect-video w-full object-cover"
        />
      )}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-site-muted">{description}</p>
        )}
        {linkUrl && (
          <a href={linkUrl} className="mt-auto pt-2 text-sm font-medium underline">
            {linkLabel || "Read more"} →
          </a>
        )}
      </div>
    </div>
  );
};

export default CardView;
