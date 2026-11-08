import { test, expect, APIRequestContext, Page } from "@playwright/test";
import { DEFAULT_TEMPLATE_ID } from "../../config/templates";
import { COLORS, rgb } from "../helpers";

type NewBlock = { id: string; type: string; properties: Record<string, string> };

// Each test makes its own published page through the API and deletes it after
let pageId: string | null = null;
let slug = "";

const createPage = async (request: APIRequestContext, blocks: NewBlock[] = []) => {
  slug = `link-test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const response = await request.post("/api/pages", {
    data: {
      title: "Link test",
      slug,
      templateId: DEFAULT_TEMPLATE_ID,
      publishedAt: new Date(Date.now() - 60_000).toISOString(),
      blocks,
    },
  });
  expect(response.ok(), await response.text()).toBe(true);
  pageId = (await response.json()).id;
};

test.afterEach(async ({ request }) => {
  if (pageId) await request.delete(`/api/pages/${pageId}`);
  pageId = null;
});

const field = (page: Page, label: string) =>
  page.locator("label", { hasText: new RegExp(`^${label}$`) }).locator("..");

test("saving a Link to a javascript: address is refused, and the page is left as it was", async ({
  request,
}) => {
  const link = { id: "link", type: "Link", properties: { label: "Go", url: "/hello-world" } };
  await createPage(request, [link]);

  const response = await request.put(`/api/pages/${pageId}`, {
    data: {
      title: "Link test",
      slug,
      templateId: DEFAULT_TEMPLATE_ID,
      blocks: [{ ...link, properties: { label: "Go", url: "javascript:alert(1)" } }],
    },
  });
  expect(response.status()).toBe(400);
  expect((await response.json()).error).toMatch(/Link "Link to" can't be saved/);

  const saved = await (await request.get(`/api/pages/${pageId}`)).json();
  expect(saved.page.blocks.map((b: NewBlock) => b.properties.url)).toEqual(["/hello-world"]);
});

test("a Link set up in the panel is saved and published as a button", async ({
  page,
  request,
}) => {
  await createPage(request);
  await page.goto(`/admin/pages/${pageId}`);

  await page.getByRole("button", { name: "+ Add Block" }).click();
  await page.locator("aside select").first().selectOption("Link");
  await page.getByRole("button", { name: "Add", exact: true }).click();

  await field(page, "Text").locator("input").fill("Read the build log");
  const url = field(page, "Link to").locator("input");

  // An address that saving would refuse is flagged while typing
  await url.fill("javascript:alert(1)");
  await expect(page.getByRole("alert").filter({ hasText: "web address" })).toBeVisible();
  await url.fill("/hello-world");
  await expect(page.getByRole("alert").filter({ hasText: "web address" })).toHaveCount(0);

  // The checkbox sits on the same line as its label, which ticks it
  const newTab = page.getByLabel("Open in a new tab");
  const [box, label] = await Promise.all([
    newTab.boundingBox(),
    page.locator("label", { hasText: "Open in a new tab" }).boundingBox(),
  ]);
  expect(box!.height).toBeLessThan(label!.height + 1);
  expect(box!.x).toBeLessThan(label!.x + 8);
  await page.getByText("Open in a new tab").click();
  await expect(newTab).toBeChecked();

  await page.locator("summary", { hasText: /^Appearance$/ }).click();
  await field(page, "Style").locator("select").selectOption("button");

  // The canvas shows the button, but doesn't follow it
  const preview = page.locator(".site-theme .site-link", { hasText: "Read the build log" });
  await expect(preview).toHaveClass(/site-link-button/);
  await expect(preview).not.toHaveAttribute("href", /.*/);

  const saved = page.waitForResponse(
    (r) => r.url().includes("/api/pages/") && r.request().method() === "PUT"
  );
  await page.getByRole("button", { name: "Save" }).click();
  expect((await saved).ok()).toBe(true);

  await page.goto(`/${slug}`);
  const published = page.getByRole("link", { name: "Read the build log" });
  await expect(published).toHaveAttribute("href", "/hello-world");
  await expect(published).toHaveAttribute("target", "_blank");
  await expect(published).toHaveCSS("background-color", rgb(COLORS.text));
});
