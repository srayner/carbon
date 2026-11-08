"use client";

import React, { useState } from "react";
import { ALL_BLOCKS } from "@/config/blocks";
import { Block, BlockName, BlockConfig } from "@/types/blocks";
import {
  BlockNode,
  MAX_DEPTH,
  buildTree,
  depthOf,
  isContainerType,
} from "@/lib/block-tree";

function getDefaultProps(blockConfig: BlockConfig) {
  const defaults: Record<string, string> = {};
  for (const prop of blockConfig.properties) {
    defaults[prop.name] = prop.default ?? "";
  }
  return defaults;
}

interface BlockOutlineProps {
  blocks?: Block[];
  onSelect: (block: Block) => void;
  // parentId: the container to add inside, or null for the top level
  onAdd?: (block: Block, parentId: string | null) => void;
  onMove?: (blockId: string, direction: -1 | 1) => void;
  onDelete?: (blockId: string) => void;
  selectedBlockId?: string | null;
}

/**
 * The page's blocks as an indented tree. Each container has its own "add
 * inside" button; the button at the bottom adds to the top level. Move up and
 * down stay among a block's siblings.
 */
export const BlockOutline: React.FC<BlockOutlineProps> = ({
  blocks = [],
  onSelect,
  onAdd,
  onMove,
  onDelete,
  selectedBlockId = null,
}) => {
  // Where the add form adds to: undefined when closed, null for the top level
  const [addingTo, setAddingTo] = useState<string | null | undefined>(undefined);
  const [newType, setNewType] = useState<BlockName>(ALL_BLOCKS[0].name);
  // The form closes if the container it adds to is deleted while it is open
  const isAdding =
    addingTo === null ||
    (addingTo !== undefined && blocks.some((b) => b.id === addingTo));

  // A container at the deepest level could not hold anything, so none is offered
  const newDepth = addingTo ? depthOf(blocks, addingTo) + 1 : 0;
  const choices = ALL_BLOCKS.filter(
    (config) => newDepth < MAX_DEPTH || !isContainerType(config.name)
  );

  const openAdd = (parentId: string | null) => {
    setAddingTo(parentId);
    setNewType(ALL_BLOCKS[0].name);
  };

  const handleAdd = () => {
    const config = choices.find((b) => b.name === newType);
    if (!config || !isAdding || addingTo === undefined) return;

    const newBlock = {
      id: crypto.randomUUID(),
      type: newType,
      properties: { ...getDefaultProps(config) },
    } as Block;

    onAdd?.(newBlock, addingTo);
    setAddingTo(undefined);
  };

  const iconButton = "px-1 rounded-sm hover:bg-accent disabled:opacity-30";

  const renderNodes = (nodes: BlockNode<Block>[]): React.ReactNode =>
    nodes.map(({ block, depth, children }, index) => {
      const isContainer = isContainerType(block.type);
      return (
        <li key={block.id} className="space-y-1">
          <div
            onClick={() => onSelect(block)}
            data-block-id={block.id}
            data-depth={depth}
            className={`cursor-pointer p-2 border rounded-sm flex items-center justify-between ${
              selectedBlockId === block.id ? "bg-accent border-ring" : "bg-card"
            }`}
          >
            <span>{block.type}</span>
            <span className="flex gap-1" onClick={(e) => e.stopPropagation()}>
              {isContainer && (
                <button
                  type="button"
                  aria-label={`Add block inside ${block.type}`}
                  title={depth >= MAX_DEPTH ? "Nested as deep as allowed" : undefined}
                  disabled={depth >= MAX_DEPTH}
                  className={iconButton}
                  onClick={() => openAdd(block.id)}
                >
                  +
                </button>
              )}
              <button
                type="button"
                aria-label={`Move ${block.type} up`}
                disabled={index === 0}
                className={iconButton}
                onClick={() => onMove?.(block.id, -1)}
              >
                ↑
              </button>
              <button
                type="button"
                aria-label={`Move ${block.type} down`}
                disabled={index === nodes.length - 1}
                className={iconButton}
                onClick={() => onMove?.(block.id, 1)}
              >
                ↓
              </button>
              <button
                type="button"
                aria-label={`Delete ${block.type}`}
                className="px-1 rounded-sm text-destructive hover:bg-destructive/10"
                onClick={() => onDelete?.(block.id)}
              >
                ✕
              </button>
            </span>
          </div>
          {children.length > 0 && (
            <ul className="ml-4 space-y-1 border-l pl-2">{renderNodes(children)}</ul>
          )}
        </li>
      );
    });

  const target = addingTo ? blocks.find((b) => b.id === addingTo) : undefined;

  return (
    <div className="p-3 space-y-2 bg-muted">
      <h2 className="font-bold text-lg">Blocks</h2>

      <ul className="space-y-1">{renderNodes(buildTree(blocks))}</ul>

      {isAdding ? (
        <div className="mt-2 space-y-1">
          <p className="text-sm text-muted-foreground">
            {target ? `Adding inside ${target.type}` : "Adding to the page"}
          </p>
          <div className="flex space-x-2 items-center">
            <select
              value={newType}
              onChange={(e) => setNewType(e.target.value as BlockName)}
              className="border p-1 flex-1"
            >
              {choices.map((block) => (
                <option key={block.name} value={block.name}>
                  {block.name}
                </option>
              ))}
            </select>
            <button
              onClick={handleAdd}
              className="bg-emerald-600 text-white px-3 py-1 rounded-sm"
            >
              Add
            </button>
            <button
              onClick={() => setAddingTo(undefined)}
              className="px-3 py-1 rounded-sm border"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => openAdd(null)}
          className="mt-2 w-full text-center bg-primary text-primary-foreground rounded-sm p-2"
        >
          + Add Block
        </button>
      )}
    </div>
  );
};
