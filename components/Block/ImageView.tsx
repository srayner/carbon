import { ViewProps } from "@/types/blocks";

const ImageView = ({ block, shared }: ViewProps<"Image">) => {
  const {
    src,
    alt,
    caption,
    width,
    height,
    objectFit,
    alignment,
    borderRadius,
    filter,
  } = block.properties;
  if (!src) return null;
  return (
    <figure
      {...shared}
      style={{ ...shared.style, textAlign: alignment || "center" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? ""}
        style={{
          display: "inline-block",
          width: width || "100%",
          height: height || "auto",
          objectFit: objectFit || "cover",
          borderRadius: borderRadius || undefined,
          filter: filter || undefined,
          margin: 0,
        }}
      />
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
};

export default ImageView;
