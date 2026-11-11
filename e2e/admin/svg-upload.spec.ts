import { test, expect } from "@playwright/test";
import { unlink } from "fs/promises";
import path from "path";
import { DEFAULT_TEMPLATE_ID } from "../../config/templates";

// A logo-style icon: a rounded square with a crosshair, 40 x 40
const ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
  <rect x="2" y="2" width="36" height="36" rx="6" fill="none" stroke="#141413" stroke-width="2.5"/>
  <circle cx="20" cy="20" r="6" fill="none" stroke="#141413" stroke-width="2.5"/>
  <path d="M20 6v8M20 26v8M6 20h8M26 20h8" stroke="#141413" stroke-width="2.5"/>
</svg>`;

// A hostile SVG: it draws a square, and its inline script marks the document.
// An inline script runs while the file is parsed, so by the time the page has
// loaded it has either run or been blocked.
const HOSTILE = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40">
  <rect width="40" height="40" fill="#141413"/>
  <script>document.documentElement.setAttribute("data-script-ran", "yes");</script>
</svg>`;

let pageId: string | null = null;
let uploaded: string | null = null;

test.afterEach(async ({ request }) => {
  if (pageId) await request.delete(`/api/pages/${pageId}`);
  // The test server stores uploads in ./uploads (see lib/uploads.ts)
  if (uploaded) await unlink(path.resolve("uploads", path.basename(uploaded))).catch(() => {});
  pageId = null;
  uploaded = null;
});

test("an SVG uploaded to an Image block is saved and shown on the site", async ({
  page,
  request,
}) => {
  const slug = `svg-test-${Date.now()}`;
  const created = await request.post("/api/pages", {
    data: {
      title: "SVG test",
      slug,
      templateId: DEFAULT_TEMPLATE_ID,
      publishedAt: new Date(Date.now() - 60_000).toISOString(),
      blocks: [],
    },
  });
  expect(created.ok(), await created.text()).toBe(true);
  pageId = (await created.json()).id;

  await page.goto(`/admin/pages/${pageId}`);
  await page.getByRole("button", { name: "+ Add Block" }).click();
  await page.locator("aside select").first().selectOption("Image");
  await page.getByRole("button", { name: "Add", exact: true }).click();

  // Upload through the field's own button, as an author would
  const chooser = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "Upload image…" }).click();
  await (await chooser).setFiles({
    name: "logo-icon.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from(ICON),
  });
  const url = page.getByPlaceholder("Image URL");
  await expect(url).toHaveValue(/^\/files\/[a-f0-9]{12}-logo-icon\.svg$/);
  uploaded = await url.inputValue();

  const saved = page.waitForResponse(
    (r) => r.url().includes("/api/pages/") && r.request().method() === "PUT"
  );
  await page.getByRole("button", { name: "Save" }).click();
  expect((await saved).ok()).toBe(true);

  // Served as an SVG image, shown in the page, not offered as a download
  const file = await request.get(uploaded);
  expect(file.headers()["content-type"]).toBe("image/svg+xml");
  expect(file.headers()["content-disposition"]).toMatch(/^inline/);

  await page.goto(`/${slug}`);
  const img = page.locator(`main img[src="${uploaded}"]`);
  await expect(img).toBeVisible();
  // It loaded and drew: a broken image has no natural width
  expect(await img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBe(40);
});

test("a script in an uploaded SVG doesn't run when the file is opened directly", async ({
  page,
  request,
}) => {
  const res = await request.post("/api/upload", {
    multipart: {
      file: { name: "hostile.svg", mimeType: "image/svg+xml", buffer: Buffer.from(HOSTILE) },
    },
  });
  expect(res.status(), await res.text()).toBe(201);
  uploaded = (await res.json()).url as string;

  // Opened by a logged-in admin, as a malicious link would be. goto waits for
  // the load event, after which the inline script has run or been blocked.
  const opened = await page.goto(uploaded);
  expect(opened?.status()).toBe(200);
  expect(opened?.headers()["content-type"]).toBe("image/svg+xml");

  // The drawing is still there, but the script didn't run
  await expect(page.locator("rect")).toHaveCount(1);
  await expect(page.locator(":root")).not.toHaveAttribute("data-script-ran");

  // And the file isn't treated as part of the site: any script that did get
  // in would have no access to its cookies or same-origin API calls
  expect(await page.evaluate(() => window.origin)).toBe("null");
});
