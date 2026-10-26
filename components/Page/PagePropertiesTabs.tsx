"use client";

import { useEffect, useState } from "react";
import { Block } from "@/types/blocks";
import { ALL_BLOCKS } from "@/config/blocks";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BlockPropertyEditor from "@/components/Block/BlockPropertyEditor";

interface PagePropertiesTabsProps {
  selectedBlock: Block | null;
  selectionCount: number;
  // The first tab: settings for whatever is being edited (a page, a fragment)
  settingsLabel: string;
  settings: React.ReactNode;
  onTabChange?: (tab: "page" | "block") => void;
  onBlockChange: (updatedProperties: Record<string, string>) => void;
}

export function PagePropertiesTabs({
  selectedBlock,
  selectionCount,
  settingsLabel,
  settings,
  onTabChange,
  onBlockChange,
}: PagePropertiesTabsProps) {
  const [tab, setTab] = useState<"page" | "block">("page");

  // Show the block's properties whenever a block is selected (including
  // selecting the same block again), and go back to the settings
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
        <TabsTrigger value="page">{settingsLabel}</TabsTrigger>
        <TabsTrigger value="block" disabled={!selectedBlock}>
          Block
        </TabsTrigger>
      </TabsList>

      {/* Tab content */}
      <div className="flex-1 overflow-auto">
        <TabsContent value="page">{settings}</TabsContent>

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
            <div className="text-muted-foreground text-sm italic">
              No block selected
            </div>
          )}
        </TabsContent>
      </div>
    </Tabs>
  );
}
