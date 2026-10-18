import { Page } from "@/types/entities";
import { Block, CardBlock } from "@/types/blocks";
import CardView from "@/components/Block/CardView";
import { getBlockStyle } from "@/lib/block-style";
import { sanitizeRichText } from "@/lib/sanitize";

interface RendererProps {
  page: Page;
}

const HEADING_LEVELS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
type HeadingLevel = (typeof HEADING_LEVELS)[number];

const RenderBlock: React.FC<{ block: Block }> = ({ block }) => {
  const properties = block.properties as Record<string, unknown>;
  const style = getBlockStyle(block.type, properties);
  const className = (properties.className as string) || undefined;
  const id = (properties.cssId as string) || undefined;

  switch (block.type) {
    case "Heading": {
      const level = block.properties.level;
      const Tag: HeadingLevel = HEADING_LEVELS.includes(level as HeadingLevel)
        ? (level as HeadingLevel)
        : "h2";
      return (
        <Tag id={id} className={className} style={style}>
          {block.properties.content}
        </Tag>
      );
    }
    case "Paragraph":
      return (
        <p id={id} className={className} style={style}>
          {block.properties.content}
        </p>
      );
    case "RichText":
      return (
        <div
          id={id}
          className={className}
          style={style}
          dangerouslySetInnerHTML={{
            __html: sanitizeRichText(block.properties.content ?? ""),
          }}
        />
      );
    case "Image": {
      const { src, alt, caption, width, height, objectFit, alignment } =
        block.properties;
      if (!src) return null;
      return (
        <figure
          id={id}
          className={className}
          style={{ ...style, textAlign: alignment || "center" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt ?? ""}
            style={{
              display: "inline-block",
              width: width || "100%",
              height: height || "auto",
              objectFit: objectFit || "cover",
              borderRadius: block.properties.borderRadius || undefined,
              filter: block.properties.filter || undefined,
              margin: 0,
            }}
          />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      );
    }
    case "File": {
      const { file, label, description } = block.properties;
      if (!file) return null;
      return (
        <p
          id={id}
          className={className}
          style={style}
        >
          <a
            href={file}
            download
            className="not-prose inline-flex flex-col rounded border px-4 py-3 no-underline hover:bg-muted"
          >
            <span className="font-medium">⬇ {label || "Download"}</span>
            {description && (
              <span className="text-sm text-muted-foreground">
                {description}
              </span>
            )}
          </a>
        </p>
      );
    }
    default:
      return null;
  }
};

type RenderItem =
  | { kind: "block"; block: Block }
  | { kind: "cards"; cards: CardBlock[] };

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

const Renderer: React.FC<RendererProps> = ({ page }) => {
  return (
    <>
      <h1>{page.title}</h1>
      {groupBlocks(page.blocks).map((item) =>
        item.kind === "cards" ? (
          <div
            key={item.cards[0].id}
            className="not-prose my-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {item.cards.map((card) => (
              <CardView key={card.id} card={card} />
            ))}
          </div>
        ) : (
          <RenderBlock key={item.block.id} block={item.block} />
        )
      )}
    </>
  );
};

export default Renderer;
