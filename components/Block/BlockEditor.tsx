"use client";

import React, { Suspense, useState } from "react";
import { Block } from "@/types/blocks";
import EditorSidebar from "@/components/EditorSidebar";
import { BlockOutline } from "@/components/Block/BlockOutline";
import { getEditable } from "@/components/Block/editables";
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

  // Merge a patch into one block's properties
  const handleBlockPropsChanged = (
    blockId: string,
    patch: Record<string, unknown>
  ) => {
    onBlocksChange((current) =>
      current.map((block) =>
        block.id === blockId
          ? ({
              ...block,
              properties: { ...block.properties, ...patch },
            } as Block)
          : block
      )
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
    handleBlockPropsChanged(selectedBlockId, updatedProperties);
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

      {/* The canvas shows the page as the site will: the site theme, in both
          light and dark mode of the admin UI */}
      <div className="site-theme light min-w-0 flex-1 overflow-y-auto">
        <div className="p-5 prose max-w-none">
          {blocks.map((block) => {
            const isSelected = block.id === selectedBlockId;

            const Editable = getEditable(block.type);
            if (!Editable) return null;

            return (
              <div
                key={block.id}
                className="relative mr-10"
                onClick={() => handleBlockSelected(block)}
              >
                <Suspense fallback={null}>
                  <Editable
                    block={block}
                    onChange={(patch) =>
                      handleBlockPropsChanged(block.id, patch)
                    }
                  />
                </Suspense>
                {isSelected && (
                  <div className="absolute -inset-1 pointer-events-none border-2 border-ring"></div>
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
