import { ViewProps } from "@/types/blocks";

const FileView = ({ block, shared }: ViewProps<"File">) => {
  const { file, label, description } = block.properties;
  if (!file) return null;

  // The visible box is the link, not the full-width row around it, so the
  // row keeps only the spacing and the link takes the rest of the style
  // (background, padding, border, ...)
  const { marginTop, marginBottom, ...box } = shared.style;

  return (
    <p
      id={shared.id}
      className={shared.className}
      style={{ marginTop, marginBottom }}
    >
      <a
        href={file}
        download
        style={box}
        className="not-prose inline-flex flex-col rounded-site-m border bg-site-surface px-4 py-3 no-underline hover:bg-site-border"
      >
        <span className="font-medium">⬇ {label || "Download"}</span>
        {description && (
          <span className="text-sm text-site-muted">{description}</span>
        )}
      </a>
    </p>
  );
};

export default FileView;
