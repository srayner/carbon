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

test.describe("logging out", () => {
  test("goes to the login page, not a 404", async ({ page }) => {
    await page.goto("/admin/pages");
    await page.getByRole("button", { name: "Account menu" }).click();
    await page.getByRole("menuitem", { name: "Logout" }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.locator('input[name="email"]')).toBeVisible();
  });
});

test.describe("the pages list", () => {
  test("shows 10 pages at a time, with more on the next page", async ({
    page,
  }) => {
    await page.goto("/admin/pages");
    await expect(page.locator("tbody tr")).toHaveCount(10);
    await expect(page.getByText("Published (").first()).toBeVisible();
    await expect(page.getByText("Scheduled (").first()).toBeVisible();
    await expect(page.getByText("Draft", { exact: true }).first()).toBeVisible();

    const firstTitle = await page.locator("tbody tr").first().innerText();
    await page.getByText("Next").click();
    await expect(page.locator("tbody tr").first()).not.toHaveText(firstTitle);
    await expect(page.locator("tbody tr")).not.toHaveCount(0);
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

test.describe("the admin 404 page", () => {
  test("keeps the admin chrome and links back to Pages", async ({ page }) => {
    const response = await page.goto("/admin/fragments/nonsense");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Theme" })).toBeVisible();
    await page.getByRole("link", { name: "Back to Pages" }).click();
    await expect(page).toHaveURL(/\/admin\/pages$/);
  });

  test("also covers admin URLs that match no route", async ({ page }) => {
    const response = await page.goto("/admin/no/such/page");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { name: "Not found" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Theme" })).toBeVisible();
    await expect(page.locator(".site-theme")).toHaveCount(0);
  });
});
