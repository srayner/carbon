import type { Template } from "@/types/entities";

const request = async (url: string, init?: RequestInit) => {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || "Request failed");
  return body;
};

export const fetchTemplates = async (): Promise<Template[]> =>
  (await request("/api/templates")).templates;

export const fetchTemplate = async (id: string): Promise<Template> =>
  (await request(`/api/templates/${id}`)).template;

export const createTemplate = (data: {
  name: string;
  description: string | null;
  basedOnId: string;
}) => request("/api/templates", { method: "POST", body: JSON.stringify(data) });

export const updateTemplate = (
  id: string,
  data: {
    name: string;
    description: string | null;
    slots: Record<string, string | null>;
  }
) =>
  request(`/api/templates/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const deleteTemplate = (id: string) =>
  request(`/api/templates/${id}`, { method: "DELETE" });
