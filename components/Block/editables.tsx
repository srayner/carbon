"use client";

import React, { ComponentType, lazy } from "react";
import { ALL_BLOCKS } from "@/config/blocks";
import { Block } from "@/types/blocks";
import MissingRenderer from "@/components/Block/MissingRenderer";

export type AnyEditable = ComponentType<{
  block: Block;
  onChange: (patch: Record<string, unknown>) => void;
}>;

const cache = new Map<string, AnyEditable>();

/**
 * The edit renderer for a block type, found by name:
 * `components/Block/<Name>Editable.tsx`. It loads the first time that block
 * type is used, and the same component is returned from then on.
 */
export const getEditable = (name: string): AnyEditable | null => {
  if (!ALL_BLOCKS.some((config) => config.name === name)) return null;

  let editable = cache.get(name);
  if (!editable) {
    editable = lazy(() =>
      import(`./${name}Editable`).catch((err) => {
        console.error(`Could not load ${name}Editable:`, err);
        const Missing = () => (
          <MissingRenderer name={name} file={`${name}Editable`} />
        );
        return { default: Missing };
      })
    ) as unknown as AnyEditable;
    cache.set(name, editable);
  }
  return editable;
};
