import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { requireAdmin } from "@/lib/api/require-admin";
import { createTemplate, listTemplates } from "@/services/templates";

export const GET = withErrorHandling(async () => {
  await requireAdmin();
  return { templates: await listTemplates() };
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  await requireAdmin();
  const data = await req.json();
  const template = await createTemplate(data);

  return { status: 201, template };
});
