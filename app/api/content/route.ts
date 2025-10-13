import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { parseQueryParams } from "@/lib/api/query";
import { createContent, listContent } from "@/services/content";

export const GET = withErrorHandling(async (req: NextRequest) => {
  const url = new URL(req.url);
  const { search, pagination, ordering } = parseQueryParams(url);

  return await listContent(search, pagination, ordering);
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const post = await createContent(data);
    return NextResponse.json(post, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/posts error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
