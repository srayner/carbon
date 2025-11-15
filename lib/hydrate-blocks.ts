import type {
  Block as AppBlock,
  BlockName,
  PropsForBlockName,
} from "@/types/blocks";
import type { Block as PrismaBlock } from "@/lib/generated/prisma";

/**
 * Hydrate a single Prisma Block into a fully typed AppBlock.
 */
export function hydrateBlock<T extends BlockName>(
  prismaBlock: PrismaBlock
): AppBlock {
  return {
    ...prismaBlock,
    type: prismaBlock.type as T,
    properties: prismaBlock.properties as PropsForBlockName<T>,
  } as AppBlock;
}

/**
 * Hydrate an array of Prisma Blocks.
 */
export function hydrateBlocks(prismaBlocks: PrismaBlock[]): AppBlock[] {
  return prismaBlocks.map((b) => hydrateBlock(b));
}
