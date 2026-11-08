import { ViewProps } from "@/types/blocks";
import { getContainerStyle } from "@/lib/container-style";

const ContainerView = ({ block, shared, children }: ViewProps<"Container">) => (
  <div
    id={shared.id}
    className={["block-container", shared.className].filter(Boolean).join(" ")}
    style={{ ...getContainerStyle(block.properties), ...shared.style }}
  >
    {children}
  </div>
);

export default ContainerView;
