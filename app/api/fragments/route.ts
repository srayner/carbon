import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { AppError } from "@/lib/api/error";
import { requireAdmin } from "@/lib/api/require-admin";
import { createFragment, listFragments } from "@/services/fragments";
import { FRAGMENT_KINDS, FragmentKind } from "@/types/templates";

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requireAdmin();

  const kind = new URL(req.url).searchParams.get("kind");
  if (kind && !FRAGMENT_KINDS.includes(kind as FragmentKind)) {
    throw new AppError("Unknown kind.", 400);
  }

  return { fragments: await listFragments((kind as FragmentKind) || undefined) };
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  await requireAdmin();
  const data = await req.json();
  const fragment = await createFragment(data);

  return { status: 201, fragment };
});
