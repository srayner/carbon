import { test, expect } from "@playwright/test";

test.describe("the sidebar logo", () => {
  test("keeps its size and place when the sidebar collapses, and only the name goes", async ({
    page,
  }) => {
    await page.goto("/admin");
    const home = page.locator('[data-sidebar="header"] a');
    const mark = home.locator("svg");
    const name = home.getByText("Carbon");

    await expect(name).toBeVisible();
    const open = await mark.boundingBox();
    expect(open?.width).toBe(24);

    await page.keyboard.press("Control+b");
    await expect(name).toHaveCSS("opacity", "0");
    const collapsed = await mark.boundingBox();

    expect(collapsed).toEqual(open);
  });

  test("links back to the admin home", async ({ page }) => {
    await page.goto("/admin/theme");
    await page.locator('[data-sidebar="header"] a').click();
    await expect(page).toHaveURL(/\/admin$/);
  });
});

test.describe("the tab icon", () => {
  test("is served as an SVG", async ({ request }) => {
    const response = await request.get("/icon.svg");
    expect(response.ok()).toBe(true);
    expect(response.headers()["content-type"]).toContain("image/svg+xml");
  });
});
