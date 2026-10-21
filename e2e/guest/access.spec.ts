import { test, expect } from "@playwright/test";

test.describe("guests are kept out of the admin area", () => {
  test("/admin goes to the login page", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("an admin screen goes to the login page", async ({ page }) => {
    await page.goto("/admin/theme");
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  for (const path of ["/api/pages", "/api/templates", "/api/theme"]) {
    test(`${path} is not available`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(307);
      expect(response.headers()["location"]).toContain("/auth/login");
    });
  }
});

test.describe("logging in", () => {
  test("the form is shown", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator('input[name="email"]')).toBeVisible();
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });

  test("wrong credentials are refused", async ({ page }) => {
    await page.goto("/auth/login");
    await page.locator('input[name="email"]').fill("admin@example.com");
    await page.locator('input[name="password"]').fill("not-the-password");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByText("Invalid credentials!")).toBeVisible();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
