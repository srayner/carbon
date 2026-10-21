import { ViewProps } from "@/types/blocks";
import { sanitizeRichText } from "@/lib/sanitize";

const RichTextView = ({ block, shared }: ViewProps<"RichText">) => (
  <div
    {...shared}
    dangerouslySetInnerHTML={{
      __html: sanitizeRichText(block.properties.content ?? ""),
    }}
  />
);

export default RichTextView;
