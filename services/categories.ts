import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api/error";

export const MAX_CATEGORY_DEPTH = 4;

type CategoryInput = {
  name: string;
  description?: string | null;
  parentId?: string | null;
  isActive?: boolean;
};

type CategoryNode = { id: string; parentId: string | null };

const NAME_MAX = 100;
const DESCRIPTION_MAX = 500;

const cleanInput = (data: CategoryInput) => {
  const name = data.name?.trim();
  if (!name) throw new AppError("Name is required.", 400);
  if (name.length > NAME_MAX) {
    throw new AppError(`Name must be ${NAME_MAX} characters or fewer.`, 400);
  }

  const description = data.description?.trim() || null;
  if (description && description.length > DESCRIPTION_MAX) {
    throw new AppError(
      `Description must be ${DESCRIPTION_MAX} characters or fewer.`,
      400
    );
  }

  return { name, description, parentId: data.parentId || null };
};

const getNodes = (): Promise<CategoryNode[]> =>
  prisma.category.findMany({ select: { id: true, parentId: true } });

/** Number of levels from the root down to (and including) the category. */
const depthOf = (id: string | null, nodes: CategoryNode[]) => {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  let depth = 0;
  for (let cur = id; cur; cur = byId.get(cur)?.parentId ?? null) {
    depth++;
    if (depth > nodes.length) break; // guards against a corrupt cycle
  }
  return depth;
};

/** Number of levels in the category's subtree, counting the category itself. */
const heightOf = (id: string, nodes: CategoryNode[]): number => {
  const children = nodes.filter((n) => n.parentId === id);
  return 1 + Math.max(0, ...children.map((c) => heightOf(c.id, nodes)));
};

const descendantIds = (id: string, nodes: CategoryNode[]): string[] => {
  const direct = nodes.filter((n) => n.parentId === id).map((n) => n.id);
  return direct.flatMap((childId) => [childId, ...descendantIds(childId, nodes)]);
};

const assertParentFits = (
  categoryId: string | null,
  parentId: string | null,
  nodes: CategoryNode[]
) => {
  if (parentId && !nodes.some((n) => n.id === parentId)) {
    throw new AppError("Parent category not found.", 404);
  }
  if (categoryId && parentId) {
    if (
      parentId === categoryId ||
      descendantIds(categoryId, nodes).includes(parentId)
    ) {
      throw new AppError("A category cannot be moved inside itself.", 400);
    }
  }
  const subtree = categoryId ? heightOf(categoryId, nodes) : 1;
  if (depthOf(parentId, nodes) + subtree > MAX_CATEGORY_DEPTH) {
    throw new AppError(
      `Categories can be nested at most ${MAX_CATEGORY_DEPTH} levels deep.`,
      400
    );
  }
};

const assertNameFree = async (
  name: string,
  parentId: string | null,
  excludeId: string | null
) => {
  // The unique index can't catch duplicate root names (NULL parents never collide)
  const clash = await prisma.category.findFirst({
    where: { name, parentId, ...(excludeId && { id: { not: excludeId } }) },
    select: { id: true },
  });
  if (clash) {
    throw new AppError(
      "A category with this name already exists at this level.",
      409
    );
  }
};

export const listCategories = async () => {
  const categories = await prisma.category.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
    include: { _count: { select: { pages: true, children: true } } },
  });

  return categories.map(({ _count, ...category }) => ({
    ...category,
    pageCount: _count.pages,
    childCount: _count.children,
  }));
};

export const getCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { pages: true, children: true } } },
  });
  if (!category) throw new AppError("Category not found.", 404);

  const { _count, ...rest } = category;
  return { ...rest, pageCount: _count.pages, childCount: _count.children };
};

export const createCategory = async (data: CategoryInput) => {
  const { name, description, parentId } = cleanInput(data);

  assertParentFits(null, parentId, await getNodes());
  await assertNameFree(name, parentId, null);

  const last = await prisma.category.aggregate({
    where: { parentId },
    _max: { order: true },
  });

  return prisma.category.create({
    data: {
      name,
      description,
      parentId,
      isActive: data.isActive ?? true,
      order: (last._max.order ?? -1) + 1,
    },
  });
};

export const updateCategory = async (id: string, data: CategoryInput) => {
  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) throw new AppError("Category not found.", 404);

  const { name, description, parentId } = cleanInput({
    ...data,
    parentId: data.parentId === undefined ? existing.parentId : data.parentId,
  });
  const isActive = data.isActive ?? existing.isActive;
  const nodes = await getNodes();
  const moved = parentId !== existing.parentId;

  if (moved) assertParentFits(id, parentId, nodes);
  await assertNameFree(name, parentId, id);

  // Deactivating cascades to every descendant. Activating only affects this
  // category, so children that were switched off stay off.
  const deactivating = existing.isActive && !isActive;

  return prisma.$transaction(async (tx) => {
    if (deactivating) {
      await tx.category.updateMany({
        where: { id: { in: descendantIds(id, nodes) } },
        data: { isActive: false },
      });
    }

    let order = existing.order;
    if (moved) {
      const last = await tx.category.aggregate({
        where: { parentId },
        _max: { order: true },
      });
      order = (last._max.order ?? -1) + 1;
    }

    return tx.category.update({
      where: { id },
      data: { name, description, parentId, isActive, order },
    });
  });
};

/** Swaps the category with its previous or next sibling. */
export const moveCategory = async (id: string, direction: -1 | 1) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) throw new AppError("Category not found.", 404);

  const siblings = await prisma.category.findMany({
    where: { parentId: category.parentId },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: { id: true },
  });

  const index = siblings.findIndex((s) => s.id === id);
  const target = index + direction;
  if (target < 0 || target >= siblings.length) return;

  const ids = siblings.map((s) => s.id);
  [ids[index], ids[target]] = [ids[target], ids[index]];

  // Renumber the whole sibling group so ties and gaps are cleaned up too
  await prisma.$transaction(
    ids.map((siblingId, order) =>
      prisma.category.update({ where: { id: siblingId }, data: { order } })
    )
  );
};

/**
 * Deletes a category. Refuses while it has children. When pages still use it,
 * refuses unless `detachPages` is set, in which case the pages are detached.
 */
export const deleteCategory = async (id: string, detachPages: boolean) => {
  const category = await getCategory(id);

  if (category.childCount > 0) {
    throw new AppError(
      `This category has ${category.childCount} sub-categor${
        category.childCount === 1 ? "y" : "ies"
      }. Move or delete them first.`,
      409
    );
  }
  if (category.pageCount > 0 && !detachPages) {
    throw new AppError(
      `This category is used by ${category.pageCount} page${
        category.pageCount === 1 ? "" : "s"
      }.`,
      409
    );
  }

  await prisma.$transaction([
    prisma.pageCategory.deleteMany({ where: { categoryId: id } }),
    prisma.category.delete({ where: { id } }),
  ]);

  return { ...category, detachedPages: category.pageCount };
};

/** Replaces the set of categories a page belongs to. */
export const setPageCategories = async (
  pageId: string,
  categoryIds: string[]
) => {
  const ids = [...new Set(categoryIds)];

  const found = await prisma.category.count({ where: { id: { in: ids } } });
  if (found !== ids.length) {
    throw new AppError("One or more categories no longer exist.", 400);
  }

  await prisma.$transaction([
    prisma.pageCategory.deleteMany({ where: { pageId } }),
    prisma.pageCategory.createMany({
      data: ids.map((categoryId) => ({ pageId, categoryId })),
    }),
  ]);
};
