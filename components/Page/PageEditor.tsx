"use client";

import React, { useEffect, useState } from "react";
import { Block, BlockName, BlockPropsMap } from "@/types/blocks";
import { usePageActions } from "@/context/page-actions";
import EditorSidebar from "@/components/EditorSidebar";
import { BlockOutline } from "@/components/Block/BlockOutline";
import ParagraphEditable from "@/components/Block/ParagraphEditable";
import RichTextEditable from "@/components/Block/RichTextEditable";
import { PagePropertiesTabs } from "@/components/Page/PagePropertiesTabs";
import { fetchPage, savePage } from "@/lib/api/pages";
import HeadingEditable from "../Block/HeadingEditable";
import { Page } from "@/types/entities";

type PageEditorProps = {
  pageId?: string; // undefined for add mode
  afterSave?: (pageId: string) => void;
};

const PageEditor: React.FC<PageEditorProps> = ({ pageId, afterSave }) => {
  const timestamp = Date.now();
  const [page, setPage] = useState<Page>({
    id: "",
    title: `Demo Page ${timestamp}`,
    slug: `demo-page-${timestamp}`,
    blocks: [],
    meta: null,
    publishedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const { setPageActions } = usePageActions();

  useEffect(() => {
    if (!pageId) return; // nothing to load in add mode

    const loadPage = async () => {
      try {
        const loadedPage = await fetchPage(pageId);
        setPage(loadedPage);
      } catch (err) {
        console.error("Failed to load page:", err);
        alert("Failed to load page content.");
      }
    };

    loadPage();
  }, [pageId]);

  useEffect(() => {
    const handleAdd = () => console.log("Add clicked");
    const handleSave = async () => {
      try {
        const newPage = await savePage(page);
        afterSave?.(newPage.id!);
      } catch (err) {
        console.error("Save failed:", err);
        alert("Save failed! Check console.");
      }
    };

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
  }, [page, setPageActions, afterSave]);

  function updateBlockProps<K extends BlockName>(
    page: Page,
    blockId: string,
    newProps: Partial<BlockPropsMap[K]>
  ): Page {
    return {
      ...page,
      blocks: page.blocks.map((block) => {
        if (block.id !== blockId) return block;

        switch (block.type) {
          case "Heading":
            return {
              ...block,
              properties: {
                ...block.properties,
                ...newProps,
              } as BlockPropsMap["Heading"],
            };
          case "Paragraph":
            return {
              ...block,
              properties: {
                ...block.properties,
                ...newProps,
              } as BlockPropsMap["Paragraph"],
            };
          case "RichText":
            return {
              ...block,
              properties: {
                ...block.properties,
                ...newProps,
              } as BlockPropsMap["RichText"],
            };
          case "Image":
            return {
              ...block,
              properties: {
                ...block.properties,
                ...newProps,
              } as BlockPropsMap["Image"],
            };
          default:
            return block;
        }
      }),
    };
  }

  const handleBlockContentChanged = (blockId: string, content: string) => {
    setPage((prevPage) => {
      if (!prevPage) return prevPage; // safety check

      return {
        ...prevPage,
        blocks: prevPage.blocks.map((block) => {
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
        }),
      };
    });
  };

  const handleBlockAdded = (block: Block) => {
    setPage((prevPage) => {
      if (!prevPage) return prevPage; // safety check

      if (prevPage.blocks.some((b) => b.id === block.id)) {
        console.error(
          "handleBlockAdded: duplicate block id detected — not adding",
          block.id
        );
        return prevPage;
      }

      return {
        ...prevPage,
        blocks: [...prevPage.blocks, block],
      };
    });

    setSelectedBlockId(block.id);
  };

  const handleBlockSelected = (block: Block) => {
    setSelectedBlockId(block.id);
  };

  const handleBlockChange = (updatedProperties: Record<string, string>) => {
    if (!selectedBlockId) return; // nothing selected
    setPage((prevPage) => {
      if (!prevPage) return prevPage;

      return updateBlockProps(prevPage, selectedBlockId, updatedProperties);
    });
  };

  const selectedBlock =
    page.blocks.find((bl) => bl.id === selectedBlockId) || null;

  return (
    <div className="flex h-full w-full">
      {/* Left sidebar */}
      <EditorSidebar side="left">
        <BlockOutline
          blocks={page.blocks}
          onAdd={handleBlockAdded}
          onSelect={handleBlockSelected}
        />
      </EditorSidebar>

      <div className="flex-1">
        <div className="p-5 prose max-w-none">
          {page.blocks.map((block) => {
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
