import { PageMetaInput } from "@/lib/schema/page-meta";

// Fetch metadata for a page
export async function getMeta(pageId: string): Promise<PageMetaInput | null> {
  const res = await fetch(`/api/pages/${pageId}/meta`);
  if (!res.ok) return null;
  return res.json();
}

// Save metadata for a page
export async function saveMeta(
  pageId: string,
  data: PageMetaInput
): Promise<void> {
  const res = await fetch(`/api/pages/${pageId}/meta`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error("Failed to save metadata");
  }
}
