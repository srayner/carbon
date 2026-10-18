import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { getPage, deletePage, upsertPage } from "@/services/pages";
import { AppError } from "@/lib/api/error";
import { requireAdmin } from "@/lib/api/require-admin";

export const GET = withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id: pageId } = await params;
    const page = await getPage(pageId);

    if (!page) {
      throw new AppError(`Page with id ${pageId} not found`, 404);
    }

    return { page };
  }
);

export const DELETE = withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    await requireAdmin();
    const { id: contentId } = await params;
    const deletedContent = await deletePage(contentId);

    return { content: deletedContent };
  }
);

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    await requireAdmin();
    const { id: pageId } = await params;
    const data = await req.json();

    const updatedPage = await upsertPage(pageId, data);

    return { page: updatedPage };
  }
);
