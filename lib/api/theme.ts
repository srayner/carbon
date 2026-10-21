import { request } from "@/lib/api/request";
import type { Theme } from "@/lib/theme";

export const fetchTheme = async (): Promise<Theme> =>
  (await request("/api/theme")).theme;

export const saveTheme = async (theme: Theme): Promise<Theme> =>
  (await request("/api/theme", { method: "PUT", body: JSON.stringify(theme) }))
    .theme;
