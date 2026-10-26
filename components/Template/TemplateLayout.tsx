import { BlocksView } from "@/components/Page/Renderer";
import { MAIN_AREA, areaNames, gridVars } from "@/lib/template-layout";
import { Block } from "@/types/blocks";
import { TemplateLayout as Layout } from "@/types/templates";

type Props = {
  layout: Layout;
  slots: Record<string, Block[]>;
  children: React.ReactNode; // the page's own content, shown in the main area
};

const CONTENT_CLASS: Record<Layout["contentWidth"], string> = {
  narrow:
    "prose prose-lg mx-auto max-w-[var(--site-content-width)] p-[var(--site-space-l)]",
  full: "prose prose-lg max-w-none p-[var(--site-space-l)]",
};

/** Lays the page out on the template's grid and fills each area. */
const TemplateLayout = ({ layout, slots, children }: Props) => (
  <div className="template-grid min-h-screen" style={gridVars(layout)}>
    {areaNames(layout).map((name) => {
      if (name === MAIN_AREA) {
        return (
          <main
            key={name}
            className={`min-w-0 ${CONTENT_CLASS[layout.contentWidth]}`}
            style={{ gridArea: name }}
          >
            {children}
          </main>
        );
      }

      // An empty slot, or an area that isn't a slot, renders nothing
      const kind = layout.slots[name]?.kind;
      const blocks = slots[name];
      if (!kind || !blocks?.length) return null;

      const Tag =
        kind === "HEADER"
          ? "header"
          : kind === "FOOTER"
          ? "footer"
          : name === "sidebar"
          ? "aside"
          : "div";
      // Headers, footers and sidebars share one left edge and are set off from
      // the content by a border; prose spacing is trimmed at their ends
      const frame =
        kind === "HEADER"
          ? "border-b bg-site-background py-[var(--site-space-m)]"
          : kind === "FOOTER"
          ? "border-t bg-site-background py-6"
          : "border-b py-8 md:border-b-0 md:border-r";
      return (
        <Tag
          key={name}
          className={`prose min-w-0 max-w-none px-6 ${frame} [&>*:first-child]:mt-0 [&>*:last-child]:mb-0`}
          style={{ gridArea: name }}
        >
          <BlocksView blocks={blocks} />
        </Tag>
      );
    })}
  </div>
);

export default TemplateLayout;
