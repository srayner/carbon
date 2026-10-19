"use client";

import { useEffect, useState } from "react";
import { Block } from "@/types/blocks";
import { ALL_BLOCKS } from "@/config/blocks";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BlockPropertyEditor from "@/components/Block/BlockPropertyEditor";
import { getPageStatus, PageStatus } from "@/lib/page-status";
import { CategoryRow } from "@/lib/category-tree";

interface PagePropertiesTabsProps {
  selectedBlock: Block | null;
  selectionCount: number;
  title: string;
  slug: string;
  publishedAt: Date | null;
  categories: CategoryRow[];
  categoryIds: string[];
  onCategoryIdsChange: (categoryIds: string[]) => void;
  onTitleChange: (title: string) => void;
  onSlugChange: (slug: string) => void;
  onTabChange?: (tab: "page" | "block") => void;
  onBlockChange: (updatedProperties: Record<string, string>) => void;
  onPublishedAtChange: (publishedAt: Date | null) => void;
}

const STATUS_LABELS: Record<PageStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  live: "Live",
};

const STATUS_STYLES: Record<PageStatus, string> = {
  draft: "text-gray-600",
  scheduled: "text-amber-600",
  live: "text-green-600",
};

// <input type="datetime-local"> wants "YYYY-MM-DDTHH:mm" in local time
const toLocalInputValue = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

const formatDateTime = (date: Date) =>
  date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

export function PagePropertiesTabs({
  selectedBlock,
  selectionCount,
  title,
  slug,
  publishedAt,
  categories,
  categoryIds,
  onCategoryIdsChange,
  onTitleChange,
  onSlugChange,
  onTabChange,
  onBlockChange,
  onPublishedAtChange,
}: PagePropertiesTabsProps) {
  const status = getPageStatus(publishedAt);
  const [scheduling, setScheduling] = useState(false);
  const [draftDate, setDraftDate] = useState("");
  const [tab, setTab] = useState<"page" | "block">("page");

  // Show the block's properties whenever a block is selected (including
  // selecting the same block again), and go back to the page properties
  // when nothing is selected
  const selectedBlockId = selectedBlock?.id;
  useEffect(() => {
    setTab(selectedBlockId ? "block" : "page");
  }, [selectedBlockId, selectionCount]);

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => {
        setTab(value as "page" | "block");
        onTabChange?.(value as "page" | "block");
      }}
      className="flex flex-col h-full"
    >
      {/* Tab headers */}
      <TabsList>
        <TabsTrigger value="page">Page</TabsTrigger>
        <TabsTrigger value="block" disabled={!selectedBlock}>
          Block
        </TabsTrigger>
      </TabsList>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        <TabsContent value="page">
          <div className="flex flex-col gap-4 p-2">
            {/* Publishing Info */}
            <section className="p-3 border rounded-md bg-background">
              <h2 className="text-sm font-semibold mb-2">Publishing</h2>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span
                  className={`text-sm font-medium ${STATUS_STYLES[status]}`}
                >
                  {STATUS_LABELS[status]}
                </span>
              </div>
              {publishedAt && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground">
                    {status === "scheduled" ? "Goes live:" : "Live since:"}
                  </span>
                  <span className="text-sm font-medium">
                    {formatDateTime(publishedAt)}
                  </span>
                </div>
              )}
              {scheduling ? (
                <div>
                  <input
                    type="datetime-local"
                    className="w-full border rounded px-2 py-1 text-sm"
                    value={draftDate}
                    onChange={(e) => setDraftDate(e.target.value)}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
                      disabled={!draftDate}
                      onClick={() => {
                        onPublishedAtChange(new Date(draftDate));
                        setScheduling(false);
                      }}
                    >
                      Set
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 text-xs rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
                      onClick={() => setScheduling(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600"
                    onClick={() => onPublishedAtChange(new Date())}
                  >
                    Publish now
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 text-xs rounded bg-gray-300 text-gray-700 hover:bg-gray-400"
                    onClick={() => {
                      setDraftDate(
                        publishedAt ? toLocalInputValue(publishedAt) : ""
                      );
                      setScheduling(true);
                    }}
                  >
                    Schedule…
                  </button>
                  <button
                    type="button"
                    className="px-2 py-1 text-xs rounded bg-gray-300 text-gray-700 hover:bg-gray-400 disabled:opacity-50"
                    disabled={!publishedAt}
                    onClick={() => onPublishedAtChange(null)}
                  >
                    Unpublish
                  </button>
                </div>
              )}
            </section>

            {/* Title and slug */}
            <section className="p-3 border rounded-md bg-background">
              <h2 className="text-sm font-semibold mb-2">Page</h2>
              <label className="block text-sm text-muted-foreground mb-1">
                Title
              </label>
              <input
                className="w-full border rounded px-2 py-1 text-sm mb-3"
                value={title}
                placeholder="Page title"
                onChange={(e) => onTitleChange(e.target.value)}
              />
              <label className="block text-sm text-muted-foreground mb-1">
                Slug
              </label>
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">/</span>
                <input
                  className="w-full border rounded px-2 py-1 text-sm"
                  value={slug}
                  placeholder="page-slug"
                  onChange={(e) => onSlugChange(e.target.value)}
                />
              </div>
            </section>

            {/* Categories */}
            <section className="p-3 border rounded-md bg-background">
              <h2 className="text-sm font-semibold mb-2">Categories</h2>
              {categories.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No categories yet.
                </p>
              ) : (
                <div className="flex flex-col gap-1 max-h-64 overflow-auto">
                  {categories.map((category) => (
                    <label
                      key={category.id}
                      className={`flex items-center gap-2 text-sm ${
                        category.isEffectivelyActive ? "" : "text-gray-400"
                      }`}
                      style={{ paddingLeft: `${(category.depth - 1) * 1}rem` }}
                    >
                      <input
                        type="checkbox"
                        checked={categoryIds.includes(category.id)}
                        onChange={(e) =>
                          onCategoryIdsChange(
                            e.target.checked
                              ? [...categoryIds, category.id]
                              : categoryIds.filter((id) => id !== category.id)
                          )
                        }
                      />
                      {category.name}
                      {!category.isEffectivelyActive && (
                        <span className="text-xs">(inactive)</span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </section>
          </div>
        </TabsContent>

        <TabsContent value="block">
          {selectedBlock ? (
            <BlockPropertyEditor
              blockConfig={
                ALL_BLOCKS.find((b) => b.name === selectedBlock.type)!
              }
              blockData={selectedBlock.properties}
              onChange={onBlockChange}
            />
          ) : (
            <div className="text-gray-500 text-sm italic">
              No block selected
            </div>
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
}
