import { Page } from "@/types/entities";
import { Block } from "@/types/blocks";

interface RendererProps {
  page: Page;
}

const Renderer: React.FC<RendererProps> = ({ page }) => {
  return (
    <>
      <h1>{page.title}</h1>
      {page.blocks.map((block: Block) => {
        switch (block.type) {
          case "Heading":
            return <h2 key={block.id}>{block.properties.content}</h2>;
          case "Paragraph":
            return <p key={block.id}>{block.properties.content}</p>;
          default:
            return null;
        }
      })}
    </>
  );
};

export default Renderer;
