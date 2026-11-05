import { BlockProperty } from "@/types/blocks";

// The order groups are shown in; a group not listed comes just before Advanced
const GROUP_ORDER = [
  "Content",
  "Appearance",
  "Layout",
  "Spacing",
  "Box",
  "Colour and font",
  "Advanced",
];
const groupRank = (group: string) => {
  const rank = GROUP_ORDER.indexOf(group);
  return rank === -1 ? GROUP_ORDER.length - 1.5 : rank;
};

// A property with no group goes with the content
export const DEFAULT_GROUP = "Content";

/** The panel's properties in their groups, in display order. Hidden ones are left out. */
export const groupProperties = (
  properties: readonly BlockProperty[]
): [string, BlockProperty[]][] => {
  const groups = new Map<string, BlockProperty[]>();
  for (const prop of properties) {
    if (prop.hidden) continue;
    const group = prop.group ?? DEFAULT_GROUP;
    groups.set(group, [...(groups.get(group) ?? []), prop]);
  }
  return [...groups.entries()].sort(([a], [b]) => groupRank(a) - groupRank(b));
};
