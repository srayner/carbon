import { ViewProps } from "@/types/blocks";
import { getContainerStyle, isInlineContainer } from "@/lib/container-style";

const ContainerView = ({ block, shared, children }: ViewProps<"Container">) => {
  // A span is plain inline markup: only its own settings, no layout
  if (isInlineContainer(block.properties)) {
    return (
      <span id={shared.id} className={shared.className} style={shared.style}>
        {children}
      </span>
    );
  }
  return (
    <div
      id={shared.id}
      className={["block-container", shared.className].filter(Boolean).join(" ")}
      style={{ ...getContainerStyle(block.properties), ...shared.style }}
    >
      {children}
    </div>
  );
};

export default ContainerView;
