import { test, expect } from "@playwright/test";
import { COLORS, rgb } from "../helpers";

// The seeded "Link Showcase" page (see prisma/seed.ts). Sizes are the default
// theme's: space s = 8px, m = 16px, radius s = 4px, text s = 14px.
test.describe("a Link", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/link-showcase");
  });

  test("goes where it says", async ({ page }) => {
    await page.locator("#link-plain").click();
    await expect(page).toHaveURL(/\/hello-world$/);
  });

  test("plain: text coloured, no box, accent and underlined on hover", async ({ page }) => {
    const plain = page.locator("#link-plain");
    await expect(plain).toHaveText("Plain link");
    await expect(plain).toHaveCSS("color", rgb(COLORS.text));
    await expect(plain).toHaveCSS("font-weight", "400");
    await expect(plain).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    await expect(plain).toHaveCSS("text-decoration-line", "none");

    await plain.hover();
    await expect(plain).toHaveCSS("color", rgb(COLORS.accent));
    await expect(plain).toHaveCSS("text-decoration-line", "underline");
  });

  test("button: filled with the text colour, padded, rounded, never underlined", async ({
    page,
  }) => {
    const button = page.locator("#link-button");
    await expect(button).toHaveCSS("background-color", rgb(COLORS.text));
    await expect(button).toHaveCSS("color", rgb(COLORS.background));
    await expect(button).toHaveCSS("padding", "8px 16px");
    await expect(button).toHaveCSS("border-top-left-radius", "4px");
    await expect(button).toHaveCSS("font-size", "14px");

    await button.hover();
    await expect(button).toHaveCSS("opacity", "0.85");
    await expect(button).toHaveCSS("text-decoration-line", "none");
  });

  test("outline: a border in the text colour, filled on hover", async ({ page }) => {
    const outline = page.locator("#link-outline");
    await expect(outline).toHaveCSS("border-top-width", "1px");
    await expect(outline).toHaveCSS("border-top-color", rgb(COLORS.text));
    await expect(outline).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");

    await outline.hover();
    await expect(outline).toHaveCSS("background-color", rgb(COLORS.surface));
  });

  test("a token on the block overrides its style", async ({ page }) => {
    await expect(page.locator("#link-accent")).toHaveCSS(
      "background-color",
      rgb(COLORS.accent)
    );
  });

  test("an underline set on the block shows without hovering", async ({ page }) => {
    await expect(page.locator("#link-underlined")).toHaveCSS(
      "text-decoration-line",
      "underline"
    );
  });

  test("opens in a new tab only when asked, and can't reach back to the page", async ({
    page,
  }) => {
    const external = page.locator("#link-external");
    await expect(external).toHaveAttribute("href", "https://www.youtube.com/");
    await expect(external).toHaveAttribute("target", "_blank");
    await expect(external).toHaveAttribute("rel", "noopener noreferrer");
    await expect(page.locator("#link-plain")).not.toHaveAttribute("target", /.*/);
  });

  test("Links in a row Container make a menu", async ({ page }) => {
    const items = page.locator("#link-nav a");
    await expect(items).toHaveText(["Projects", "Build log", "Videos", "About"]);
    await expect(items.nth(1)).toHaveAttribute("href", "/build-log");
    const [first, second] = await Promise.all([
      items.nth(0).boundingBox(),
      items.nth(1).boundingBox(),
    ]);
    expect(second!.x).toBeGreaterThan(first!.x + first!.width);
    expect(Math.abs(second!.y - first!.y)).toBeLessThan(1);
  });

  // Set once on the menu's Container; links outside it keep the normal weight
  test("the menu's links take the Font weight set on their Container", async ({ page }) => {
    for (const link of await page.locator("#link-nav a").all()) {
      await expect(link).toHaveCSS("font-weight", "500");
    }
    await expect(page.locator("#link-underlined")).toHaveCSS("font-weight", "400");
  });

  // Saving refuses this address; it is in the database only through the seed
  test("an unsafe address is shown as text, not linked", async ({ page }) => {
    const unsafe = page.locator("#link-unsafe");
    await expect(unsafe).toHaveText("Unsafe link");
    await expect(unsafe).not.toHaveAttribute("href", /.*/);
  });
});
