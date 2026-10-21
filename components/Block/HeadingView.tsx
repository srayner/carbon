import { ViewProps } from "@/types/blocks";

const HEADING_LEVELS = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
type HeadingLevel = (typeof HEADING_LEVELS)[number];

const HeadingView = ({ block, shared }: ViewProps<"Heading">) => {
  const { level, content } = block.properties;
  const Tag: HeadingLevel = HEADING_LEVELS.includes(level as HeadingLevel)
    ? (level as HeadingLevel)
    : "h2";
  return <Tag {...shared}>{content}</Tag>;
};

export default HeadingView;
