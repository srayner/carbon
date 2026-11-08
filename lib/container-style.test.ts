import { describe, expect, it } from "vitest";
import { ContainerBlockConfig } from "@/config/blocks/container";
import { GROW_PROPERTY } from "@/config/blocks/shared";
import { getContainerStyle, getGrowStyle, isInlineContainer } from "@/lib/container-style";

const defaults = Object.fromEntries(
  ContainerBlockConfig.properties.map((p) => [p.name, p.default])
);

describe("getContainerStyle", () => {
  it("lays a new container out as a column with the default gap", () => {
    expect(getContainerStyle(defaults)).toEqual({
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "stretch",
      gap: `var(--site-space-${defaults.gap})`,
    });
  });

  it("turns each option into its flexbox value", () => {
    expect(
      getContainerStyle({ direction: "row", justify: "between", align: "center", gap: "xl" })
    ).toEqual({
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "var(--site-space-xl)",
    });
  });

  // Every choice the editor offers must give its own CSS, none falling back
  // to another choice's value
  it.each(["direction", "justify", "align", "gap"])(
    "gives each %s choice a different value",
    (name) => {
      const prop = ContainerBlockConfig.properties.find((p) => p.name === name);
      const choices = (prop && "values" in prop ? prop.values : []).filter(Boolean);
      expect(choices.length).toBeGreaterThan(1);
      const css = choices.map((value) => JSON.stringify(getContainerStyle({ [name]: value })));
      expect(new Set(css).size).toBe(choices.length);
    }
  );

  it("leaves the gap out when it is on the theme default", () => {
    expect(getContainerStyle({ gap: "" })).not.toHaveProperty("gap");
  });

  // The properties come from the database, so anything odd must not reach the page
  it("ignores values that are not one of the options", () => {
    expect(
      getContainerStyle({
        direction: "row-reverse",
        justify: "space-evenly",
        align: 7,
        gap: "10px; color: red",
      })
    ).toEqual({
      flexDirection: "column",
      justifyContent: "flex-start",
      alignItems: "stretch",
    });
  });
});

describe("getGrowStyle", () => {
  it("leaves a block on the default sized by its content", () => {
    expect(getGrowStyle({ grow: GROW_PROPERTY.default })).toEqual({});
    expect(getGrowStyle({})).toEqual({});
  });

  // A number ignores the content's size (basis 0) and shares space by ratio
  it.each(GROW_PROPERTY.values.filter((v) => v !== "content"))("shares space on %s", (n) => {
    expect(getGrowStyle({ grow: n })).toEqual({ flex: `${n} 1 0` });
  });

  it("ignores values that are not one of the options", () => {
    for (const grow of ["0", "4", "1; color: red", 1, null]) {
      expect(getGrowStyle({ grow })).toEqual({});
    }
  });
});

describe("isInlineContainer", () => {
  it("is a div unless set to span", () => {
    expect(isInlineContainer(defaults)).toBe(false);
    expect(isInlineContainer({ ...defaults, element: "span" })).toBe(true);
  });

  // Saved values come from the database, so anything else is the default div
  it.each(["SPAN", " span", "a", "", null, undefined])("treats %p as a div", (element) => {
    expect(isInlineContainer({ element })).toBe(false);
  });
});

describe("getContainerStyle: Width", () => {
  it("fills the space it is in by default", () => {
    const style = getContainerStyle(defaults);
    expect(style).not.toHaveProperty("maxWidth");
    expect(style).not.toHaveProperty("marginInline");
  });

  it.each(["page", "content"])("caps %s at the theme's width and centres it", (width) => {
    expect(getContainerStyle({ ...defaults, width })).toMatchObject({
      width: "100%",
      maxWidth: `var(--site-${width}-width)`,
      marginInline: "auto",
    });
  });

  it.each(["wide", "100px", "", null])("treats %p as full", (width) => {
    expect(getContainerStyle({ ...defaults, width })).not.toHaveProperty("maxWidth");
  });
});
