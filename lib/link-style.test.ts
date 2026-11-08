import { describe, expect, it } from "vitest";
import { LinkBlockConfig } from "@/config/blocks/link";
import { getLinkClasses } from "@/lib/link-style";

const defaults = Object.fromEntries(
  LinkBlockConfig.properties.map((p) => [p.name, p.default])
);
const classes = (properties: Record<string, unknown>) =>
  getLinkClasses(properties).split(" ");

describe("getLinkClasses", () => {
  it("makes a new link a plain link that underlines on hover", () => {
    expect(classes(defaults)).toEqual([
      "not-prose",
      "site-link",
      "site-link-plain",
      "site-link-underline-hover",
    ]);
  });

  // "auto" follows the style
  it.each([
    ["plain", "hover"],
    ["button", "none"],
    ["outline", "none"],
  ])("a %s link underlines on %s by default", (style, underline) => {
    expect(classes({ style, underline: "auto" })).toEqual(
      expect.arrayContaining([`site-link-${style}`, `site-link-underline-${underline}`])
    );
  });

  it.each(["none", "hover", "always"])("an underline of %s overrides the style's", (underline) => {
    expect(classes({ style: "button", underline })).toContain(`site-link-underline-${underline}`);
  });

  // Values come from the database
  it("falls back to a plain link for values that are not options", () => {
    expect(classes({ style: "fancy", underline: "blink" })).toEqual([
      "not-prose",
      "site-link",
      "site-link-plain",
      "site-link-underline-hover",
    ]);
  });

  it("stays out of the typography plugin's link styles", () => {
    expect(classes({ style: "button" })).toContain("not-prose");
  });
});
