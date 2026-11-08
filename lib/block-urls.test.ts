import { describe, expect, it } from "vitest";
import { ALL_BLOCKS } from "@/config/blocks";
import { validateBlockUrls } from "@/lib/block-urls";

const link = (url: unknown) => ({ type: "Link", properties: { label: "Go", url } });

describe("validateBlockUrls", () => {
  it.each(["https://youtube.com", "/projects", "#top", "mailto:a@b.c", ""])(
    "accepts a Link to %j",
    (url) => {
      expect(validateBlockUrls([link(url)])).toBeNull();
    }
  );

  it("accepts a Link with no address at all", () => {
    expect(validateBlockUrls([{ type: "Link", properties: { label: "Go" } }])).toBeNull();
  });

  it.each(["javascript:alert(1)", "data:text/html,hi", " java\tscript:x"])(
    "refuses a Link to %j, and says what is allowed",
    (url) => {
      expect(validateBlockUrls([link("/ok"), link(url)])).toMatch(/Link "Link to".*web address/);
    }
  );

  // Every url property is checked, so another block's url is not left out
  it("checks every property of type url in the configs", () => {
    const urlProps = ALL_BLOCKS.flatMap((c) =>
      c.properties.filter((p) => p.type === "url").map((p) => [c.name, p.name] as const)
    );
    expect(urlProps.length).toBeGreaterThan(0);
    for (const [type, name] of urlProps) {
      expect(
        validateBlockUrls([{ type, properties: { [name]: "javascript:alert(1)" } }])
      ).not.toBeNull();
    }
  });

  it("leaves blocks with no url properties alone", () => {
    expect(
      validateBlockUrls([{ type: "Paragraph", properties: { content: "javascript:alert(1)" } }])
    ).toBeNull();
  });
});
