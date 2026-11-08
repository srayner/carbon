import { describe, expect, it } from "vitest";
import { sanitizeRichText } from "@/lib/sanitize";
import { TEXT_COLORS, textColorClass } from "@/lib/text-colors";

// A word coloured in the editor is saved as a span with the colour's class
describe("sanitizeRichText: theme text colours", () => {
  it.each(TEXT_COLORS)("keeps a word coloured %s", (color) => {
    const html = `<p>Steve Rayner <span class="${textColorClass(color)}">Makes</span></p>`;
    expect(sanitizeRichText(html)).toBe(html);
  });

  it.each([
    ["another class", '<span class="evil">Makes</span>', "<span>Makes</span>"],
    ["a colour class beside another", '<span class="site-text-accent evil">Makes</span>', '<span class="site-text-accent">Makes</span>'],
    ["a colour that isn't a choice", '<span class="site-text-background">Makes</span>', "<span>Makes</span>"],
    ["an inline colour", '<span style="color: red">Makes</span>', "<span>Makes</span>"],
    ["an event handler", '<span class="site-text-accent" onclick="alert(1)">Makes</span>', '<span class="site-text-accent">Makes</span>'],
  ])("drops %s", (_, html, expected) => {
    expect(sanitizeRichText(`<p>${html}</p>`)).toBe(`<p>${expected}</p>`);
  });

  it("still keeps text alignment and drops scripts", () => {
    expect(
      sanitizeRichText('<p style="text-align: center">Hi</p><script>alert(1)</script>')
    ).toBe('<p style="text-align:center">Hi</p>');
  });
});
