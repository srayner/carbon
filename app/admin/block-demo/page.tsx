"use client";

import React, { useEffect, useState } from "react";
import { ALL_BLOCKS } from "@/config/blocks";
import { Block } from "@/types/blocks";
import { usePageActions } from "@/context/page-actions";
import EditorSidebar from "@/components/EditorSidebar";
import BlockPropertyEditor from "@/components/Block/BlockPropertyEditor";
import { BlockOutline } from "@/components/Block/BlockOutline";
import HeadingPreview from "@/components/Block/HeadlingPreview";
import ParagraphEditable from "@/components/Block/ParagraphEditable";
import RichTextEditable from "@/components/Block/RichTextEditable";

const BlockDemoPage = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const { setPageActions } = usePageActions();

  const handleAdd = () => console.log("Add clicked");
  const handleSave = () => console.log("Save clicked");

  useEffect(() => {
    setPageActions({
      showEditorSidebars: true,
      showAddButton: true,
      showSaveButton: true,
      onAdd: handleAdd,
      onSave: handleSave,
    });

    return () => {
      // reset buttons when leaving page
      setPageActions({
        showEditorSidebars: false,
        showAddButton: false,
        showSaveButton: false,
        onAdd: undefined,
        onSave: undefined,
      });
    };
  }, []);

  const handleBlockContentChanged = (blockId: string, content: string) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === blockId ? { ...block, content } : block
      )
    );
  };

  const handleBlockAdded = (block: Block) => {
    setBlocks((prev) => {
      if (prev.some((b) => b.id === block.id)) {
        console.error(
          "handleBlockAdded: duplicate block id detected — not adding",
          block.id
        );
        return prev;
      }

      return [...prev, block];
    });

    setSelectedBlockId(block.id);
  };

  const handleBlockSelected = (block: Block) => {
    setSelectedBlockId(block.id);
  };

  const handleBlockChange = (updatedBlock: Block) => {
    setBlocks((prevBlocks) => {
      const existing = prevBlocks.find((b) => b.id === updatedBlock.id);
      if (existing && existing.type !== updatedBlock.type) {
        console.warn(
          "handleBlockChange: block type mismatch — preserving original type",
          { id: updatedBlock.id, from: existing.type, attempted: updatedBlock.type }
        );

        const merged: Block = { ...updatedBlock, id: existing.id, type: existing.type } as Block;
        return prevBlocks.map((b) => (b.id === updatedBlock.id ? merged : b));
      }

      return prevBlocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b));
    });
  };

  return (
    <div className="flex h-full w-full">
      {/* Left sidebar */}
      <EditorSidebar side="left">
        <BlockOutline onAdd={handleBlockAdded} onSelect={handleBlockSelected} />
      </EditorSidebar>

      <div className="flex-1">
        <div className="p-5 prose max-w-none">
          {blocks.map((block) => {
            const isSelected = block.id === selectedBlockId;
            const wrapperClass = isSelected
              ? "border-2 border-blue-500 p-2"
              : "p-2";

            let content: React.ReactNode = null;
            switch (block.type) {
              case "Heading":
                content = <HeadingPreview block={block} />;
                break;
              case "Paragraph":
                content = (
                  <ParagraphEditable
                    paragraph={block}
                    onUpdate={handleBlockContentChanged}
                  />
                );
                break;
              case "RichText":
                content = (
                  <RichTextEditable
                    richText={block}
                    onUpdate={handleBlockContentChanged}
                  />
                );
                break;
            }

            if (!content) return null;

            return (
              <div key={block.id} className="relative mr-10">
                {content}
                {isSelected && (
                  <div className="absolute -inset-1 pointer-events-none border-2 border-blue-500"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Sidebar */}
      <EditorSidebar side="right">
        {selectedBlockId && (
          <BlockPropertyEditor
            blockConfig={
              ALL_BLOCKS.find(
                (b) =>
                  b.name ===
                  blocks.find((bl) => bl.id === selectedBlockId)?.type
              )!
            }
            blockData={blocks.find((bl) => bl.id === selectedBlockId)}
            onChange={handleBlockChange}
          />
        )}
      </EditorSidebar>
    </div>
  );
};

export default BlockDemoPage;
