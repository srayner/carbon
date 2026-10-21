import { ViewProps } from "@/types/blocks";

const ParagraphView = ({ block, shared }: ViewProps<"Paragraph">) => (
  <p {...shared}>{block.properties.content}</p>
);

export default ParagraphView;
