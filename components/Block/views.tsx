import React from "react";
import { ALL_BLOCKS } from "@/config/blocks";
import { Block, SharedBlockProps } from "@/types/blocks";
import MissingRenderer from "@/components/Block/MissingRenderer";

export type AnyView = (props: {
  block: Block;
  shared: SharedBlockProps;
  currentPageId?: string | null;
}) => React.ReactElement | null | Promise<React.ReactElement | null>;

const loadView = async (name: string): Promise<AnyView> => {
  try {
    const loaded = await import(`./${name}View`);
    return loaded.default as AnyView;
  } catch (err) {
    console.error(`Could not load ${name}View:`, err);
    // Only worth showing while developing; visitors get nothing
    return process.env.NODE_ENV === "development"
      ? () => <MissingRenderer name={name} file={`${name}View`} />
      : () => null;
  }
};

/**
 * The published renderers for the given block types, found by name:
 * `components/Block/<Name>View.tsx`. Only the types a page uses are loaded.
 * Types that are not in the block config are left out.
 */
export const loadViews = async (
  types: string[]
): Promise<Map<string, AnyView>> => {
  const names = Array.from(new Set(types)).filter((name) =>
    ALL_BLOCKS.some((config) => config.name === name)
  );
  const views = await Promise.all(names.map(loadView));
  return new Map(names.map((name, i) => [name, views[i]]));
};
