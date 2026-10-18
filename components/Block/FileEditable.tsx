import React from "react";
import { FileDown } from "lucide-react";
import { FileBlock } from "@/types/blocks";

type FileEditableProps = {
  file: FileBlock;
};

// Preview of a file block in the editing area. The file is chosen in the
// block's properties panel, so this is display only.
const FileEditable: React.FC<FileEditableProps> = ({ file }) => {
  const { file: url, label, description } = file.properties;

  if (!url) {
    return (
      <div className="my-2 rounded border-2 border-dashed p-6 text-center text-sm text-muted-foreground">
        No file yet. Select this block and upload one in the Block tab.
      </div>
    );
  }

  return (
    <div className="not-prose my-2 flex items-center gap-3 rounded border p-3">
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
