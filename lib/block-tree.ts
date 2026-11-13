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

/* ----- Editing the flat list -----
 *
 * The editor keeps one flat list in tree order: each container is followed by
 * everything inside it. These keep it that way, and never drop a block they
 * were not asked to remove.
 */

const childIdsOf = (blocks: TreeBlock[]) => {
  const children = new Map<string, string[]>();
  for (const b of blocks) {
    if (!b.parentId) continue;
    const list = children.get(b.parentId) ?? [];
    list.push(b.id);
    children.set(b.parentId, list);
  }
  return children;
};

/** The ids of a block and everything inside it. Safe on loops. */
export const subtreeIds = (blocks: TreeBlock[], id: string): Set<string> => {
  const children = childIdsOf(blocks);
  const ids = new Set<string>();
  const stack = [id];
  while (stack.length) {
    const current = stack.pop()!;
    if (ids.has(current)) continue;
    ids.add(current);
    stack.push(...(children.get(current) ?? []));
  }
  return ids;
};

/** How many containers a block is inside (0 at the top). Safe on loops. */
export const depthOf = (blocks: TreeBlock[], id: string): number => {
  const byId = new Map(blocks.map((b) => [b.id, b]));
  const seen = new Set([id]);
  let depth = 0;
  for (let p = byId.get(id)?.parentId; p && byId.has(p) && !seen.has(p); p = byId.get(p)!.parentId) {
    seen.add(p);
    depth++;
  }
  return depth;
};

/**
 * Adds a block at the end of a container, or at the end of the top level when
 * parentId is null.
 */
export const insertBlock = <T extends TreeBlock>(
  blocks: T[],
  block: T,
  parentId: string | null
): T[] => {
  const added = { ...block, parentId };
  if (!parentId) return [...blocks, added];

  if (!blocks.some((b) => b.id === parentId)) {
    throw new Error(`insertBlock: container ${parentId} is not in the list`);
  }
  const inside = subtreeIds(blocks, parentId);
  const last = blocks.findLastIndex((b) => inside.has(b.id));
  return [...blocks.slice(0, last + 1), added, ...blocks.slice(last + 1)];
};

/** Removes a block and everything inside it. */
export const removeBlock = <T extends TreeBlock>(blocks: T[], id: string): T[] => {
  const gone = subtreeIds(blocks, id);
  return blocks.filter((b) => !gone.has(b.id));
};

/**
 * A place in the tree: inside `parentId` (null for the top level), just
 * before the sibling `beforeId`, or at the end when `beforeId` is null.
 */
export type BlockPlace = { parentId: string | null; beforeId: string | null };

/**
 * Whether a block can be moved to a place. It cannot go inside itself or its
 * own contents, inside a block that is not a container, before a block that
 * is not in that container, or so deep that it or anything inside it would be
 * nested past MAX_DEPTH.
 */
export const canMoveTo = (blocks: TreeBlock[], id: string, to: BlockPlace): boolean => {
  const byId = new Map(blocks.map((b) => [b.id, b]));
  if (!byId.has(id)) return false;

  // The block and everything inside it, and how far below it the deepest is
  const children = childIdsOf(blocks);
  const moving = new Set<string>();
  let below = 0;
  const stack: [string, number][] = [[id, 0]];
  while (stack.length) {
    const [current, depth] = stack.pop()!;
    if (moving.has(current)) continue;
    moving.add(current);
    below = Math.max(below, depth);
    for (const child of children.get(current) ?? []) stack.push([child, depth + 1]);
  }

  if (to.parentId !== null) {
    const parent = byId.get(to.parentId);
    if (!parent || !isContainerType(parent.type) || moving.has(parent.id)) return false;
  }
  if (to.beforeId !== null) {
    const before = byId.get(to.beforeId);
    if (!before || (before.parentId ?? null) !== to.parentId) return false;
  }

  // Where it would now start
  const newDepth = to.parentId === null ? 0 : depthOf(blocks, to.parentId) + 1;
  return newDepth + below <= MAX_DEPTH;
};

/**
 * Moves a block, with everything inside it, to a place. Returns the list it
 * was given when the move is refused (see canMoveTo) or changes nothing.
 */
export const moveBlockTo = <T extends TreeBlock>(
  blocks: T[],
  id: string,
  to: BlockPlace
): T[] => {
  // Just before itself is where it already is
  if (to.beforeId === id || !canMoveTo(blocks, id, to)) return blocks;

  const moving = subtreeIds(blocks, id);
  const movingBlocks = blocks
    .filter((b) => moving.has(b.id))
    .map((b) => (b.id === id ? { ...b, parentId: to.parentId } : b));
  const rest = blocks.filter((b) => !moving.has(b.id));

  let at: number;
  if (to.beforeId !== null) {
    at = rest.findIndex((b) => b.id === to.beforeId);
  } else if (to.parentId !== null) {
    const inside = subtreeIds(rest, to.parentId);
    at = rest.findLastIndex((b) => inside.has(b.id)) + 1;
  } else {
    at = rest.length;
  }
  const result = [...rest.slice(0, at), ...movingBlocks, ...rest.slice(at)];

  const unchanged =
    (blocks.find((b) => b.id === id)!.parentId ?? null) === to.parentId &&
    result.every((b, i) => b.id === blocks[i].id);
  return unchanged ? blocks : result;
};

/**
 * Swaps a block with its previous (-1) or next (1) sibling, each taking
 * everything inside it along. Does nothing at either end.
 */
export const moveBlock = <T extends TreeBlock>(
  blocks: T[],
  id: string,
  direction: -1 | 1
): T[] => {
  const target = blocks.find((b) => b.id === id);
  if (!target) return blocks;

  const parentId = target.parentId ?? null;
  const siblings = blocks.filter((b) => (b.parentId ?? null) === parentId);
  const index = siblings.indexOf(target);
  if (!siblings[index + direction]) return blocks;

  // Up: before the previous sibling. Down: before the one after the next.
  const before = direction === -1 ? siblings[index - 1] : siblings[index + 2];
  return moveBlockTo(blocks, id, { parentId, beforeId: before?.id ?? null });
};
