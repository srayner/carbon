import { Page } from "@/types/entities";
import { Block, SharedBlockProps } from "@/types/blocks";
import CardView from "@/components/Block/CardView";
import { loadViews } from "@/components/Block/views";
import { getBlockStyle } from "@/lib/block-style";
import { getTokenStyle } from "@/lib/block-tokens";

interface RendererProps {
  page: Page;
}

// The id, class and inline style every block gets, worked out once here
const getSharedProps = (block: Block): SharedBlockProps => {
  const properties = block.properties as Record<string, unknown>;
  return {
    id: (properties.cssId as string) || undefined,
    className: (properties.className as string) || undefined,
    // Theme tokens first; a raw value changed from its default overrides them
    style: {
      ...getTokenStyle(properties),
      ...getBlockStyle(block.type, properties),
    },
  };
};

type RenderItem =
  | { kind: "block"; block: Block }
  | { kind: "cards"; cards: Block<"Card">[] };

// Consecutive Card blocks are shown together in one grid
const groupBlocks = (blocks: Block[]): RenderItem[] => {
  const items: RenderItem[] = [];
  for (const block of blocks) {
    const last = items[items.length - 1];
    if (block.type === "Card") {
      if (last?.kind === "cards") last.cards.push(block);
      else items.push({ kind: "cards", cards: [block] });
    } else {
      items.push({ kind: "block", block });
    }
  }
  return items;
};

export const BlocksView = async ({
  blocks,
  currentPageId,
}: {
  blocks: Block[];
  currentPageId?: string | null;
}) => {
  const views = await loadViews(blocks.map((block) => block.type));

  return (
    <>
      {groupBlocks(blocks).map((item) => {
        if (item.kind === "cards") {
          return (
            <div
              key={item.cards[0].id}
              className="not-prose my-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {item.cards.map((card) => (
                <CardView
                  key={card.id}
                  block={card}
                  style={getSharedProps(card).style}
                />
              ))}
            </div>
          );
        }

        const View = views.get(item.block.type);
        if (!View) return null;
        return (
          <View
            key={item.block.id}
            block={item.block}
            shared={getSharedProps(item.block)}
            currentPageId={currentPageId}
          />
        );
      })}
    </>
  );
};

const Renderer: React.FC<RendererProps> = ({ page }) => {
  return (
    <>
      <h1>{page.title}</h1>
      <BlocksView blocks={page.blocks} currentPageId={page.id} />
    </>
  );
};

export default Renderer;
