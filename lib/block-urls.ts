import { ALL_BLOCKS } from "@/config/blocks";
import { URL_HINT, safeHref } from "@/lib/link-url";

/**
 * Why a block's link address cannot be saved, or null. Checks every
 * property of type "url" in the block configs; an empty one is allowed and
 * simply links nowhere.
 */
export const validateBlockUrls = (
  blocks: { type: string; properties: unknown }[]
): string | null => {
  for (const block of blocks) {
    const config = ALL_BLOCKS.find((c) => c.name === block.type);
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
