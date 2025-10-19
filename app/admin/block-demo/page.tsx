"use client";

import React, { useState } from "react";
import { ALL_BLOCKS } from "@/config/blocks";
import BlockPropertyEditor from "@/components/Block/BlockPropertyEditor";
import { BlockConfig, BlockData, Block } from "@/types/blocks";
import { BlockOutline } from "@/components/Block/BlockOutline";
import HeadingPreview from "@/components/Block/HeadlingPreview";
import ParagraphEditable from "@/components/Block/ParagraphEditable";
import RichTextEditable from "@/components/Block/RichTextEditable";

const BlockDemoPage = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const handleBlockContentChanged = (blockId: string, content: string) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === blockId ? { ...block, content } : block
      )
    );
  };

  const handleBlockAdded = (block: Block) => {
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
        ...defaultData,
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
        block.id === selectedBlockId ? { ...block, ...newBlockData } : block
      )
    );
  };

  return (
    <div className="flex h-screen w-full">
      <BlockOutline onAdd={handleBlockAdded} onSelect={handleBlockSelected} />

      <div className="flex-1">
        <div className="border-l border-r p-5 prose max-w-none">
          {blocks.map((block) => {
            const isSelected = block.id === selectedBlockId;
            const wrapperClass = isSelected
              ? "border-2 border-blue-500 p-2"
              : "p-2";

            let content: React.ReactNode = null;
            switch (block.type) {
              case "Heading":
                content = <HeadingPreview key={block.id} block={block} />;
                break;
              case "Paragraph":
                content = (
                  <ParagraphEditable
                    key={block.id}
                    paragraph={block}
                    onUpdate={handleBlockContentChanged}
                  />
                );
                break;
              case "RichText":
                content = (
                  <RichTextEditable
                    key={block.id}
                    richText={block}
                    onUpdate={handleBlockContentChanged}
                  />
                );
                break;
            }

            if (!content) return null;

            return (
              <div className="relative mr-10">
                {content}
                {isSelected && (
                  <div className="absolute -inset-1 pointer-events-none border-2 border-blue-500"></div>
                )}
              </div>
            );
          })}
        </div>
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
          blockData={blocks.find((bl) => bl.id === selectedBlockId)}
          onChange={handleBlockChange}
        />
      )}
    </div>
  );
};

export default BlockDemoPage;
