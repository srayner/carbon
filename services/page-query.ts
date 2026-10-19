import { prisma } from "@/lib/prisma";
import { getQueryCategoryIds } from "@/services/categories";

export const QUERY_ORDERS = ["title", "newest", "oldest"] as const;
export type QueryOrder = (typeof QUERY_ORDERS)[number];

export type PageQuery = {
  categoryId: string;
  includeSubcategories: boolean;
  orderBy: QueryOrder;
  limit: number;
  excludePageId?: string;
};

export type PageQueryResult = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  image: string | null;
};

const ORDERINGS = {
  title: { title: "asc" },
  newest: { publishedAt: "desc" },
  oldest: { publishedAt: "asc" },
} as const;

/** Published pages in a category, for query blocks. */
export const queryPages = async ({
  categoryId,
  includeSubcategories,
  orderBy,
  limit,
  excludePageId,
}: PageQuery): Promise<PageQueryResult[]> => {
  if (!categoryId) return [];

  const categoryIds = await getQueryCategoryIds(
    categoryId,
    includeSubcategories
  );
  if (categoryIds.length === 0) return [];

  return prisma.page.findMany({
    where: {
      publishedAt: { not: null, lte: new Date() },
      categories: { some: { categoryId: { in: categoryIds } } },
      ...(excludePageId && { id: { not: excludePageId } }),
    },
    orderBy: [ORDERINGS[orderBy], { title: "asc" }],
    take: limit,
    select: { id: true, title: true, slug: true, summary: true, image: true },
  });
};
