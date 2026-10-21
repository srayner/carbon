import { ViewProps } from "@/types/blocks";

const FileView = ({ block, shared }: ViewProps<"File">) => {
  const { file, label, description } = block.properties;
  if (!file) return null;
  return (
    <p {...shared}>
      <a
        href={file}
        download
        className="not-prose inline-flex flex-col rounded border px-4 py-3 no-underline hover:bg-muted"
      >
        <span className="font-medium">⬇ {label || "Download"}</span>
        {description && (
          <span className="text-sm text-muted-foreground">{description}</span>
        )}
      </a>
    </p>
  );
};

export default FileView;
