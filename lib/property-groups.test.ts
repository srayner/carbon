import { describe, expect, it } from "vitest";
import { groupProperties } from "@/lib/property-groups";
import { ALL_BLOCKS } from "@/config/blocks";
import type { BlockProperty } from "@/types/blocks";

const prop = (name: string, group?: string, hidden?: boolean): BlockProperty => ({
  name,
  displayName: name,
  type: "string",
  group,
  hidden,
});

const names = (groups: [string, BlockProperty[]][]) =>
  groups.map(([group, props]) => [group, props.map((p) => p.name)]);

// The panel shows each block's properties in fixed groups
describe("groupProperties", () => {
  it("puts groups in the panel's order, with unknown groups just before Advanced", () => {
    const groups = groupProperties([
      prop("cssId", "Advanced"),
      prop("extra", "Something new"),
      prop("color", "Appearance"),
      prop("text"), // no group goes with Content
      prop("title", "Content"),
    ]);
    expect(names(groups)).toEqual([
      ["Content", ["text", "title"]],
      ["Appearance", ["color"]],
      ["Something new", ["extra"]],
      ["Advanced", ["cssId"]],
    ]);
  });
});

// A hidden property is edited on the canvas, so the panel must not show it
describe("groupProperties with hidden properties", () => {
  it("leaves out hidden properties and keeps the rest of their group", () => {
    const groups = groupProperties([
      prop("rows", "Content", true),
      prop("caption", "Content"),
      prop("className", "Advanced"),
    ]);
    expect(names(groups)).toEqual([
      ["Content", ["caption"]],
      ["Advanced", ["className"]],
    ]);
  });

  it("drops a group whose properties are all hidden", () => {
    const groups = groupProperties([
      prop("rows", "Content", true),
      prop("className", "Advanced"),
    ]);
    expect(names(groups)).toEqual([["Advanced", ["className"]]]);
  });

  // Read from the real configs, so a new hidden property is covered too
  it("never shows a property any block marks as hidden", () => {
    for (const block of ALL_BLOCKS) {
      const shown = groupProperties(block.properties).flatMap(([, p]) => p);
      const hidden = block.properties.filter(
        (p) => "hidden" in p && p.hidden
      );
      for (const h of hidden) expect(shown).not.toContainEqual(h);
      expect(shown.length).toBe(block.properties.length - hidden.length);
    }
  });

  it("hides the KeyValueTable rows, which are edited on the canvas", () => {
    const table = ALL_BLOCKS.find((b) => b.name === "KeyValueTable")!;
    const shown = groupProperties(table.properties).flatMap(([, p]) => p);
    expect(shown.map((p) => p.name)).not.toContain("rows");
    expect(shown.map((p) => p.name)).toContain("keyWidth");
  });
});
