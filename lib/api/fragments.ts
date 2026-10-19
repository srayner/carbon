import type { Fragment, FragmentSummary } from "@/types/entities";
import type { FragmentKind } from "@/types/templates";

const request = async (url: string, init?: RequestInit) => {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json" },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(body?.error || "Request failed");
  return body;
};

export const fetchFragments = async (
  kind?: FragmentKind
): Promise<FragmentSummary[]> =>
  (await request(`/api/fragments${kind ? `?kind=${kind}` : ""}`)).fragments;

export const fetchFragment = async (id: string): Promise<Fragment> =>
  (await request(`/api/fragments/${id}`)).fragment;

export const saveFragment = async (fragment: Fragment): Promise<Fragment> => {
  const body = await request(
    fragment.id ? `/api/fragments/${fragment.id}` : "/api/fragments",
    {
      method: fragment.id ? "PUT" : "POST",
      body: JSON.stringify(fragment),
    }
  );
  return body.fragment;
};

export const deleteFragment = (id: string, detach: boolean) =>
  request(`/api/fragments/${id}${detach ? "?detach=1" : ""}`, {
    method: "DELETE",
  });
