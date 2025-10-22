"use client";

import React, { useEffect, useState } from "react";
import { Block } from "@/types/blocks";
import { usePageActions } from "@/context/page-actions";
import EditorSidebar from "@/components/EditorSidebar";
import { BlockOutline } from "@/components/Block/BlockOutline";
import HeadingPreview from "@/components/Block/HeadlingPreview";
import ParagraphEditable from "@/components/Block/ParagraphEditable";
import RichTextEditable from "@/components/Block/RichTextEditable";
import { PagePropertiesTabs } from "@/components/Page/PagePropertiesTabs";

type PageEditorProps = {
  pageId?: string; // undefined for add mode
};

const PageEditor: React.FC<PageEditorProps> = ({ pageId }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const { setPageActions } = usePageActions();

  const handleAdd = () => console.log("Add clicked");
  const handleSave = async () => {
    const timestamp = Date.now();
    const page = {
      title: `Demo Page ${timestamp}`,
      slug: `demo-page-${timestamp}`,
      meta: {},
      blocks,
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    try {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(page),
      });

      await res.json();
      alert("Page saved successfully!");
    } catch (err) {
      console.error("Save failed:", err);
      alert("Save failed! Check console.");
    }
  };

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
  }, [blocks]);

  const handleBlockContentChanged = (blockId: string, content: string) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === blockId
          ? {
              ...block,
              properties: { ...block.properties, content },
            }
          : block
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

  const handleBlockChange = (updatedProperties: Record<string, string>) => {
    setBlocks((prevBlocks) =>
      prevBlocks.map((block) =>
        block.id === selectedBlockId
          ? { ...block, properties: updatedProperties }
          : block
      )
    );
  };

  const selectedBlock = blocks.find((bl) => bl.id === selectedBlockId) || null;

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
        <PagePropertiesTabs
          selectedBlock={selectedBlock}
          onBlockChange={handleBlockChange}
        />
      </EditorSidebar>
    </div>
  );
};

export default PageEditor;
