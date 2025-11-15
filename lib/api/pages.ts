import { Page } from "@/types/entities";
import { Block } from "@/types/blocks";

/**
 * Transform API response to properly typed Page object.
 * Converts date strings to Date objects and casts blocks to Block[].
 */
function transformPageFromAPI(pageData: Record<string, unknown>): Page {
  const { blocks = [], publishedAt, createdAt, updatedAt, ...rest } = pageData;

  return {
    ...rest,
    publishedAt: publishedAt ? new Date(publishedAt as string) : null,
    createdAt: new Date(createdAt as string),
    updatedAt: new Date(updatedAt as string),
    blocks: (blocks as Array<Record<string, unknown>>).map((block) => ({
      ...block,
      ...(block.createdAt && { createdAt: new Date(block.createdAt as string) }),
      ...(block.updatedAt && { updatedAt: new Date(block.updatedAt as string) }),
    })) as Block[],
  } as Page;
}

// Load a page by ID
export const fetchPage = async (pageId: string): Promise<Page> => {
  const res = await fetch(`/api/pages/${pageId}`);
  if (!res.ok) throw new Error("Failed to fetch page");
  const data = await res.json();

  // Transform API response: cast blocks to Block[] and convert date strings to Date objects
  return transformPageFromAPI(data.page);
};

// Save a new page (POST) or update existing (PUT)
export const savePage = async (page: Page): Promise<Page> => {
  const method = page.id ? "PUT" : "POST";
  const url = page.id ? `/api/pages/${page.id}` : "/api/pages";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(page),
  });

  if (!res.ok) throw new Error("Failed to save page");
  const data = await res.json();

  // Transform API response: handle both { page: ... } and direct page response
  // POST returns page directly, PUT returns { page: ... }
  const pageData = data.page || data;
  return transformPageFromAPI(pageData);
};
