import { ViewProps } from "@/types/blocks";
import { getContainerStyle, isInlineContainer } from "@/lib/container-style";
import { safeHref } from "@/lib/link-url";

const ContainerView = ({ block, shared, children }: ViewProps<"Container">) => {
  const { url, newTab } = block.properties;
  // Saving refuses unsafe addresses; this also covers rows saved before that
  const href = safeHref(url) ?? undefined;
  // With an address it is an <a>, laid out as the div or span it would be
  const link = href
    ? {
        href,
        ...(newTab === "true" && { target: "_blank", rel: "noopener noreferrer" }),
      }
    : {};

  // A span is plain inline markup: only its own settings, no layout
  if (isInlineContainer(block.properties)) {
    const Tag = href ? "a" : "span";
    return (
      <Tag
        id={shared.id}
        className={[href && "block-link", shared.className].filter(Boolean).join(" ") || undefined}
        style={shared.style}
        {...link}
      >
        {children}
      </Tag>
    );
  }
  const Tag = href ? "a" : "div";
  return (
    <Tag
      id={shared.id}
      className={["block-container", href && "block-link", shared.className]
        .filter(Boolean)
        .join(" ")}
      style={{ ...getContainerStyle(block.properties), ...shared.style }}
      {...link}
    >
      {children}
    </Tag>
  );
};

export default ContainerView;
