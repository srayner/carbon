import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { requireAdmin } from "@/lib/api/require-admin";
import { createCategory, listCategories } from "@/services/categories";

export const GET = withErrorHandling(async () => {
  await requireAdmin();
  return { categories: await listCategories() };
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  await requireAdmin();
  const data = await req.json();
  const category = await createCategory(data);

  return { status: 201, category };
});
