import { MAIN_AREA, areaNames, gridStyle } from "@/lib/template-layout";
import type { TemplateLayout } from "@/types/templates";

/** A small wireframe of the template's grid. */
export default function LayoutPreview({ layout }: { layout: TemplateLayout }) {
  return (
    <div
      className="h-48 gap-1 rounded-md border bg-muted p-1 text-xs"
      style={{
        ...gridStyle(layout),
        // the real rows are auto/1fr; give the wireframe some height to show
        gridTemplateRows: layout.rows
          .map((row) => (row === "auto" ? "minmax(1.5rem, auto)" : row))
          .join(" "),
      }}
    >
      {areaNames(layout).map((name) => (
        <div
          key={name}
          className={`flex items-center justify-center rounded border ${
            name === MAIN_AREA ? "bg-background" : "bg-blue-50 border-blue-200"
          }`}
          style={{
            gridArea: name,
            // mirror the real page: a narrow column is centred, not edge to edge
            ...(name === MAIN_AREA &&
              layout.contentWidth === "narrow" && {
                width: "60%",
                justifySelf: "center",
              }),
          }}
        >
          {name === MAIN_AREA ? `${name} (${layout.contentWidth})` : name}
        </div>
      ))}
    </div>
  );
}
