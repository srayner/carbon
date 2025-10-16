"use client";

import React, { useState } from "react";
import { ALL_BLOCKS } from "@/config/blocks";
import BlockPropertyEditor from "@/components/Block/BlockPropertyEditor";
import { BlockConfig, BlockData, Block } from "@/types/blocks";
import {
  BlockOutline,
  BlockOutlineBlock,
} from "@/components/Block/BlockOutline";
import HeadingPreview, {
  isHeadingBlock,
} from "@/components/Block/HeadlingPreview";

const BlockDemoPage = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const handleBlockAdded = (block: BlockOutlineBlock) => {
    const config = ALL_BLOCKS.find((b) => b.name === block.type);
    if (!config) return;

    const defaultData: BlockData = {};
    config.properties.forEach((p) => {
      defaultData[p.name] = p.default ?? "";
    });

    setBlocks((prev) => [
      ...prev,
      {
        id: block.id,
        type: block.type,
        data: defaultData,
      },
    ]);

    setSelectedBlockId(block.id);
  };

  const handleBlockSelected = (block: BlockOutlineBlock) => {
    setSelectedBlockId(block.id);
  };

  const handleBlockChange = (newBlockData: BlockData) => {
    if (!selectedBlockId) return;

    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === selectedBlockId
          ? { ...block, data: { ...block.data, ...newBlockData } }
          : block
      )
    );
  };

  return (
    <div className="flex h-screen">
      <BlockOutline onAdd={handleBlockAdded} onSelect={handleBlockSelected} />

      <div className="flex-1 border-l border-r p-5 prose">
        {blocks.map((block) => {
          if (isHeadingBlock(block)) {
            return <HeadingPreview key={block.id} block={block} />;
          }
          return null;
        })}
      </div>

      {/* Property editor */}
      {selectedBlockId && (
        <BlockPropertyEditor
          blockConfig={
            ALL_BLOCKS.find(
              (b) =>
                b.name === blocks.find((bl) => bl.id === selectedBlockId)?.type
            )!
          }
          blockData={blocks.find((bl) => bl.id === selectedBlockId)?.data!}
          onChange={handleBlockChange}
        />
      )}
    </div>
  );
};

export default BlockDemoPage;
