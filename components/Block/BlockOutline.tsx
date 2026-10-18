"use client";

import React, { useState, useEffect } from "react";
import { ALL_BLOCKS } from "@/config/blocks";
import { Block, BlockName, BlockConfig } from "@/types/blocks";

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
  onAdd?: (block: Block) => void;
  onMove?: (blockId: string, direction: -1 | 1) => void;
  onDelete?: (blockId: string) => void;
  selectedBlockId?: string | null;
}

export const BlockOutline: React.FC<BlockOutlineProps> = ({
  blocks: externalBlocks = [],
  onSelect,
  onAdd,
  onMove,
  onDelete,
  selectedBlockId: selectedFromParent,
}) => {
  const [blocks, setBlocks] = useState<Block[]>(externalBlocks);
  const [selectedLocally, setSelectedBlockId] = useState<string | null>(null);
  const selectedBlockId =
    selectedFromParent !== undefined ? selectedFromParent : selectedLocally;
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState(ALL_BLOCKS[0].name);

  // Sync internal state with prop when it changes (e.g., after loading from API)
  useEffect(() => {
    setBlocks(externalBlocks);
  }, [externalBlocks]);

  const handleAdd = () => {
    const config = ALL_BLOCKS.find((b) => b.name === newType);
    if (!config) return;

    const newBlock: Block = {
      id: crypto.randomUUID(),
      type: newType,
      properties: { ...getDefaultProps(config) },
    } as Block;

    const updatedBlocks = [...blocks, newBlock];
    setBlocks(updatedBlocks);
    setAdding(false);
    setNewType(ALL_BLOCKS[0].name);
    onAdd?.(newBlock);
  };

  const handleSelect = (block: Block) => {
    setSelectedBlockId(block.id);
    onSelect(block);
  };

  return (
    <div className="p-3 space-y-2 bg-gray-50">
      <h2 className="font-bold text-lg">Blocks</h2>

      <div className="space-y-1">
        {blocks.map((block, index) => {
          return (
            <div
              key={block.id}
              onClick={() => handleSelect(block)}
              className={`cursor-pointer p-2 border rounded flex items-center justify-between ${
                selectedBlockId === block.id
                  ? "bg-blue-200 border-blue-400"
                  : "bg-white"
              }`}
            >
              <span>{block.type}</span>
              <span
                className="flex gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  aria-label={`Move ${block.type} up`}
                  disabled={index === 0}
                  className="px-1 rounded hover:bg-gray-200 disabled:opacity-30"
                  onClick={() => onMove?.(block.id, -1)}
                >
                  ↑
                </button>
                <button
                  type="button"
                  aria-label={`Move ${block.type} down`}
                  disabled={index === blocks.length - 1}
                  className="px-1 rounded hover:bg-gray-200 disabled:opacity-30"
                  onClick={() => onMove?.(block.id, 1)}
                >
                  ↓
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${block.type}`}
                  className="px-1 rounded text-red-600 hover:bg-red-100"
                  onClick={() => onDelete?.(block.id)}
                >
                  ✕
                </button>
              </span>
            </div>
          );
        })}
      </div>

      {adding ? (
        <div className="flex space-x-2 items-center mt-2">
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value as BlockName)}
            className="border p-1 flex-1"
          >
            {ALL_BLOCKS.map((block) => (
              <option key={block.name} value={block.name}>
                {block.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleAdd}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Add
          </button>
          <button
            onClick={() => setAdding(false)}
            className="px-3 py-1 rounded border"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="mt-2 w-full text-center bg-blue-500 text-white rounded p-2"
        >
          + Add Block
        </button>
      )}
    </div>
  );
};
