import type { Category } from "@/types/entities";

export type CategoryFormData = {
  name: string;
  description: string | null;
  parentId: string | null;
  isActive: boolean;
};

const request = async (url: string, init?: RequestInit) => {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || "Request failed");
  return body;
};

export const fetchCategories = async (): Promise<Category[]> =>
  (await request("/api/categories")).categories;

export const createCategory = (data: CategoryFormData) =>
  request("/api/categories", { method: "POST", body: JSON.stringify(data) });

export const updateCategory = (id: string, data: CategoryFormData) =>
  request(`/api/categories/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const moveCategory = (id: string, direction: -1 | 1) =>
  request(`/api/categories/${id}/move`, {
    method: "POST",
    body: JSON.stringify({ direction }),
  });

export const deleteCategory = (id: string, detach: boolean) =>
  request(`/api/categories/${id}${detach ? "?detach=1" : ""}`, {
    method: "DELETE",
  });
