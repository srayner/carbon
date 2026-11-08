import { test, expect, Page } from "@playwright/test";

// A page with an empty slug is the home page, shown at "/". Only one page
// can be the home page.

const openPage = async (page: Page, title: string, slug: string) => {
  // The admin search matches titles, as a user would search
  const response = await page.request.get(`/api/pages?search=${encodeURIComponent(title)}`);
  const { content } = await response.json();
  const found = content.find((p: { title: string }) => p.title === title);
  await page.goto(`/admin/pages/${found.id}`);
  // Loaded: an empty slug can't show it, since a page still loading has one
  await expect(page.getByPlaceholder("Page title")).toHaveValue(title);
  await expect(page.getByPlaceholder("page-slug")).toHaveValue(slug);
};

const setSlug = async (page: Page, slug: string) => {
  await page.getByPlaceholder("page-slug").fill(slug);
  await page.getByRole("button", { name: "Save" }).click();
};

test("a page with an empty slug is the home page, and there is only one", async ({
  page,
  browser,
}) => {
  // Leaving the editor with the refused change unsaved asks first: leave
  page.on("dialog", (dialog) => dialog.accept());
  await openPage(page, "Hello World", "hello-world");
  await setSlug(page, "");
  await expect(page.getByText("Page saved.")).toBeVisible();
  await expect(page.getByText("This is the home page.")).toBeVisible();

  try {
    // A guest sees it at "/"
    const guest = await browser.newPage({ storageState: { cookies: [], origins: [] } });
    await guest.goto("/");
    await expect(guest.getByRole("heading", { name: "Hello World" })).toBeVisible();
    await expect(guest.getByRole("link", { name: "Log in" })).toHaveCount(0);
    await guest.close();

    // A second page can't take the empty slug
    await openPage(page, "Desk Lamp", "desk-lamp");
    await setSlug(page, "");
    await expect(
      page.getByText('"Hello World" is already the home page. Give it a slug first.')
    ).toBeVisible();
    await expect(page.getByRole("status").filter({ hasText: "Unsaved changes" })).toBeVisible();
  } finally {
    // Put it back so the run can be repeated, and "/" has no home page again
    await openPage(page, "Hello World", "");
    await setSlug(page, "hello-world");
    await expect(page.getByText("Page saved.")).toBeVisible();
  }
});
