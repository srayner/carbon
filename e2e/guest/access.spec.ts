import { test, expect } from "@playwright/test";

test.describe("guests are kept out of the admin area", () => {
  // The admin area does not exist as far as a guest can tell
  for (const path of ["/admin", "/admin/theme", "/admin/no/such/page"]) {
    test(`${path} is a plain 404`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
      await expect(page).toHaveURL(path);
      await expect(
        page.getByRole("heading", { name: "Page not found" })
      ).toBeVisible();
    });
  }

  for (const path of ["/api/pages", "/api/templates", "/api/theme"]) {
    test(`${path} is not available`, async ({ request }) => {
      const response = await request.get(path, { maxRedirects: 0 });
      expect(response.status()).toBe(307);
      expect(response.headers()["location"]).toContain("/auth/login");
    });
  }
});

test.describe("logging in", () => {
  test("the form is shown, under the logo", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: "Carbon" })).toBeVisible();
    await expect(page.locator("svg polygon")).toBeVisible();
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
