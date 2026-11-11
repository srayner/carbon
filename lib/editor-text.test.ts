import { describe, it, expect } from "vitest";
import { plainTextToHtml } from "./editor-text";

// Heading and Paragraph store plain text; the editor loads it as HTML. Text
// that looks like markup or an entity must load as the same text.
describe("plainTextToHtml", () => {
  it.each([
    ["plain words", "Getting started", "<p>Getting started</p>"],
    ["an ampersand", "Tom & Jerry", "<p>Tom &amp; Jerry</p>"],
    ["something like a tag", "a <b>bold</b> claim", "<p>a &lt;b&gt;bold&lt;/b&gt; claim</p>"],
    ["something like an entity", "write &amp; for &", "<p>write &amp;amp; for &amp;</p>"],
    ["nothing", "", "<p></p>"],
  ])("escapes %s", (_, text, html) => {
    expect(plainTextToHtml(text)).toBe(html);
  });
});
