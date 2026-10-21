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

  test("selecting a block shows its properties", async ({ page }) => {
    await openShowcase(page);
    await page.getByText("Showcase card one").click();
    await expect(page.getByText(/CSS Class/i).first()).toBeVisible();
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
