import { test, expect, Page } from "@playwright/test";

const openShowcase = async (page: Page) => {
  const response = await page.request.get("/api/pages?search=Block%20Showcase");
  const { content } = await response.json();
  const showcase = content.find(
    (p: { slug: string }) => p.slug === "block-showcase"
  );
  await page.goto(`/admin/pages/${showcase.id}`);
};

test.describe.configure({ mode: "serial" });

test.describe("the page editor", () => {
  test("shows every block type on the canvas", async ({ page }) => {
    await openShowcase(page);

    // Heading, Paragraph and RichText are editable text
    await expect(
      page.locator(".ProseMirror", { hasText: "Showcase heading" })
    ).toBeVisible();
    await expect(
      page.locator(".ProseMirror", { hasText: "Showcase paragraph" })
    ).toBeVisible();
    // Image, File, Card and Query are previews
    await expect(page.locator("figcaption")).toHaveText("Showcase caption");
    await expect(page.getByText("Showcase download")).toBeVisible();
    await expect(page.getByText("Showcase card one")).toBeVisible();
    await expect(page.getByText("Showcase card two")).toBeVisible();
    await expect(page.getByText(/^Pages in/).first()).toBeVisible();
  });

  test("the block outline is open, and the main navigation can still be toggled", async ({
    page,
  }) => {
    await openShowcase(page);

    await expect(
      page.getByRole("button", { name: "Toggle block outline" })
    ).toHaveAttribute("aria-pressed", "true");

    // The navigation folds to its rail while editing, and opens on request
    const nav = page.locator('[data-sidebar="sidebar"]').first();
    const sidebar = page.locator('[data-collapsible]').first();
    await expect(sidebar).toHaveAttribute("data-state", "collapsed");
    await page.getByRole("button", { name: "Toggle navigation" }).click();
    await expect(sidebar).toHaveAttribute("data-state", "expanded");
    await expect(nav).toBeVisible();
    await page.getByRole("button", { name: "Toggle navigation" }).click();
    await expect(sidebar).toHaveAttribute("data-state", "collapsed");
  });

  test("selecting a block shows its properties", async ({ page }) => {
    await openShowcase(page);
    await page.getByText("Showcase card one").click();
    await expect(page.getByText("Card Properties")).toBeVisible();
    await expect(page.locator("label", { hasText: /^Title$/ })).toBeVisible();
  });

  test("the block panel groups the properties", async ({ page }) => {
    await openShowcase(page);
    await page.getByText("Showcase card one").click();
    for (const group of ["Content", "Spacing", "Box", "Colour and font", "Advanced"]) {
      await expect(
        page.locator("summary", { hasText: new RegExp(`^${group}$`) })
      ).toBeVisible();
    }
    // Only the content group starts open
    await expect(page.locator("label", { hasText: /^Title$/ })).toBeVisible();
    await expect(page.getByText("Corner radius")).toBeHidden();
    await page.locator("summary", { hasText: /^Box$/ }).click();
    await expect(page.getByText("Corner radius")).toBeVisible();
  });

  test("a token chosen in the panel is saved and published", async ({ page }) => {
    const setShadow = async (value: string) => {
      await openShowcase(page);
      await page.getByText("Showcase card one").click();
      await page.locator("summary", { hasText: /^Box$/ }).click();
      await page
        .locator("label", { hasText: "Shadow" })
        .locator("..")
        .locator("select")
        .selectOption(value);
      const saved = page.waitForResponse(
        (r) => r.url().includes("/api/pages/") && r.request().method() === "PUT"
      );
      await page.getByRole("button", { name: "Save" }).click();
      expect((await saved).ok()).toBe(true);
    };
    const cardShadow = async () => {
      await page.goto("/block-showcase");
      return page
        .locator("div.grid", { hasText: "Showcase card one" })
        .locator("> div")
        .first();
    };

    await setShadow("m");
    await expect(await cardShadow()).toHaveCSS("box-shadow", /rgba\(0, 0, 0, 0\.12\)/);

    // Back to the theme default so the run can be repeated
    await setShadow("");
    await expect(await cardShadow()).toHaveCSS("box-shadow", "none");
  });

  test("an edit to a heading is saved and published", async ({ page }) => {
    await openShowcase(page);

    const edit = async (text: string) => {
      const heading = page.locator(".ProseMirror").first();
      await heading.click();
      await page.keyboard.press("Control+A");
      await page.keyboard.type(text);
      // Leave the editor so the change is committed, then save
      await page.getByText("Showcase card one").click();
      const saved = page.waitForResponse(
        (r) => r.url().includes("/api/pages/") && r.request().method() === "PUT"
      );
      await page.getByRole("button", { name: "Save" }).click();
      expect((await saved).ok()).toBe(true);
    };

    await edit("Edited heading");
    await page.goto("/block-showcase");
    await expect(page.locator("h2#showcase-heading")).toHaveText("Edited heading");

    // Put it back so the run can be repeated
    await openShowcase(page);
    await edit("Showcase heading");
    await page.goto("/block-showcase");
    await expect(page.locator("h2#showcase-heading")).toHaveText("Showcase heading");
  });
});
