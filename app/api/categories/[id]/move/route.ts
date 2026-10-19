import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { AppError } from "@/lib/api/error";
import { requireAdmin } from "@/lib/api/require-admin";
import { moveCategory } from "@/services/categories";

export const POST = withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    await requireAdmin();
    const { id } = await params;
    const { direction } = await req.json();

    if (direction !== -1 && direction !== 1) {
      throw new AppError("direction must be -1 or 1.", 400);
    }

    await moveCategory(id, direction);
    return { ok: true };
  }
);
