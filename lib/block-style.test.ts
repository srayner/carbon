import { describe, expect, it } from "vitest";
import { ALL_BLOCKS } from "@/config/blocks";
import { getBlockStyle } from "@/lib/block-style";

const paragraph = ALL_BLOCKS.find((b) => b.name === "Paragraph")!;
const colorDefault = paragraph.properties.find((p) => p.name === "color")!
  .default;

describe("getBlockStyle", () => {
  it("only applies values changed from the default", () => {
    expect(getBlockStyle("Paragraph", { color: colorDefault })).toEqual({});
    expect(getBlockStyle("Paragraph", { color: "#ff0000" })).toEqual({
      color: "#ff0000",
    });
  });

  it("ignores empty values and non-style properties", () => {
    expect(
      getBlockStyle("Paragraph", { color: "", content: "hi", cssId: "x" })
    ).toEqual({});
  });

  it("returns nothing for an unknown block type", () => {
    expect(getBlockStyle("Nope", { color: "#ff0000" })).toEqual({});
  });
});
