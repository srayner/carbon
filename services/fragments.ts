import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api/error";
import { replaceBlocks } from "@/services/blocks";
import { KIND_LABELS } from "@/lib/fragment-routes";
import { Block } from "@/types/blocks";
import { FRAGMENT_KINDS, FragmentKind } from "@/types/templates";

type FragmentInput = {
  name: string;
  kind?: FragmentKind;
  blocks?: Block[];
};

const NAME_MAX = 100;

const cleanName = (name: string | undefined) => {
  const trimmed = name?.trim();
  if (!trimmed) throw new AppError("Name is required.", 400);
  if (trimmed.length > NAME_MAX) {
    throw new AppError(`Name must be ${NAME_MAX} characters or fewer.`, 400);
  }
  return trimmed;
};

export const listFragments = async (kind?: FragmentKind) => {
  const fragments = await prisma.fragment.findMany({
    where: kind ? { kind } : undefined,
    orderBy: { name: "asc" },
    include: { _count: { select: { slots: true } } },
  });

  return fragments.map(({ _count, ...fragment }) => ({
    id: fragment.id,
    name: fragment.name,
    kind: fragment.kind,
    templateCount: _count.slots,
  }));
};

export const getFragment = async (id: string) => {
  const fragment = await prisma.fragment.findUnique({
    where: { id },
    include: {
      blocks: { orderBy: { order: "asc" } },
      _count: { select: { slots: true } },
    },
  });
  if (!fragment) throw new AppError("Fragment not found.", 404);

  const { _count, ...rest } = fragment;
  return { ...rest, templateCount: _count.slots };
};

export const createFragment = async (data: FragmentInput) => {
  const name = cleanName(data.name);
  if (!data.kind || !FRAGMENT_KINDS.includes(data.kind)) {
    throw new AppError("A valid kind is required.", 400);
  }

  const fragment = await prisma.fragment.create({
    data: { name, kind: data.kind },
  });
  if (data.blocks?.length) await replaceBlocks({ fragmentId: fragment.id }, data.blocks);

  return getFragment(fragment.id);
};

/** The kind is fixed at creation, because templates rely on it. */
export const updateFragment = async (id: string, data: FragmentInput) => {
  const name = cleanName(data.name);
  await getFragment(id);

  await prisma.fragment.update({ where: { id }, data: { name } });
  if (data.blocks) await replaceBlocks({ fragmentId: id }, data.blocks);

  return getFragment(id);
};

/**
 * Deletes a fragment. When templates still use it, refuses unless
 * `detach` is set, in which case those template slots are emptied.
 */
export const deleteFragment = async (id: string, detach: boolean) => {
  const fragment = await getFragment(id);

  if (fragment.templateCount > 0 && !detach) {
    throw new AppError(
      `This ${KIND_LABELS[fragment.kind].toLowerCase()} is used by ${fragment.templateCount} template${
        fragment.templateCount === 1 ? "" : "s"
      }.`,
      409
    );
  }

  await prisma.$transaction([
    prisma.templateSlot.deleteMany({ where: { fragmentId: id } }),
    prisma.fragment.delete({ where: { id } }),
  ]);

  return { id, name: fragment.name, detachedTemplates: fragment.templateCount };
};
