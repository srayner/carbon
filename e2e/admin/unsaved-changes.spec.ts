import { test, expect, Page } from "@playwright/test";
import { LEAVE_MESSAGE } from "../../lib/leave-guard";

// The page editor says when there are unsaved changes, confirms a save, and
// warns before leaving with changes unsaved. Its Preview button opens the
// saved page in a new tab. Which link clicks ask first is unit tested in
// lib/leave-guard.test.ts; the fragment and theme screens share the same hook.

test.describe.configure({ mode: "serial" });

const openHelloWorld = async (page: Page) => {
  // The admin search matches titles, as a user would search
  const response = await page.request.get("/api/pages?search=Hello%20World");
  const { content } = await response.json();
  const found = content.find((p: { slug: string }) => p.slug === "hello-world");
  await page.goto(`/admin/pages/${found.id}`);
  // Loaded: the settings show the page's slug, and the text editors are up
  await expect(page.getByPlaceholder("page-slug")).toHaveValue("hello-world");
  await expect(richText(page)).toBeVisible();
};

const richText = (page: Page) =>
  page.locator(".ProseMirror", { hasText: "Resistor" });

const saveButton = (page: Page) => page.getByRole("button", { name: "Save" });
const unsaved = (page: Page) =>
  page.getByRole("status").filter({ hasText: "Unsaved changes" });
const summary = (page: Page) =>
  page.getByPlaceholder("A one or two sentence description");

test.describe("the page editor's save state and preview", () => {
  test("an unchanged page has nothing to save and previews in a new tab", async ({
    page,
  }) => {
    await openHelloWorld(page);

    await expect(saveButton(page)).toBeDisabled();
    await expect(unsaved(page)).toHaveCount(0);

    const [tab] = await Promise.all([
      page.waitForEvent("popup"),
      page.getByRole("link", { name: "Preview" }).click(),
    ]);
    await expect(tab).toHaveURL(/\/hello-world$/);
    await expect(tab.getByText("Hello World").first()).toBeVisible();
    // The editor stays where it was
    await expect(page).toHaveURL(/\/admin\/pages\//);
  });

  test("an edit shows as unsaved and holds back the preview until it is saved", async ({
    page,
  }) => {
    await openHelloWorld(page);
    const original = await summary(page).inputValue();

    const saveSummary = async (value: string) => {
      await summary(page).fill(value);
      await expect(unsaved(page)).toBeVisible();
      // The preview would show the old version
      await expect(page.getByRole("button", { name: "Preview" })).toBeDisabled();

      await saveButton(page).click();
      await expect(page.getByText("Page saved.").first()).toBeVisible();
      await expect(unsaved(page)).toHaveCount(0);
      await expect(saveButton(page)).toBeDisabled();
      await expect(page.getByRole("link", { name: "Preview" })).toBeVisible();
    };

    await saveSummary("Edited summary");
    // Really saved: it is there after a reload
    await page.reload();
    await expect(summary(page)).toHaveValue("Edited summary");

    // Put it back so the run can be repeated
    await saveSummary(original);
  });

  test("typing in rich text is unsaved at once, before the editor loses focus", async ({
    page,
  }) => {
    await openHelloWorld(page);
    const line = "A line added by the test";
    // Makes an edit, checks it shows as unsaved while the cursor is still in
    // the editor, then saves
    const editAndSave = async (edit: () => Promise<void>) => {
      await edit();
      await expect(richText(page)).toBeFocused();
      await expect(unsaved(page)).toBeVisible();
      await saveButton(page).click();
      await expect(page.getByText("Page saved.").first()).toBeVisible();
      await expect(unsaved(page)).toHaveCount(0);
    };

    // Type a line at the end of the block, below the table
    await editAndSave(async () => {
      await richText(page).getByText("Resistor").click();
      await page.keyboard.press("Control+End");
      await page.keyboard.type(line);
    });
    // Really saved: it is there after a reload
    await page.reload();
    await expect(richText(page)).toContainText(line);

    // Put it back so the run can be repeated: select the line and delete it
    await editAndSave(async () => {
      await richText(page).getByText(line).click({ clickCount: 3 });
      await page.keyboard.press("Backspace");
    });
    await page.reload();
    await expect(richText(page)).toContainText("Capacitor4");
    await expect(richText(page)).not.toContainText(line);
  });

  test("a failed save is reported and the changes stay unsaved", async ({ page }) => {
    await openHelloWorld(page);
    // Another page already has this slug, so the server refuses it
    await page.getByPlaceholder("page-slug").fill("desk-lamp");
    await saveButton(page).click();

    await expect(page.getByText("Page saved.")).toHaveCount(0);
    await expect(unsaved(page)).toBeVisible();
    await expect(saveButton(page)).toBeEnabled();
  });
});

test.describe("leaving the page editor with unsaved changes", () => {
  test("a link in the app asks first, and staying keeps the changes", async ({
    page,
  }) => {
    await openHelloWorld(page);
    await summary(page).fill("Not saved yet");

    const dialogs: string[] = [];
    page.on("dialog", async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });
    await page.locator('a[href="/admin/categories"]').first().click();

    await expect.poll(() => dialogs).toEqual([LEAVE_MESSAGE]);
    await expect(page).toHaveURL(/\/admin\/pages\//);
    await expect(summary(page)).toHaveValue("Not saved yet");
  });
});
