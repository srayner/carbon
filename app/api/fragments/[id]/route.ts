import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { requireAdmin } from "@/lib/api/require-admin";
import {
  deleteFragment,
  getFragment,
  updateFragment,
} from "@/services/fragments";

type Context = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  async (req: NextRequest, { params }: Context) => {
    await requireAdmin();
    const { id } = await params;
    return { fragment: await getFragment(id) };
  }
);

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: Context) => {
    await requireAdmin();
    const { id } = await params;
    const data = await req.json();
    return { fragment: await updateFragment(id, data) };
  }
);

// Responds 409 while templates use the fragment, unless called with ?detach=1
export const DELETE = withErrorHandling(
  async (req: NextRequest, { params }: Context) => {
    await requireAdmin();
    const { id } = await params;
    const detach = new URL(req.url).searchParams.get("detach") === "1";
    return { fragment: await deleteFragment(id, detach) };
  }
);
