import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { AppError, handleAppError } from "@/lib/api/error";
import { requireAdmin } from "@/lib/api/require-admin";
import { parseQueryParams } from "@/lib/api/query";
import { upsertPage, listPages } from "@/services/pages";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const url = new URL(req.url);
  const { search, pagination, ordering } = parseQueryParams(url);

  return await listPages(search, pagination, ordering);
});

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const data = await req.json();
    const page = await upsertPage(null, data);
    return NextResponse.json(page, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof AppError) return handleAppError(err);
    console.error("POST /api/pages error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
