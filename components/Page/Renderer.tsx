import { Page } from "@/types/entities";
import { Block, SharedBlockProps } from "@/types/blocks";
import { loadViews } from "@/components/Block/views";
import { getBlockStyle } from "@/lib/block-style";
import { getTokenStyle } from "@/lib/block-tokens";
import { BlockNode, buildTree, isContainerType } from "@/lib/block-tree";
import { getGrowStyle, isInlineContainer } from "@/lib/container-style";

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

  // Inside a div container each item is wrapped in the flex item that carries
  // its Grow (see .block-item in globals.css); a span's children are not
  const renderNodes = (
    nodes: BlockNode<Block>[],
    wrapItems = false
  ): React.ReactNode[] =>
    nodes.map((node) => {
      const rendered = renderNode(node);
      if (!wrapItems || !rendered) return rendered;
      return (
        <div
          key={node.block.id}
          className="block-item"
          style={getGrowStyle(node.block.properties)}
        >
          {rendered}
        </div>
      );
    });

  const renderNode = ({ block, children }: BlockNode<Block>): React.ReactNode => {
    const View = views.get(block.type);
    if (!View) return null;
    return (
      <View
        key={block.id}
        block={block}
        shared={getSharedProps(block)}
        currentPageId={currentPageId}
      >
        {isContainerType(block.type)
          ? renderNodes(children, !isInlineContainer(block.properties))
          : undefined}
      </View>
    );
  };

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
