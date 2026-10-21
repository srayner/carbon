import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { requireAdmin } from "@/lib/api/require-admin";
import { getTheme, saveTheme } from "@/services/theme";

export const GET = withErrorHandling(async () => {
  await requireAdmin();
  return { theme: await getTheme() };
});

export const PUT = withErrorHandling(async (req: NextRequest) => {
  await requireAdmin();
  const data = await req.json();
  return { theme: await saveTheme(data) };
});
