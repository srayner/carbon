"use client";

import React, { Suspense, useState } from "react";
import { Block } from "@/types/blocks";
import EditorSidebar from "@/components/EditorSidebar";
import { BlockOutline } from "@/components/Block/BlockOutline";
import { getEditable } from "@/components/Block/editables";
import { PagePropertiesTabs } from "@/components/Page/PagePropertiesTabs";
import {
  BlockNode,
  BlockPlace,
  buildTree,
  insertBlock,
  isContainerType,
  moveBlock,
  moveBlockTo,
  removeBlock,
  subtreeIds,
} from "@/lib/block-tree";
import { getGrowStyle, isInlineContainer } from "@/lib/container-style";

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

  // Adds to the end of a container, or of the page when parentId is null
  const handleBlockAdded = (block: Block, parentId: string | null) => {
    onBlocksChange((current) => {
      if (current.some((b) => b.id === block.id)) {
        console.error(
          "handleBlockAdded: duplicate block id detected — not adding",
          block.id
        );
        return current;
      }
      if (parentId && !current.some((b) => b.id === parentId)) {
        console.error(
          "handleBlockAdded: container is no longer on the page — not adding",
          parentId
        );
        return current;
      }

      return insertBlock(current, block, parentId);
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

  // Among its siblings, taking anything inside it along
  const handleBlockMoved = (blockId: string, direction: -1 | 1) => {
    onBlocksChange((current) => moveBlock(current, blockId, direction));
  };

  // Dragged in the outline, taking anything inside it along; a block that
  // really moved is selected
  const handleBlockMovedTo = (blockId: string, place: BlockPlace) => {
    if (moveBlockTo(blocks, blockId, place) === blocks) return;
    onBlocksChange((current) => moveBlockTo(current, blockId, place));
    setSelectedBlockId(blockId);
  };

  // A container goes with everything inside it, after a confirm
  const handleBlockDeleted = (blockId: string) => {
    const block = blocks.find((b) => b.id === blockId);
    const removed = subtreeIds(blocks, blockId);
    const inside = removed.size - 1;
    if (
      inside > 0 &&
      !window.confirm(
        `Delete this ${block?.type ?? "block"} and the ${inside} ${
          inside === 1 ? "block" : "blocks"
        } inside it?`
      )
    ) {
      return;
    }
    onBlocksChange((current) => removeBlock(current, blockId));
    setSelectedBlockId((current) =>
      current && removed.has(current) ? null : current
    );
  };

  const selectedBlock = blocks.find((bl) => bl.id === selectedBlockId) || null;

  // Each block in a frame that selects it; a container's children are drawn
  // inside its Editable, each in its own frame. Inside a span the frames are
  // inline spans, so the children flow as they will on the site.
  const renderNodes = (nodes: BlockNode<Block>[], inline = false): React.ReactNode =>
    nodes.map(({ block, depth, children }) => {
      const Editable = getEditable(block.type);
      if (!Editable) return null;
      const isSelected = block.id === selectedBlockId;
      const Frame = inline ? "span" : "div";

      return (
        <Frame
          key={block.id}
          data-block-id={block.id}
          // Inside a div container the frame is the flex item, so it takes the Grow
          className={
            inline ? "relative" : depth === 0 ? "relative mr-10" : "relative block-item"
          }
          style={inline || depth === 0 ? undefined : getGrowStyle(block.properties)}
          onClick={(e) => {
            // The innermost block clicked is the one selected
            e.stopPropagation();
            handleBlockSelected(block);
          }}
        >
          <Suspense fallback={null}>
            <Editable
              block={block}
              onChange={(patch) => handleBlockPropsChanged(block.id, patch)}
            >
              {isContainerType(block.type) && children.length > 0
                ? renderNodes(children, isInlineContainer(block.properties))
                : undefined}
            </Editable>
          </Suspense>
          {isSelected && (
            <span className="absolute -inset-1 pointer-events-none border-2 border-ring"></span>
          )}
        </Frame>
      );
    });

  return (
    <div className="flex h-full w-full">
      {/* Left sidebar */}
      <EditorSidebar side="left">
        <BlockOutline
          blocks={blocks}
          onAdd={handleBlockAdded}
          onSelect={handleBlockSelected}
          onMove={handleBlockMoved}
          onMoveTo={handleBlockMovedTo}
          onDelete={handleBlockDeleted}
          selectedBlockId={selectedBlockId}
        />
      </EditorSidebar>

      {/* The canvas shows the page as the site will: the site theme, in both
          light and dark mode of the admin UI */}
      <div className="site-theme light min-w-0 flex-1 overflow-y-auto">
        <div className="p-5 prose max-w-none">
          {renderNodes(buildTree(blocks))}
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
