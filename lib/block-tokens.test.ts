import { describe, expect, it } from "vitest";
import { SHARED_PROPERTIES } from "@/config/blocks/shared";
import { ALL_BLOCKS } from "@/config/blocks";
import { getTokenStyle } from "@/lib/block-tokens";

describe("getTokenStyle", () => {
  it("turns each token into the theme's CSS variable", () => {
    expect(
      getTokenStyle({
        paddingSize: "l",
        marginTopSize: "s",
        marginBottomSize: "xl",
        radius: "m",
        shadow: "s",
        background: "surface",
        textColor: "accent",
        fontRole: "mono",
      })
    ).toEqual({
      padding: "var(--site-space-l)",
      marginTop: "var(--site-space-s)",
      marginBottom: "var(--site-space-xl)",
      borderRadius: "var(--site-radius-m)",
      boxShadow: "var(--site-shadow-s)",
      backgroundColor: "var(--site-color-surface)",
      color: "var(--site-color-accent)",
      fontFamily: "var(--site-font-mono)",
    });
  });

  it("gives a border a width and a style", () => {
    expect(getTokenStyle({ border: "thin" })).toEqual({
      borderWidth: "var(--site-border-thin)",
      borderStyle: "solid",
    });
    expect(getTokenStyle({ border: "none" }).borderStyle).toBe("none");
  });

  it("does nothing for properties left on the theme default", () => {
    expect(getTokenStyle({ paddingSize: "", radius: "" })).toEqual({});
    expect(getTokenStyle({})).toEqual({});
  });

  it("ignores values that are not tokens", () => {
    // Block properties come from the database, so they can't be trusted
    expect(
      getTokenStyle({
        paddingSize: "2em",
        radius: "m); color: red; (",
        background: "hotpink",
        fontRole: 12,
      })
    ).toEqual({});
  });
});

describe("shared properties", () => {
  it("are on every block", () => {
    for (const config of ALL_BLOCKS) {
      const names = config.properties.map((p) => p.name);
      for (const shared of SHARED_PROPERTIES) {
        expect(names, `${config.name} has ${shared.name}`).toContain(shared.name);
      }
    }
  });

  it("do not clash with a block's own property names", () => {
    for (const config of ALL_BLOCKS) {
      const names = config.properties.map((p) => p.name);
      expect(new Set(names).size, config.name).toBe(names.length);
    }
  });
});
