import { test, expect } from "@playwright/test";
import { COLORS, rgb } from "../helpers";
import { DEFAULT_THEME } from "../../lib/theme";

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
    await expect(page.locator("header #site-logo")).toHaveText("Steve Rayner Makes");
    await expect(page.locator("footer").getByText("Made with Carbon CMS.")).toBeVisible();
  });

  test("the page is wrapped in the site theme", async ({ page }) => {
    await page.goto("/hello-world");
    const style = await page.locator(".site-theme").first().getAttribute("style");
    expect(style).toContain("--site-color-accent");
    expect(style).toContain("--site-space-m");
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

  test("padding directions, border colour and text size use the theme", async ({
    page,
  }) => {
    const button = page.locator("#button-tokens");
    // Padding is m on all sides, then l across and xs up and down win
    await expect(button).toHaveCSS("padding-left", "32px");
    await expect(button).toHaveCSS("padding-right", "32px");
    await expect(button).toHaveCSS("padding-top", "4px");
    await expect(button).toHaveCSS("padding-bottom", "4px");
    await expect(button).toHaveCSS("border-top-color", rgb(COLORS.accent));
    await expect(button).toHaveCSS("font-size", "12px"); // text xs = 0.75rem
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

test.describe("the 404 page", () => {
  test("is themed, and links back home", async ({ page }) => {
    const response = await page.goto("/no-such-page");
    expect(response?.status()).toBe(404);
    await expect(page.locator(".site-theme")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
    await page.getByRole("link", { name: "Back to home" }).click();
    await expect(page).toHaveURL(/\/$/);
  });
});

// KeyValueTable: bold keys beside values, a row per entry, stacking on phones
test.describe("the key/value table", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/block-showcase");
  });

  const specs = (page: import("@playwright/test").Page) =>
    page.locator("dl#showcase-specs");

  test("shows the rows in order, skipping the blank one", async ({ page }) => {
    await expect(specs(page).locator("dt")).toHaveText([
      "Platter diameter",
      "Motor",
      "Controller",
      "Motor",
      "Design tools",
      "Wi-Fi",
    ]);
    await expect(specs(page).locator("dd")).toHaveText([
      "185 mm",
      "28BYJ-48 geared stepper",
      "ESP32-C3 Super Mini",
      "Spare: NEMA 17",
      'Fusion 360 <mechanical> & EasyEDA "PCB", Arduino for the firmware',
      "",
    ]);
  });

  test("shows text that looks like HTML as text", async ({ page }) => {
    await expect(specs(page).locator("mechanical")).toHaveCount(0);
    await expect(specs(page).getByText("<mechanical>")).toBeVisible();
  });

  test("makes the keys bold and leaves the values normal", async ({ page }) => {
    await expect(specs(page).locator("dt").first()).toHaveCSS("font-weight", "600");
    await expect(specs(page).locator("dd").first()).toHaveCSS("font-weight", "400");
  });

  test("puts each key beside its value, the key column a third wide", async ({
    page,
  }) => {
    const [key, value] = await Promise.all([
      specs(page).locator("dt").first().boundingBox(),
      specs(page).locator("dd").first().boundingBox(),
    ]);
    expect(value!.x).toBeGreaterThan(key!.x + key!.width);
    expect(Math.abs(value!.y - key!.y)).toBeLessThan(2);
    // Key and value columns split 1fr : 2fr
    const share = key!.width / (key!.width + value!.width);
    expect(share).toBeGreaterThan(0.3);
    expect(share).toBeLessThan(0.37);
  });

  test("stacks each key above its value on a phone", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const [key, value] = await Promise.all([
      specs(page).locator("dt").first().boundingBox(),
      specs(page).locator("dd").first().boundingBox(),
    ]);
    expect(value!.y).toBeGreaterThanOrEqual(key!.y + key!.height);
    expect(Math.abs(value!.x - key!.x)).toBeLessThan(2);
  });

  test("takes the theme tokens", async ({ page }) => {
    await expect(specs(page)).toHaveCSS("background-color", rgb(COLORS.surface));
  });

  test("shows nothing for a table with only blank rows or a broken value", async ({
    page,
  }) => {
    // The rest of the page still renders
    await expect(specs(page)).toBeVisible();
    await expect(page.locator("#showcase-specs-blank")).toHaveCount(0);
    await expect(page.locator("#showcase-specs-broken")).toHaveCount(0);
  });
});

// The seeded header, built from blocks as in the mock: logo, menu, button
test.describe("the site header", () => {
  // The mock's width, wider than the page width plus the header's padding
  test.use({ viewport: { width: 1440, height: 900 } });

  test.beforeEach(async ({ page }) => {
    await page.goto("/hello-world");
  });

  test("the logo is one link home: the icon and the name, with Makes in the accent", async ({
    page,
  }) => {
    const logo = page.locator("header a#site-logo");
    await expect(logo).toHaveAttribute("href", "/");
    const icon = logo.locator("img");
    await expect(icon).toHaveAttribute("alt", "");
    expect(await icon.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);

    const makes = logo.locator("span.site-text-accent");
    await expect(makes).toHaveText("Makes");
    await expect(makes).toHaveCSS("color", rgb(COLORS.accent));
    await expect(logo.locator("p")).toHaveCSS("color", rgb(COLORS.text));
    await expect(logo).toHaveCSS("text-decoration-line", "none");

    // The icon sits beside the name, centred on it
    const [iconBox, nameBox] = await Promise.all([
      icon.boundingBox(),
      logo.locator("p").boundingBox(),
    ]);
    expect(nameBox!.x).toBeGreaterThan(iconBox!.x + iconBox!.width);
    const middle = (b: { y: number; height: number }) => b.y + b.height / 2;
    expect(Math.abs(middle(nameBox!) - middle(iconBox!))).toBeLessThan(2);
  });

  test("the logo, menu and button sit on one line, spread across it", async ({ page }) => {
    const items = page.locator("header #site-menu a");
    await expect(items).toHaveText(["Projects", "Build log", "Videos", "About"]);

    const [logo, menu, button] = await Promise.all(
      ["#site-logo", "#site-menu", "#site-subscribe"].map(
        async (id) => (await page.locator(`header ${id}`).boundingBox())!
      )
    );
    expect(menu.x).toBeGreaterThan(logo.x + logo.width);
    expect(button.x).toBeGreaterThan(menu.x + menu.width);
    const middle = (b: { y: number; height: number }) => b.y + b.height / 2;
    expect(Math.abs(middle(menu) - middle(logo))).toBeLessThan(2);
    expect(Math.abs(middle(button) - middle(logo))).toBeLessThan(2);
  });

  // Set to page width: as wide as the theme's page width, centred in the
  // header, while the header's border still runs the full width
  test("lines up with the page width, centred", async ({ page }) => {
    const rem = parseFloat(DEFAULT_THEME.pageWidth); // e.g. "77.5rem"
    expect(DEFAULT_THEME.pageWidth).toMatch(/rem$/);
    const header = page.locator("header");
    const bar = await header.locator("#site-header").boundingBox();
    const outer = await header.boundingBox();
    expect(bar!.width).toBeCloseTo(rem * 16, 0);
    const left = bar!.x - outer!.x;
    const right = outer!.x + outer!.width - (bar!.x + bar!.width);
    expect(Math.abs(left - right)).toBeLessThan(1);
    expect(left).toBeGreaterThan(24);
  });

  // A narrow template's content is the content width, inside the padding,
  // so it lines up with a Container set to the same width. The page is
  // short, so this also checks the column doesn't shrink to its content.
  test("the content column is the theme's content width, centred", async ({ page }) => {
    expect(DEFAULT_THEME.contentWidth).toMatch(/rem$/);
    const width = parseFloat(DEFAULT_THEME.contentWidth) * 16;
    const title = await page.locator("main > h1").boundingBox();
    const main = await page.locator("main").evaluate((el) => {
      const b = el.getBoundingClientRect();
      const c = getComputedStyle(el);
      return {
        left: b.left + parseFloat(c.paddingLeft),
        right: b.right - parseFloat(c.paddingRight),
        // the template's grid, the space the column is centred in
        page: el.parentElement!.getBoundingClientRect().width,
      };
    });
    expect(main.right - main.left).toBeCloseTo(width, 0);
    expect(Math.abs(main.left - (main.page - width) / 2)).toBeLessThan(1);
    expect(Math.abs(title!.x - main.left)).toBeLessThan(1);
  });

  test("the button opens YouTube in a new tab", async ({ page }) => {
    const button = page.locator("header #site-subscribe");
    await expect(button).toHaveText("Subscribe on YouTube");
    await expect(button).toHaveAttribute("href", "https://www.youtube.com/");
    await expect(button).toHaveAttribute("target", "_blank");
    await expect(button).toHaveCSS("background-color", rgb(COLORS.text));
  });
});
