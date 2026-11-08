import { ALL_BLOCKS } from "@/config/blocks";
import { URL_HINT, safeHref } from "@/lib/link-url";

type BlockLike = { id?: string; type: string; properties: unknown; parentId?: string | null };

const configOf = (type: string) => ALL_BLOCKS.find((c) => c.name === type);

/**
 * Why a block's link address cannot be saved, or null. Checks every
 * property of type "url" in the block configs; an empty one is allowed and
 * simply links nowhere.
 */
export const validateBlockUrls = (
  blocks: { type: string; properties: unknown }[]
): string | null => {
  for (const block of blocks) {
    const config = configOf(block.type);
    if (!config) continue;
    const properties = (block.properties ?? {}) as Record<string, unknown>;
    for (const prop of config.properties) {
      if (prop.type !== "url") continue;
      const value = properties[prop.name];
      if (value === undefined || value === null || String(value).trim() === "") continue;
      if (safeHref(value) === null) {
        return `${config.name} "${prop.displayName}" can't be saved: ${URL_HINT}`;
      }
    }
  }
  return null;
};

/**
 * Whether a block renders as a link: it has a property of type "url" that is
 * set, or left unset with a default address. A Link always is (its default is
 * "/"); a Container is only when given an address.
 */
export const isLinkBlock = (block: BlockLike): boolean => {
  const config = configOf(block.type);
  if (!config) return false;
  const properties = (block.properties ?? {}) as Record<string, unknown>;
  return config.properties.some((prop) => {
    if (prop.type !== "url") return false;
    const value = properties[prop.name] ?? prop.default;
    return value !== undefined && value !== null && String(value).trim() !== "";
  });
};

/**
 * Why the list can't be saved because a link is inside another link, or
 * null. Browsers don't allow an <a> inside an <a>: they close the outer one
 * early, breaking the layout. Checks every ancestor, not just the parent.
 */
export const validateNestedLinks = (blocks: BlockLike[]): string | null => {
  const byId = new Map(blocks.filter((b) => b.id).map((b) => [b.id!, b]));
  for (const block of blocks) {
    if (!isLinkBlock(block)) continue;
    const seen = new Set<string>();
    let parentId = block.parentId ?? null;
    while (parentId && !seen.has(parentId)) {
      seen.add(parentId);
      const parent = byId.get(parentId);
      if (!parent) break;
      if (isLinkBlock(parent)) {
        return `A ${block.type} can't go inside a linked ${parent.type}: a link can't hold another link.`;
      }
      parentId = parent.parentId ?? null;
    }
  }
  return null;
};
