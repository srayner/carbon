import { Page } from "@/types/entities";
import { Block, SharedBlockProps } from "@/types/blocks";
import CardView from "@/components/Block/CardView";
import { loadViews } from "@/components/Block/views";
import { getBlockStyle } from "@/lib/block-style";
import { getTokenStyle } from "@/lib/block-tokens";
import { BlockNode, buildTree, isContainerType } from "@/lib/block-tree";

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
  | { kind: "block"; node: BlockNode<Block> }
  | { kind: "cards"; cards: Block<"Card">[] };

// Consecutive Card blocks among the same siblings are shown together in one grid
const groupBlocks = (nodes: BlockNode<Block>[]): RenderItem[] => {
  const items: RenderItem[] = [];
  for (const node of nodes) {
    const last = items[items.length - 1];
    if (node.block.type === "Card") {
      if (last?.kind === "cards") last.cards.push(node.block);
      else items.push({ kind: "cards", cards: [node.block] });
    } else {
      items.push({ kind: "block", node });
    }
  }
  return items;
};

/**
 * Renders an owner's blocks (a page's, or a fragment's) from the flat list,
 * with each container's children inside it. The views for every block type in
 * the list are loaded once, up front.
 */
export const BlocksView = async ({
  blocks,
  currentPageId,
}: {
  blocks: Block[];
  currentPageId?: string | null;
}) => {
  const views = await loadViews(blocks.map((block) => block.type));

  const renderNodes = (nodes: BlockNode<Block>[]): React.ReactNode[] =>
    groupBlocks(nodes).map((item) => {
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

      const { block, children } = item.node;
      const View = views.get(block.type);
      if (!View) return null;
      return (
        <View
          key={block.id}
          block={block}
          shared={getSharedProps(block)}
          currentPageId={currentPageId}
        >
          {isContainerType(block.type) ? renderNodes(children) : undefined}
        </View>
      );
    });

  return <>{renderNodes(buildTree(blocks))}</>;
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
