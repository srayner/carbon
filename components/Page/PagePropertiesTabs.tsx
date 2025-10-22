import { Block } from "@/types/blocks";
import { ALL_BLOCKS } from "@/config/blocks";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BlockPropertyEditor from "@/components/Block/BlockPropertyEditor";

interface PagePropertiesTabsProps {
  selectedBlock: Block | null;
  activeTab?: "page" | "block";
  onTabChange?: (tab: "page" | "block") => void;
  onBlockChange: (updatedProperties: Record<string, string>) => void;
}

export function PagePropertiesTabs({
  selectedBlock,
  activeTab,
  onTabChange,
  onBlockChange,
}: PagePropertiesTabsProps) {
  return (
    <Tabs
      onValueChange={(value) => onTabChange?.(value as "page" | "block")}
      className="flex flex-col h-full"
      defaultValue="page"
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
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-muted-foreground">Status:</span>
                <span className="text-sm font-medium text-blue-600">Draft</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Publish Date:
                </span>
                <span className="text-sm font-medium">22 Oct 2025</span>
              </div>
              <button className="mt-2 px-2 py-1 text-xs rounded bg-blue-500 text-white hover:bg-blue-600">
                Edit / Schedule
              </button>
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
