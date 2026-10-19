import { prisma } from "@/lib/prisma";
import { Block } from "@/types/blocks";

type BlockOwner = { pageId: string } | { fragmentId: string };

/** Replaces all of an owner's blocks with the given list, in order. */
export const replaceBlocks = async (owner: BlockOwner, blocks: Block[]) => {
  await prisma.$transaction([
    prisma.block.deleteMany({ where: owner }),
    prisma.block.createMany({
      data: blocks.map((b, index) => ({
        id: b.id,
        type: b.type,
        properties: b.properties, // store the entire block as JSON
        order: index,
        parentId: null, // flat blocks, no parent
        ...owner,
      })),
    }),
  ]);
};
