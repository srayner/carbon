import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api/error";
import { validateBlockTree } from "@/lib/block-tree";
import { Block } from "@/types/blocks";

type BlockOwner = { pageId: string } | { fragmentId: string };

/**
 * Rejects a block list that is not a valid tree. Callers run it before
 * writing anything else, so a bad list leaves the page or fragment untouched.
 */
export const assertValidBlockTree = (blocks: Block[]) => {
  const error = validateBlockTree(blocks);
  if (error) throw new AppError(error, 400);
};

/**
 * Replaces all of an owner's blocks with the given list, in order. Nested
 * blocks keep the same owner; `parentId` places them in the tree, and the
 * list index keeps siblings in order.
 */
export const replaceBlocks = async (owner: BlockOwner, blocks: Block[]) => {
  assertValidBlockTree(blocks);
  await prisma.$transaction([
    prisma.block.deleteMany({ where: owner }),
    prisma.block.createMany({
      data: blocks.map((b, index) => ({
        id: b.id,
        type: b.type,
        properties: b.properties, // store the entire block as JSON
        order: index,
        parentId: b.parentId ?? null,
        ...owner,
      })),
    }),
  ]);
};
