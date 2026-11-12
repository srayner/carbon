import { describe, expect, it } from "vitest";
import { ALL_BLOCKS } from "@/config/blocks";
import { isLinkBlock, validateBlockUrls, validateNestedLinks } from "@/lib/block-urls";

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

  // The address goes into CSS url("..."), so it must not be able to end it
  describe("a background image", () => {
    const withImage = (type: string, backgroundImage: unknown) => ({
      type,
      properties: { backgroundImage },
    });

    it.each([
      "/files/hero.jpg",
      "/logo-icon.svg",
      "https://example.com/a b.png",
      "HTTP://example.com/a.png",
      "",
      "  ",
    ])("accepts %j", (url) => {
      expect(validateBlockUrls([withImage("Heading", url)])).toBeNull();
    });

    it.each([
      "javascript:alert(1)",
      "data:image/png;base64,AAAA",
      "hero.jpg",
      '/a.png"); color: red; ("',
      "/a.png'",
      "/a(1).png",
      "/a\\.png",
      "/a.png\nb",
      "/a\u0000.png",
    ])("refuses %j, and says what is allowed", (url) => {
      expect(validateBlockUrls([withImage("Heading", url)])).toMatch(
        /Heading "Background image" can't be saved: Use an uploaded image/
      );
    });

    it("is checked on every block type", () => {
      for (const config of ALL_BLOCKS) {
        expect(
          validateBlockUrls([withImage(config.name, "javascript:alert(1)")]),
          config.name
        ).not.toBeNull();
      }
    });
  });

  it("leaves blocks with no url properties alone", () => {
    expect(
      validateBlockUrls([{ type: "Paragraph", properties: { content: "javascript:alert(1)" } }])
    ).toBeNull();
  });
});

type Row = { id: string; type: string; properties: Record<string, string>; parentId?: string };
const row = (id: string, type: string, properties: Record<string, string> = {}, parentId?: string): Row => ({
  id,
  type,
  properties,
  ...(parentId && { parentId }),
});

describe("isLinkBlock", () => {
  it.each([
    ["a Link with an address", row("a", "Link", { url: "/x" }), true],
    // Its default address is "/", so it is an <a> even when none was saved
    ["a Link with no address saved", row("a", "Link"), true],
    ["a Container with an address", row("a", "Container", { url: "/x" }), true],
    ["a Container with no address", row("a", "Container"), false],
    ["a Container with an empty address", row("a", "Container", { url: "  " }), false],
    ["a block with no url property", row("a", "Paragraph", { url: "/x" }), false],
    ["an unknown type", row("a", "Nope", { url: "/x" }), false],
  ])("%s: %s", (_, block, expected) => {
    expect(isLinkBlock(block)).toBe(expected);
  });
});

describe("validateNestedLinks", () => {
  const linked = (id: string, parentId?: string) => row(id, "Container", { url: "/x" }, parentId);
  const plain = (id: string, parentId?: string) => row(id, "Container", {}, parentId);

  it.each([
    ["a Link in a linked Container", [linked("box"), row("in", "Link", {}, "box")]],
    ["a linked Container in a linked Container", [linked("box"), linked("in", "box")]],
    // Any ancestor counts, not only the parent
    [
      "a Link two levels inside a linked Container",
      [linked("box"), plain("mid", "box"), row("in", "Link", {}, "mid")],
    ],
  ])("refuses %s, and says why", (_, blocks) => {
    expect(validateNestedLinks(blocks)).toMatch(/can't go inside a linked Container/);
  });

  it.each([
    ["Links in a plain Container", [plain("box"), row("a", "Link", {}, "box"), row("b", "Link", {}, "box")]],
    ["a linked Container holding plain blocks", [linked("box"), plain("mid", "box"), row("p", "Paragraph", {}, "mid")]],
    ["linked Containers side by side", [plain("row"), linked("a", "row"), linked("b", "row")]],
    ["a Link with a missing parent", [row("in", "Link", {}, "gone")]],
  ])("accepts %s", (_, blocks) => {
    expect(validateNestedLinks(blocks)).toBeNull();
  });

  // The tree check runs first and refuses a loop, but this must still end
  it("ends on a loop", () => {
    expect(validateNestedLinks([plain("x", "y"), plain("y", "x"), row("in", "Link", {}, "x")])).toBeNull();
  });
});
