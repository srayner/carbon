import { ViewProps } from "@/types/blocks";
import { getLinkClasses } from "@/lib/link-style";
import { safeHref } from "@/lib/link-url";

const LinkView = ({ block, shared }: ViewProps<"Link">) => {
  const { label, url, newTab } = block.properties;
  // Saving refuses unsafe addresses; this also covers rows saved before that
  const href = safeHref(url) ?? undefined;

  return (
    <a
      id={shared.id}
      href={href}
      style={shared.style}
      className={[getLinkClasses(block.properties), shared.className]
        .filter(Boolean)
        .join(" ")}
      {...(newTab === "true" && href
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {label}
    </a>
  );
};

export default LinkView;
