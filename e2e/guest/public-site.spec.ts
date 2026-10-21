import { test, expect } from "@playwright/test";
import { COLORS, rgb } from "../helpers";

test.describe("public pages", () => {
  test("the home page offers a login when there is no home page", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: "Welcome to your Carbon CMS" })
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
  });

  test("a published page shows its blocks", async ({ page }) => {
    await page.goto("/hello-world");
    await expect(page.getByRole("heading", { name: "Hello World" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Getting started" })).toBeVisible();
    await expect(page.getByText("This page was created by the seed script.")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Resistor" })).toBeVisible();
  });

  test("the template's header and footer are shown", async ({ page }) => {
    await page.goto("/hello-world");
    await expect(page.locator("header").getByText("Carbon")).toBeVisible();
    await expect(page.locator("footer").getByText("Made with Carbon CMS.")).toBeVisible();
  });

  test("the page is wrapped in the site theme", async ({ page }) => {
    await page.goto("/hello-world");
    const style = await page.locator(".site-theme").first().getAttribute("style");
    expect(style).toContain("--color-accent");
    expect(style).toContain("--space-m");
  });

  test("an unknown page is a 404", async ({ page }) => {
    const response = await page.goto("/no-such-page");
    expect(response?.status()).toBe(404);
  });

  test("drafts and scheduled pages are not visible", async ({ page }) => {
    for (const slug of ["secret-draft", "coming-soon"]) {
      const response = await page.goto(`/${slug}`);
      expect(response?.status(), slug).toBe(404);
    }
  });
});

test.describe("every block type", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/block-showcase");
  });

  test("Heading keeps its level and id", async ({ page }) => {
    const heading = page.locator("h2#showcase-heading");
    await expect(heading).toHaveText("Showcase heading");
  });

  test("Paragraph and RichText", async ({ page }) => {
    await expect(page.getByText("Showcase paragraph")).toBeVisible();
    await expect(page.locator("em", { hasText: "rich" })).toBeVisible();
  });

  test("Image shows its alt text and caption", async ({ page }) => {
    await expect(page.getByAltText("Showcase image")).toBeVisible();
    await expect(page.locator("figcaption")).toHaveText("Showcase caption");
  });

  test("File is a download link", async ({ page }) => {
    const link = page.getByRole("link", { name: /Showcase download/ });
    await expect(link).toHaveAttribute("href", "/files/example.pdf");
    await expect(link).toHaveAttribute("download", "");
  });

  test("File has its own contrasting background, not the page's", async ({
    page,
  }) => {
    const link = page.getByRole("link", { name: /Showcase download/ });
    await expect(link).toHaveCSS("background-color", rgb(COLORS.surface));
  });

  test("a background token on File fills the link, not the whole row", async ({
    page,
  }) => {
    const link = page.getByRole("link", { name: /Tinted download/ });
    await expect(link).toHaveCSS("background-color", rgb(COLORS.border));
    await expect(link).toHaveCSS("border-radius", "12px"); // radius l
    const row = link.locator("..");
    await expect(row).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
    // The link is only as wide as its content
    const [rowBox, linkBox] = await Promise.all([row.boundingBox(), link.boundingBox()]);
    expect(linkBox!.width).toBeLessThan(rowBox!.width / 2);
  });

  test("consecutive Cards share one grid", async ({ page }) => {
    const grid = page.locator("div.grid", { hasText: "Showcase card one" });
    await expect(grid.getByText("Showcase card two")).toBeVisible();
  });

  test("Query lists the pages in the category as cards and as links", async ({
    page,
  }) => {
    // Desk Lamp is in Projects, Robot Arm in its sub-category Electronics
    await expect(page.getByRole("heading", { name: "Desk Lamp" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Robot Arm" })).toBeVisible();
    await expect(page.locator("#showcase-list li")).toHaveText([
      "Desk Lamp",
      "Robot Arm",
    ]);
  });

  test("theme tokens become the theme's values", async ({ page }) => {
    const styled = page.locator("#styled-paragraph");
    await expect(styled).toHaveCSS("padding", "32px"); // space l = 2rem
    await expect(styled).toHaveCSS("border-radius", "8px"); // radius m
    await expect(styled).toHaveCSS("border-top-width", "1px"); // border thin
    await expect(styled).toHaveCSS("box-shadow", /rgba\(0, 0, 0, 0\.12\)/);
    await expect(styled).toHaveCSS("background-color", rgb(COLORS.surface));
    await expect(styled).toHaveCSS("color", rgb(COLORS.accent));
  });

  test("a raw value changed from its default overrides the token", async ({
    page,
  }) => {
    await expect(page.locator("#override-paragraph")).toHaveCSS("padding", "5px");
  });

  test("Query takes the tokens on its wrapper", async ({ page }) => {
    await expect(page.locator("#showcase-list")).toHaveCSS(
      "background-color",
      rgb(COLORS.surface)
    );
  });

  test("Query links go to the pages", async ({ page }) => {
    await page.locator("#showcase-list").getByRole("link", { name: "Desk Lamp" }).click();
    await expect(page).toHaveURL(/\/desk-lamp$/);
    await expect(page.getByRole("heading", { name: "Desk Lamp" })).toBeVisible();
  });
});
