export type UploadedFile = {
  url: string;
  name: string;
  size: number;
  isImage: boolean;
};

export const uploadFile = async (file: File): Promise<UploadedFile> => {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch("/api/upload", { method: "POST", body: form });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error || "Upload failed");
  }

  return res.json();
};
