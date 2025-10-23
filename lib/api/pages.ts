import { Page } from "@/types/entities";

// Load a page by ID
export const fetchPage = async (pageId: string): Promise<Page> => {
  const res = await fetch(`/api/pages/${pageId}`);
  if (!res.ok) throw new Error("Failed to fetch page");
  const data = await res.json();
  return data.page;
};

// Save a new page (POST) or update existing (PUT)
export const savePage = async (
  page: Partial<Page> & { id?: string }
): Promise<Page> => {
  const method = page.id ? "PUT" : "POST";
  const url = page.id ? `/api/pages/${page.id}` : "/api/pages";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(page),
  });

  if (!res.ok) throw new Error("Failed to save page");
  return res.json(); // returns full Page object
};
