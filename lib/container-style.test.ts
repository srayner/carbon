import { describe, expect, it } from "vitest";
import { ContainerBlockConfig } from "@/config/blocks/container";
import { getContainerStyle } from "@/lib/container-style";

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
