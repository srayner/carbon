"use client";

import React, { useState } from "react";
import { Block, BlockName, BlockPropsMap } from "@/types/blocks";
import EditorSidebar from "@/components/EditorSidebar";
import { BlockOutline } from "@/components/Block/BlockOutline";
import ParagraphEditable from "@/components/Block/ParagraphEditable";
import RichTextEditable from "@/components/Block/RichTextEditable";
import HeadingEditable from "@/components/Block/HeadingEditable";
import ImageEditable from "@/components/Block/ImageEditable";
import FileEditable from "@/components/Block/FileEditable";
import CardView from "@/components/Block/CardView";
import { PagePropertiesTabs } from "@/components/Page/PagePropertiesTabs";

type BlockEditorProps = {
  blocks: Block[];
  onBlocksChange: (update: (blocks: Block[]) => Block[]) => void;
  // The first properties tab, for whatever owns the blocks (a page, a fragment)
  settingsLabel: string;
  settings: React.ReactNode;
};

/**
 * The block outline, canvas and properties panel, shared by the page and
 * fragment editors. The owner keeps the blocks and supplies its own settings.
 */
const BlockEditor: React.FC<BlockEditorProps> = ({
  blocks,
  onBlocksChange,
  settingsLabel,
  settings,
}) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectionCount, setSelectionCount] = useState(0);

  function updateBlockProps<K extends BlockName>(
    current: Block[],
    blockId: string,
    newProps: Partial<BlockPropsMap[K]>
  ): Block[] {
    return current.map((block) =>
      block.id === blockId
        ? ({ ...block, properties: { ...block.properties, ...newProps } } as Block)
        : block
    );
  }

  const handleBlockContentChanged = (blockId: string, content: string) => {
    onBlocksChange((current) =>
      current.map((block) => {
        if (block.id !== blockId) return block;

        // explicit switch to give TS a single-literal narrowing
        switch (block.type) {
          case "Heading":
            return {
              ...block,
              properties: {
                ...block.properties,
                content,
              } as BlockPropsMap["Heading"],
            };
          case "Paragraph":
            return {
              ...block,
              properties: {
                ...block.properties,
                content,
              } as BlockPropsMap["Paragraph"],
            };
          case "RichText":
            return {
              ...block,
              properties: {
                ...block.properties,
                content,
              } as BlockPropsMap["RichText"],
            };
          default:
            return block; // Image and other types remain unchanged
        }
      })
    );
  };

  const handleBlockAdded = (block: Block) => {
    onBlocksChange((current) => {
      if (current.some((b) => b.id === block.id)) {
        console.error(
          "handleBlockAdded: duplicate block id detected — not adding",
          block.id
        );
        return current;
      }

      return [...current, block];
    });

    setSelectedBlockId(block.id);
  };

  const handleBlockSelected = (block: Block) => {
    setSelectedBlockId(block.id);
    // Counts every selection, even of the block that is already selected
    setSelectionCount((count) => count + 1);
  };

  const handleBlockChange = (updatedProperties: Record<string, string>) => {
    if (!selectedBlockId) return; // nothing selected
    onBlocksChange((current) =>
      updateBlockProps(current, selectedBlockId, updatedProperties)
    );
  };

  const handleBlockMoved = (blockId: string, direction: -1 | 1) => {
    onBlocksChange((current) => {
      const index = current.findIndex((b) => b.id === blockId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) {
        return current;
      }
      const moved = [...current];
      [moved[index], moved[target]] = [moved[target], moved[index]];
      return moved;
    });
  };

  const handleBlockDeleted = (blockId: string) => {
    onBlocksChange((current) => current.filter((b) => b.id !== blockId));
    setSelectedBlockId((current) => (current === blockId ? null : current));
  };

  const selectedBlock = blocks.find((bl) => bl.id === selectedBlockId) || null;

  return (
    <div className="flex h-full w-full">
      {/* Left sidebar */}
      <EditorSidebar side="left">
        <BlockOutline
          blocks={blocks}
          onAdd={handleBlockAdded}
          onSelect={handleBlockSelected}
          onMove={handleBlockMoved}
          onDelete={handleBlockDeleted}
          selectedBlockId={selectedBlockId}
        />
      </EditorSidebar>

      <div className="flex-1">
        <div className="p-5 prose max-w-none">
          {blocks.map((block) => {
            const isSelected = block.id === selectedBlockId;

            let content: React.ReactNode = null;
            switch (block.type) {
              case "Heading":
                content = (
                  <HeadingEditable
                    heading={block}
                    onUpdate={handleBlockContentChanged}
                  />
                );
                break;
              case "Paragraph":
                content = (
                  <ParagraphEditable
                    paragraph={block}
                    onUpdate={handleBlockContentChanged}
                  />
                );
                break;
              case "Image":
                content = <ImageEditable image={block} />;
                break;
              case "File":
                content = <FileEditable file={block} />;
                break;
              case "Card":
                content = (
                  <div className="max-w-xs">
                    <CardView card={block} />
                  </div>
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
              <div
                key={block.id}
                className="relative mr-10"
                onClick={() => handleBlockSelected(block)}
              >
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
        <PagePropertiesTabs
          selectedBlock={selectedBlock}
          selectionCount={selectionCount}
          settingsLabel={settingsLabel}
          settings={settings}
          onBlockChange={handleBlockChange}
        />
      </EditorSidebar>
    </div>
  );
};

export default BlockEditor;
