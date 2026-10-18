"use client";

import { useEffect, useState } from "react";
import { Block } from "@/types/blocks";
import { ALL_BLOCKS } from "@/config/blocks";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BlockPropertyEditor from "@/components/Block/BlockPropertyEditor";
import { getPageStatus, PageStatus } from "@/lib/page-status";

interface PagePropertiesTabsProps {
  selectedBlock: Block | null;
  selectionCount: number;
  publishedAt: Date | null;
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
  publishedAt,
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

            {/* Meta Data */}
            <section className="p-3 border rounded-md bg-background">
              <h2 className="text-sm font-semibold mb-2">Meta Data</h2>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Title:</span>
                <span className="text-sm font-medium">My Cool Page</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Slug:</span>
                <span className="text-sm font-medium">/my-cool-page</span>
              </div>
              <button className="mt-2 px-2 py-1 text-xs rounded bg-gray-300 text-gray-700 hover:bg-gray-400">
                Edit Metadata
              </button>
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
