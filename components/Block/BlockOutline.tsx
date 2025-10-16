"use client";

import React, { useState } from "react";
import { BlockConfig } from "@/types/blocks";
import { ALL_BLOCKS } from "@/config/blocks";

export interface BlockOutlineBlock {
  id: string;
  type: string;
}

interface BlockOutlineProps {
  blocks?: BlockOutlineBlock[];
  onSelect: (block: BlockOutlineBlock) => void;
  onAdd?: (block: BlockOutlineBlock) => void;
}

export const BlockOutline: React.FC<BlockOutlineProps> = ({
  blocks: initialBlocks = [],
  onSelect,
  onAdd,
}) => {
  const [blocks, setBlocks] = useState<BlockOutlineBlock[]>(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [newType, setNewType] = useState<string>(ALL_BLOCKS[0].name);

  const handleAdd = () => {
    const newBlock: BlockOutlineBlock = {
      id: crypto.randomUUID(),
      type: newType,
    };
    const updatedBlocks = [...blocks, newBlock];
    setBlocks(updatedBlocks);
    setAdding(false);
    setNewType(ALL_BLOCKS[0].name);
    onAdd?.(newBlock);
  };

  const handleSelect = (block: BlockOutlineBlock) => {
    setSelectedBlockId(block.id);
    onSelect(block);
  };

  return (
    <div className="border p-3 w-64 space-y-2 bg-gray-50">
      <h2 className="font-bold text-lg">Blocks</h2>

      <div className="space-y-1">
        {blocks.map((block) => (
          <div
            key={block.id}
            onClick={() => handleSelect(block)}
            className={`cursor-pointer p-2 border rounded ${
              selectedBlockId === block.id
                ? "bg-blue-200 border-blue-400"
                : "bg-white"
            }`}
          >
            {block.type}
          </div>
        ))}
      </div>

      {adding ? (
        <div className="flex space-x-2 items-center mt-2">
          <select
            value={newType}
            onChange={(e) => setNewType(e.target.value)}
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
