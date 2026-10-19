import { NextRequest } from "next/server";
import { withErrorHandling } from "@/lib/api/handler";
import { requireAdmin } from "@/lib/api/require-admin";
import {
  deleteTemplate,
  getTemplate,
  updateTemplate,
} from "@/services/templates";

type Context = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(
  async (req: NextRequest, { params }: Context) => {
    await requireAdmin();
    const { id } = await params;
    return { template: await getTemplate(id) };
  }
);

export const PUT = withErrorHandling(
  async (req: NextRequest, { params }: Context) => {
    await requireAdmin();
    const { id } = await params;
    const data = await req.json();
    return { template: await updateTemplate(id, data) };
  }
);

export const DELETE = withErrorHandling(
  async (req: NextRequest, { params }: Context) => {
    await requireAdmin();
    const { id } = await params;
    return { template: await deleteTemplate(id) };
  }
);
