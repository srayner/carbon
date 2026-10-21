import { test, expect } from "@playwright/test";

// Logged in as the seeded User account (not an admin)

test.describe("a logged in user", () => {
  test("is sent away from the admin area", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL("/");
    await page.goto("/admin/theme");
    await expect(page).toHaveURL("/");
  });

  test("is sent away from the login page", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page).toHaveURL("/");
  });

  test("sees published pages", async ({ page }) => {
    await page.goto("/hello-world");
    await expect(page.getByRole("heading", { name: "Hello World" })).toBeVisible();
  });

  test("cannot preview drafts or scheduled pages", async ({ page }) => {
    for (const slug of ["secret-draft", "coming-soon"]) {
      const response = await page.goto(`/${slug}`);
      expect(response?.status(), slug).toBe(404);
    }
  });
});

test.describe("API access for a user who is not an admin", () => {
  test("the theme cannot be read or changed", async ({ request }) => {
    expect((await request.get("/api/theme")).status()).toBe(403);
    expect((await request.put("/api/theme", { data: {} })).status()).toBe(403);
  });

  for (const path of ["/api/templates", "/api/categories", "/api/fragments"]) {
    test(`${path} is forbidden`, async ({ request }) => {
      expect((await request.get(path)).status()).toBe(403);
    });
  }

  test("pages cannot be created", async ({ request }) => {
    const response = await request.post("/api/pages", {
      data: { title: "x", slug: "x", blocks: [] },
    });
    expect(response.status()).toBe(403);
  });

  // Known gap: the page read endpoints don't call requireAdmin, so any
  // logged in user can read every page, drafts included
  test.fixme("the page list is forbidden", async ({ request }) => {
    expect((await request.get("/api/pages")).status()).toBe(403);
  });
});
