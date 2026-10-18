"use client";

import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { uploadFile } from "@/lib/api/upload";

type UploadFieldProps = {
  kind: "image" | "file";
  value: string;
  onChange: (url: string) => void;
};

const UploadField: React.FC<UploadFieldProps> = ({ kind, value, onChange }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const uploaded = await uploadFile(file);
      onChange(uploaded.url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {kind === "image" && value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="max-h-32 w-full rounded border object-contain bg-white"
        />
      )}
      <input
        value={value}
        placeholder={kind === "image" ? "Image URL" : "File URL"}
        onChange={(e) => onChange(e.target.value)}
        className="border p-1 w-full"
      />
      <input
        ref={inputRef}
        type="file"
        accept={kind === "image" ? ".png,.jpg,.jpeg,.gif,.webp" : undefined}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
      >
        {uploading
          ? "Uploading…"
          : value
          ? "Replace…"
          : kind === "image"
          ? "Upload image…"
          : "Upload file…"}
      </button>
    </div>
  );
};

export default UploadField;
