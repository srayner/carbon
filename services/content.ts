import { prisma } from "@/lib/prisma";

type PageInput = {
  id?: string;
  title: string;
  slug: string;
  meta?: object;
  publishedAt?: string | null;
  blocks: Record<string, any>[];
};

export const updatePage = async (
  pageId: string,
  data: PageInput
): Promise<Page & { blocks: Block[] }> => {
  // Update the Page row
  const updatedPage = await prisma.page.update({
    where: { id: pageId },
    data: {
      title: data.title,
      slug: data.slug,
      meta: data.meta || {},
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
    },
  });

  // Delete existing blocks for this page
  await prisma.block.deleteMany({
    where: { pageId },
  });

  // Insert all blocks as JSON
  if (data.blocks.length > 0) {
    const blocksToCreate = data.blocks.map((b, index) => ({
      id: b.id,
      type: b.type,
      data: b, // store the entire block as JSON
      order: index,
      pageId,
      parentId: null, // flat blocks, no parent
    }));

    console.log("Blocks to create", blocksToCreate);
    //  await prisma.block.createMany({
    //    data: blocksToCreate,
    //  });
  }

  // Return the updated page with its blocks
  const pageWithBlocks = await prisma.page.findUnique({
    where: { id: updatedPage.id },
    include: { blocks: true },
  });

  return pageWithBlocks!;
};

export const upsertPage = async (
  data: PageInput
): Promise<Page & { blocks: Block[] }> => {
  let pageId = data.id;

  // Create new page if no id
  if (!pageId) {
    const newPage = await prisma.page.create({
      data: {
        title: data.title,
        slug: data.slug,
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
        meta: data.meta || {},
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      },
    });

    // Delete existing blocks
    await prisma.block.deleteMany({
      where: { pageId },
    });
  }

  // Insert all blocks as JSON
  if (data.blocks.length > 0) {
    const blocksToCreate = data.blocks.map((b, index) => ({
      id: b.id,
      type: b.type,
      data: b, // store the entire block as JSON
      order: index,
      pageId,
      parentId: null, // flat blocks, no parent
    }));

    await prisma.block.createMany({
      data: blocksToCreate,
    });
  }

  // Return page with blocks
  const pageWithBlocks = await prisma.page.findUnique({
    where: { id: pageId },
    include: { blocks: true },
  });

  return pageWithBlocks!;
};

export const deleteContent = async (id: string) => {
  const deletedContent = await prisma.content.delete({
    where: { id },
  });

  return deletedContent;
};

export const getContent = async (id: string) => {
  const page = await prisma.page.findUnique({
    where: { id },
    include: { blocks: true },
  });

  return page;
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
