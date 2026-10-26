import React from "react";
import { FileDown } from "lucide-react";
import { EditableProps } from "@/types/blocks";

// Preview of a file block in the editing area. The file is chosen in the
// block's properties panel, so this is display only.
const FileEditable = ({ block }: EditableProps<"File">) => {
  const { file: url, label, description } = block.properties;

  if (!url) {
    return (
      <div className="my-2 rounded-sm border-2 border-dashed p-6 text-center text-sm text-muted-foreground">
        No file yet. Select this block and upload one in the Block tab.
      </div>
    );
  }

  return (
    <div className="not-prose my-2 flex items-center gap-3 rounded-site-m border bg-site-surface p-3">
      <FileDown className="h-5 w-5 shrink-0" />
      <div>
        <div className="font-medium">{label || "Download"}</div>
        {description && (
          <div className="text-sm text-muted-foreground">{description}</div>
        )}
      </div>
    </div>
  );
};

export default FileEditable;
