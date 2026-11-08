import { ALL_BLOCKS } from "@/config/blocks";

/*
 * Blocks are stored as one flat list per page or fragment. A block inside a
 * container has the container's id as its `parentId`; top-level blocks have
 * none. The tree is worked out from that list in memory.
 *
 * Depth counts containers: a top-level block is at depth 0, a block inside a
 * top-level container at depth 1, and so on.
 */
export const MAX_DEPTH = 4;

/** The fields the tree needs; a full Block has them all. */
export type TreeBlock = { id: string; type: string; parentId?: string | null };

export type BlockNode<T extends TreeBlock> = {
  block: T;
  depth: number;
  children: BlockNode<T>[];
};

/** Whether blocks of this type can hold other blocks (`container: true`). */
export const isContainerType = (type: string) =>
  ALL_BLOCKS.some(
    (config) =>
      config.name === type && "container" in config && config.container === true
  );

/**
 * Why the list cannot be saved as a tree, or null when it can. Checks that
 * ids are unique, every parent is a container in the same list, there are no
 * loops and nothing is deeper than MAX_DEPTH.
 */
export const validateBlockTree = (
  blocks: TreeBlock[],
  isContainer: (type: string) => boolean = isContainerType
): string | null => {
  const byId = new Map<string, TreeBlock>();
  for (const block of blocks) {
    if (byId.has(block.id)) return "Two blocks have the same id.";
    byId.set(block.id, block);
  }

  for (const block of blocks) {
    if (!block.parentId) continue;
    const parent = byId.get(block.parentId);
    if (!parent) return "A block's container is not one of the blocks being saved.";
    if (!isContainer(parent.type)) {
      return `A ${parent.type} block cannot hold other blocks.`;
    }
  }

  // Walk up from each block to the top. Every parent exists by now, so the
  // walk ends at a top-level block or comes back to a block already passed.
  for (const block of blocks) {
    const seen = new Set([block.id]);
    let depth = 0;
    for (let id = block.parentId; id; id = byId.get(id)!.parentId) {
      if (seen.has(id)) return "Blocks are nested inside each other in a loop.";
      seen.add(id);
      depth++;
    }
    if (depth > MAX_DEPTH) {
      return `Blocks can be nested at most ${MAX_DEPTH} containers deep.`;
    }
  }

  return null;
};

/**
 * The top-level blocks with their children, keeping the list's order among
 * siblings. Safe on any list, including bad rows already in the database:
 * it only walks down from top-level blocks, so blocks in a loop are never
 * reached, and it stops at MAX_DEPTH. Blocks left out are reported with a
 * warning.
 */
export const buildTree = <T extends TreeBlock>(blocks: T[]): BlockNode<T>[] => {
  const ids = new Set(blocks.map((b) => b.id));
  const childrenOf = new Map<string | null, T[]>();
  for (const block of blocks) {
    const parentId = block.parentId ?? null;
    // A block whose parent is missing is dropped, not moved to the top
    if (parentId !== null && !ids.has(parentId)) continue;
    const siblings = childrenOf.get(parentId) ?? [];
    siblings.push(block);
    childrenOf.set(parentId, siblings);
  }

  let placed = 0;
  const build = (parentId: string | null, depth: number): BlockNode<T>[] =>
    (childrenOf.get(parentId) ?? []).map((block) => {
      placed++;
      return {
        block,
        depth,
        children: depth < MAX_DEPTH ? build(block.id, depth + 1) : [],
      };
    });
  const tree = build(null, 0);

  if (placed < blocks.length) {
    console.warn(
      `buildTree: ${blocks.length - placed} block(s) left out (missing parent, loop or too deep).`
    );
  }
  return tree;
};
