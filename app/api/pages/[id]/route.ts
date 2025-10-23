import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { getPage, deleteContent, upsertPage } from "@/services/pages";
import { AppError } from "@/lib/api/error";

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
    const { id: contentId } = await params;
    const deletedContent = await deleteContent(contentId);

    return { content: deletedContent };
  }
);

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id: contentId } = await params;
    const data = await req.json();

    const updatedContent = await updateContent(contentId, data);

    return { cost: updatedContent };
  }
);
