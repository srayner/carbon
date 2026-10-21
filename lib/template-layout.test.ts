import { describe, expect, it } from "vitest";
import { PRESET_TEMPLATES } from "@/config/templates";
import { areaNames, gridVars, isValidAreaName, parseLayout } from "@/lib/template-layout";

describe("parseLayout", () => {
  it.each(PRESET_TEMPLATES)("accepts the $name preset", ({ layout }) => {
    expect(parseLayout(JSON.parse(JSON.stringify(layout)))).toEqual(layout);
  });

  it("rejects something that is not a layout", () => {
    expect(() => parseLayout(null)).toThrow("malformed");
    expect(() => parseLayout({ columns: ["1fr"] })).toThrow("malformed");
  });

  it("rejects a slot with a bad name or kind", () => {
    const base = JSON.parse(JSON.stringify(PRESET_TEMPLATES[0].layout));
    expect(() =>
      parseLayout({ ...base, slots: { "Bad Name": { kind: "HEADER" } } })
    ).toThrow("invalid slot");
    expect(() =>
      parseLayout({ ...base, slots: { header: { kind: "NOPE" } } })
    ).toThrow("invalid slot");
  });
});

describe("areaNames", () => {
  it("lists each area once, in grid order", () => {
    const sidebar = PRESET_TEMPLATES.find((t) => t.name === "Left sidebar")!;
    expect(areaNames(sidebar.layout)).toEqual([
      "header",
      "sidebar",
      "main",
      "footer",
    ]);
  });
});

describe("gridVars", () => {
  it("stacks the areas in reading order on small screens", () => {
    const [single] = PRESET_TEMPLATES;
    const vars = gridVars(single.layout) as Record<string, string>;
    expect(vars["--grid-areas-stacked"]).toBe('"header" "main" "footer"');
    expect(vars["--grid-rows-stacked"]).toBe("auto 1fr auto");
  });
});

describe("isValidAreaName", () => {
  it("allows lowercase names with digits and hyphens", () => {
    expect(isValidAreaName("side-bar2")).toBe(true);
    expect(isValidAreaName("Side")).toBe(false);
    expect(isValidAreaName("2side")).toBe(false);
  });
});
