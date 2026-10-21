import { test, expect } from "@playwright/test";

test.describe("the admin area", () => {
  test("opens, with the Theme screen in the sidebar", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/admin$/);
    await expect(page.getByRole("link", { name: "Theme" })).toBeVisible();
  });

  test("lists the seeded pages", async ({ request }) => {
    const response = await request.get("/api/pages?search=Block&limit=5");
    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body.content.map((p: { slug: string }) => p.slug)).toContain(
      "block-showcase"
    );
  });
});

test.describe("previewing unpublished pages", () => {
  test("a draft shows a preview banner", async ({ page }) => {
    await page.goto("/secret-draft");
    await expect(page.getByText("this page is a draft")).toBeVisible();
    await expect(page.getByRole("link", { name: "Edit page" })).toBeVisible();
  });

  test("a scheduled page shows when it goes live", async ({ page }) => {
    await page.goto("/coming-soon");
    await expect(page.getByText(/scheduled for/)).toBeVisible();
  });
});
