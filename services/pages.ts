import { prisma } from "@/lib/prisma";
import { Block } from "@/types/blocks";
import { AppError } from "@/lib/api/error";
import { getSlugError } from "@/lib/slug";
import { setPageCategories } from "@/services/categories";
import { replaceBlocks } from "@/services/blocks";

type PageInput = {
  id?: string;
  title: string;
  slug: string;
  meta?: object;
  publishedAt?: string | null;
  blocks: Block[];
  categoryIds?: string[];
  templateId: string;
  summary?: string | null;
  image?: string | null;
};

const SUMMARY_MAX = 300;

export const upsertPage = async (pageId: string | null, data: PageInput) => {
  if (!data.title?.trim()) {
    throw new AppError("Title is required.", 400);
  }
  const slugError = getSlugError(data.slug);
  if (slugError) {
    throw new AppError(slugError, 400);
  }

  if (!data.templateId) {
    throw new AppError("Template is required.", 400);
  }
  const template = await prisma.template.findUnique({
    where: { id: data.templateId },
    select: { id: true },
  });
  if (!template) {
    throw new AppError("Template not found.", 400);
  }

  const summary = data.summary?.trim() || null;
  if (summary && summary.length > SUMMARY_MAX) {
    throw new AppError(
      `Summary must be ${SUMMARY_MAX} characters or fewer.`,
      400
    );
  }
  const image = data.image || null;

  // Create new page if no id
  if (!pageId) {
    const newPage = await prisma.page.create({
      data: {
        title: data.title,
        slug: data.slug,
        templateId: data.templateId,
        summary,
        image,
        meta: data.meta || {},
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      },
    });
    pageId = newPage.id;
  } else {
    // Update existing page
    await prisma.page.update({
      where: { id: pageId },
      data: {
        title: data.title,
        slug: data.slug,
        templateId: data.templateId,
        summary,
        image,
        meta: data.meta || {},
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      },
    });
  }

  await replaceBlocks({ pageId }, data.blocks);

  // Left alone when the caller doesn't send categoryIds
  if (data.categoryIds) {
    await setPageCategories(pageId, data.categoryIds);
  }

  // Return page with blocks
  return getPage(pageId);
};

export const deletePage = async (id: string) => {
  const deletedContent = await prisma.page.delete({
    where: { id },
  });

  return deletedContent;
};

export const getPage = async (id: string) => {
  const page = await prisma.page.findUnique({
    where: { id },
    include: {
      blocks: {
        orderBy: { order: "asc" },
      },
      categories: { select: { categoryId: true } },
    },
  });
  if (!page) return null;

  const { categories, ...rest } = page;
  return { ...rest, categoryIds: categories.map((c) => c.categoryId) };
};

export async function listPages(
  search: string,
  pagination: { take: number; skip: number },
  ordering: { [key: string]: "asc" | "desc" }
) {
  const where = {
    ...(search && { title: { contains: search } }),
  };

  const [content, totalCount] = await Promise.all([
    prisma.page.findMany({
      where,
      orderBy: ordering,
      take: pagination.take,
      skip: pagination.skip,
    }),
    prisma.page.count({ where }),
  ]);

  return { content, totalCount };
}
