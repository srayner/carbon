import { test, expect, Page } from "@playwright/test";
import { COLORS } from "../helpers";

// These change the one saved theme, so they run in order and put it back

const field = (page: Page, label: string) =>
  page
    .locator("label", { hasText: label })
    .locator("input:not([type='color'])");

const publicAccent = async (page: Page) => {
  await page.goto("/hello-world");
  const style = await page.locator(".site-theme").first().getAttribute("style");
  return /--site-color-accent:\s*([^;]+)/.exec(style ?? "")?.[1];
};

test.describe.configure({ mode: "serial" });

test.describe("the theme screen", () => {
  test("starts on the default theme", async ({ page }) => {
    await page.goto("/admin/theme");
    await expect(field(page, "Accent (links)")).not.toHaveValue("");
    await expect(page.getByRole("button", { name: "Save theme" })).toBeDisabled();
  });

  test("a saved colour reaches the public site", async ({ page }) => {
    await page.goto("/admin/theme");
    await field(page, "Accent (links)").fill("#ff0000");
    await page.getByRole("button", { name: "Save theme" }).click();
    await expect(page.getByText("Theme saved.")).toBeVisible();

    expect(await publicAccent(page)).toBe("#ff0000");
  });

  test("the change is still there after a reload", async ({ page }) => {
    await page.goto("/admin/theme");
    await expect(field(page, "Accent (links)")).toHaveValue("#ff0000");
  });

  test("a bad value is refused with a reason", async ({ page }) => {
    await page.goto("/admin/theme");
    await field(page, "Accent (links)").fill("#ff0000");
    await page.getByLabel("m", { exact: true }).first().fill("lots");
    await page.getByRole("button", { name: "Save theme" }).click();
    await expect(page.getByText(/Use a length/)).toBeVisible();
    // Nothing was saved
    expect(await publicAccent(page)).toBe("#ff0000");
  });

  test("token values follow the theme", async ({ page }) => {
    await page.goto("/admin/theme");
    const spacing = page.locator("section", {
      has: page.getByRole("heading", { name: "Spacing" }),
    });
    await spacing.locator("label", { hasText: /^l$/ }).locator("input").fill("3rem");
    await page.getByRole("button", { name: "Save theme" }).click();
    await expect(page.getByText("Theme saved.")).toBeVisible();

    await page.goto("/block-showcase");
    await expect(page.locator("#styled-paragraph")).toHaveCSS("padding", "48px");
  });

  test("resetting to the defaults and saving restores the site", async ({
    page,
  }) => {
    await page.goto("/admin/theme");
    await page.getByRole("button", { name: "Reset to defaults" }).click();
    await page.getByRole("button", { name: "Save theme" }).click();
    await expect(page.getByText("Theme saved.")).toBeVisible();

    expect(await publicAccent(page)).toBe(COLORS.accent);
    await page.goto("/block-showcase");
    await expect(page.locator("#styled-paragraph")).toHaveCSS("padding", "32px");
  });
});
