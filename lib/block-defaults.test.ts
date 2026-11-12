import { describe, expect, it } from "vitest";
import { ALL_BLOCKS } from "@/config/blocks";
import { getDefaultProps } from "@/lib/block-defaults";

describe("getDefaultProps", () => {
  // Read from the configs, so a property added later is covered too
  it.each(ALL_BLOCKS.map((config) => [config.name, config] as const))(
    "gives a %s every property, set to its default",
    (_, config) => {
      const expected = Object.fromEntries(
        config.properties.map((prop) => [prop.name, prop.default ?? ""])
      );
      expect(getDefaultProps(config)).toEqual(expected);
    }
  );

  it("uses an empty string for a property with no default", () => {
    const config = {
      name: "Heading",
      icon: ALL_BLOCKS[0].icon,
      properties: [{ name: "note", displayName: "Note", type: "string" }],
    } as const;
    expect(getDefaultProps(config)).toEqual({ note: "" });
  });
});
