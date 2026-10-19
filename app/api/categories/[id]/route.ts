import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { requireAdmin } from "@/lib/api/require-admin";
import {
  deleteCategory,
  getCategory,
  updateCategory,
} from "@/services/categories";

type Context = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  async (req: NextRequest, { params }: Context) => {
    await requireAdmin();
    const { id } = await params;
    return { category: await getCategory(id) };
  }
);

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: Context) => {
    await requireAdmin();
    const { id } = await params;
    const data = await req.json();
    return { category: await updateCategory(id, data) };
  }
);

// Responds 409 while the category is in use, unless called with ?detach=1
export const DELETE = withErrorHandling(
  async (req: NextRequest, { params }: Context) => {
    await requireAdmin();
    const { id } = await params;
    const detach = new URL(req.url).searchParams.get("detach") === "1";
    return { category: await deleteCategory(id, detach) };
  }
);
