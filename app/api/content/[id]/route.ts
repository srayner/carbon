import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { getContent, deleteContent, updateContent } from "@/services/content";
import { AppError } from "@/lib/api/error";

export const GET = withErrorHandling(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id: contentId } = await params;
    const content = await getContent(contentId);

    if (!content) {
      throw new AppError(`Content with id ${contentId} not found`, 404);
    }

    return { content };
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
