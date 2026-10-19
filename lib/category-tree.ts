import type { Category } from "@/types/entities";

export const MAX_CATEGORY_DEPTH = 4;

export type CategoryRow = Category & {
  depth: number; // 1 for root categories
  path: string; // "Hardware / Sensors"
  isEffectivelyActive: boolean; // false when any ancestor is inactive
  isFirst: boolean;
  isLast: boolean;
};

/**
 * Flattens categories into display order (depth first, siblings by `order`).
 * Expects the list to already be sorted by order.
 */
export const flattenCategories = (categories: Category[]): CategoryRow[] => {
  const byParent = new Map<string | null, Category[]>();
  for (const c of categories) {
    const siblings = byParent.get(c.parentId) ?? [];
    siblings.push(c);
    byParent.set(c.parentId, siblings);
  }

  const rows: CategoryRow[] = [];
  const walk = (
    parentId: string | null,
    depth: number,
    parentPath: string,
    parentActive: boolean
  ) => {
    const siblings = byParent.get(parentId) ?? [];
    siblings.forEach((c, i) => {
      const path = parentPath ? `${parentPath} / ${c.name}` : c.name;
      rows.push({
        ...c,
        depth,
        path,
        isEffectivelyActive: parentActive && c.isActive,
        isFirst: i === 0,
        isLast: i === siblings.length - 1,
      });
      walk(c.id, depth + 1, path, parentActive && c.isActive);
    });
  };
  walk(null, 1, "", true);

  return rows;
};

/** Levels in the subtree rooted at the row, counting the row itself. */
export const subtreeHeight = (rows: CategoryRow[], id: string) => {
  const start = rows.findIndex((r) => r.id === id);
  if (start < 0) return 1;
  const base = rows[start].depth;
  let deepest = base;
  for (let i = start + 1; i < rows.length && rows[i].depth > base; i++) {
    deepest = Math.max(deepest, rows[i].depth);
  }
  return deepest - base + 1;
};

/** Ids of the row's descendants. */
export const descendantIdsOf = (rows: CategoryRow[], id: string) => {
  const start = rows.findIndex((r) => r.id === id);
  if (start < 0) return [];
  const base = rows[start].depth;
  const ids: string[] = [];
  for (let i = start + 1; i < rows.length && rows[i].depth > base; i++) {
    ids.push(rows[i].id);
  }
  return ids;
};
