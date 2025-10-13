import { prisma } from "@/lib/prisma";

export async function createContent(data: {
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  publishedAt?: string | null;
}) {
  return prisma.content.create({
    data: {
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
    },
  });
}

export const updateContent = async (id: string, data: any) => {
  const updatedContent = await prisma.content.update({
    where: { id },
    data: {
      title: data.title,
      slug: data.slug,
      content: data.content,
      excerpt: data.excerpt,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
    },
  });

  return updatedContent;
};

export const deleteContent = async (id: string) => {
  const deletedContent = await prisma.content.delete({
    where: { id },
  });

  return deletedContent;
};

export const getContent = async (id: string) => {
  return await prisma.content.findUnique({
    where: { id },
  });
};

export async function listContent(
  search: string,
  pagination: { take: number; skip: number },
  ordering: { [key: string]: "asc" | "desc" }
) {
  const where = {
    ...(search && { title: { contains: search } }),
  };

  const [content, totalCount] = await Promise.all([
    prisma.content.findMany({
      where,
      orderBy: ordering,
      take: pagination.take,
      skip: pagination.skip,
    }),
    prisma.content.count({ where }),
  ]);

  return { content, totalCount };
}
