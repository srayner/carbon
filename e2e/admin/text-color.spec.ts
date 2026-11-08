import { test, expect } from "@playwright/test";
import { DEFAULT_TEMPLATE_ID } from "../../config/templates";
import { COLORS, rgb } from "../helpers";
import { DEFAULT_THEME } from "../../lib/theme";

let pageId: string | null = null;

test.afterEach(async ({ request }) => {
  if (pageId) await request.delete(`/api/pages/${pageId}`);
  pageId = null;
});

test("a word coloured Accent in rich text is saved and shown in the theme's accent", async ({
  page,
  request,
}) => {
  const slug = `text-color-test-${Date.now()}`;
  const created = await request.post("/api/pages", {
    data: {
      title: "Text colour test",
      slug,
      templateId: DEFAULT_TEMPLATE_ID,
      publishedAt: new Date(Date.now() - 60_000).toISOString(),
      blocks: [
        {
          id: "logo",
          type: "RichText",
          properties: { content: "<p>Steve Rayner Makes</p>", cssId: "logo-text" },
        },
      ],
    },
  });
  expect(created.ok(), await created.text()).toBe(true);
  pageId = (await created.json()).id;

  await page.goto(`/admin/pages/${pageId}`);
  const editor = page.locator(".ProseMirror", { hasText: "Steve Rayner Makes" });

  // Select the last word, as an author would with the keyboard
  await editor.click();
  await page.keyboard.press("End");
  await page.keyboard.press("Control+Shift+ArrowLeft");
  await page.getByRole("button", { name: "accent", exact: true }).click();

  // Coloured on the canvas straight away, and the button shows it is on
  const word = editor.locator("span.site-text-accent");
  await expect(word).toHaveText("Makes");
  await expect(word).toHaveCSS("color", rgb(COLORS.accent));
  await expect(page.getByRole("button", { name: "accent", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true"
  );

  // The editor keeps its text when it loses focus
  await page.getByRole("heading", { name: "Blocks", exact: true }).click();
  const saved = page.waitForResponse(
    (r) => r.url().includes("/api/pages/") && r.request().method() === "PUT"
  );
  await page.getByRole("button", { name: "Save" }).click();
  expect((await saved).ok()).toBe(true);

  const stored = await (await request.get(`/api/pages/${pageId}`)).json();
  expect(stored.page.blocks[0].properties.content).toBe(
    '<p>Steve Rayner <span class="site-text-accent">Makes</span></p>'
  );

  // Only that word changes colour on the site
  await page.goto(`/${slug}`);
  const published = page.locator("#logo-text");
  await expect(published.locator("span.site-text-accent")).toHaveText("Makes");
  await expect(published.locator("span.site-text-accent")).toHaveCSS("color", rgb(COLORS.accent));
  await expect(published.locator("p")).toHaveCSS("color", rgb(COLORS.text));
});

// The canvas shows a RichText at the Text size set on the block, as the site does
test("a RichText's Text size shows in the editor and on the site", async ({ page, request }) => {
  const slug = `text-size-test-${Date.now()}`;
  const created = await request.post("/api/pages", {
    data: {
      title: "Text size test",
      slug,
      templateId: DEFAULT_TEMPLATE_ID,
      publishedAt: new Date(Date.now() - 60_000).toISOString(),
      blocks: [
        {
          id: "sized",
          type: "RichText",
          properties: { content: "<p>Sized text</p>", textSize: "xl", cssId: "sized" },
        },
      ],
    },
  });
  expect(created.ok(), await created.text()).toBe(true);
  pageId = (await created.json()).id;

  // xl in the default theme
  const xl = `${parseFloat(DEFAULT_THEME.textSize.xl) * 16}px`;
  await page.goto(`/admin/pages/${pageId}`);
  await expect(page.locator(".ProseMirror p", { hasText: "Sized text" })).toHaveCSS("font-size", xl);

  await page.goto(`/${slug}`);
  await expect(page.locator("#sized p")).toHaveCSS("font-size", xl);
});
