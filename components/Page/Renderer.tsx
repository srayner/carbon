import { Page, Block } from "@/types/entities";

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
            return <h2 key={block.id}>{block.data.content}</h2>;
          case "Paragraph":
            return <p key={block.id}>{block.data.content}</p>;
          default:
            return null;
        }
      })}
    </>
  );
};

export default Renderer;
