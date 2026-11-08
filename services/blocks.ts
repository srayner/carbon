import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/api/error";
import { validateBlockTree } from "@/lib/block-tree";
import { validateBlockUrls } from "@/lib/block-urls";
import { Block } from "@/types/blocks";

type BlockOwner = { pageId: string } | { fragmentId: string };

/**
 * Rejects a block list that is not a valid tree, or has a link address
 * that must not be published (see lib/link-url.ts). Callers run it before
 * writing anything else, so a bad list leaves the page or fragment untouched.
 */
export const assertValidBlocks = (blocks: Block[]) => {
  const error = validateBlockTree(blocks) ?? validateBlockUrls(blocks);
  if (error) throw new AppError(error, 400);
};

/**
 * Replaces all of an owner's blocks with the given list, in order. Nested
 * blocks keep the same owner; `parentId` places them in the tree, and the
 * list index keeps siblings in order.
 */
export const replaceBlocks = async (owner: BlockOwner, blocks: Block[]) => {
  assertValidBlocks(blocks);
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
