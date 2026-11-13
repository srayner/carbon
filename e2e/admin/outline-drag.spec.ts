import { test, expect, APIRequestContext, Locator, Page } from "@playwright/test";
import { DEFAULT_TEMPLATE_ID } from "../../config/templates";
import { LEAVE_MESSAGE } from "../../lib/leave-guard";
import { outline, outlineRow as row, outlineRows as rows, selectedRow } from "../outline";

/*
 * Moving blocks in the editor's outline by dragging them, or with the
 * keyboard. Which places a block may go is unit tested in
 * lib/block-tree.test.ts; these check a real drag reaches the page and is
 * saved. Each test makes its own page through the API and deletes it after.
 */

type NewBlock = { id: string; type: string; parentId?: string; properties: Record<string, string> };
type SavedBlock = NewBlock & { parentId: string | null };

let pageId: string | null = null;

const createPage = async (request: APIRequestContext, blocks: NewBlock[]) => {
  const response = await request.post("/api/pages", {
    data: {
      title: "Drag test",
      slug: `drag-test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      templateId: DEFAULT_TEMPLATE_ID,
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

const savedBlocks = async (request: APIRequestContext): Promise<SavedBlock[]> =>
  (await (await request.get(`/api/pages/${pageId}`)).json()).page.blocks;

const paragraph = (id: string, content: string, parentId?: string): NewBlock => ({
  id,
  type: "Paragraph",
  properties: { content, cssId: id },
  ...(parentId && { parentId }),
});
const container = (id: string): NewBlock => ({
  id,
  type: "Container",
  properties: { direction: "column", cssId: id },
});

//   intro
//   box
//     child
//   outro
const layout = () => [
  paragraph("intro", "Intro text"),
  container("box"),
  paragraph("child", "Child text", "box"),
  paragraph("outro", "Outro text"),
];

const canvas = (page: Page) => page.locator(".site-theme");
const unsaved = (page: Page) => page.getByRole("status").filter({ hasText: "Unsaved changes" });

const outlineRows = (page: Page) => rows(page, "id");

/** The canvas as "id" or "parent>id", top to bottom. */
const canvasBlocks = (page: Page) =>
  canvas(page)
    .locator("[data-block-id]")
    .evaluateAll((frames) =>
      frames.map((f) => {
        const parent = f.parentElement?.closest("[data-block-id]") as HTMLElement | null;
        const id = (f as HTMLElement).dataset.blockId;
        return parent ? `${parent.dataset.blockId}>${id}` : id;
      })
    );

/** Picks a row up with the mouse and holds it near the top or bottom of another row. */
const hold = async (page: Page, id: string, onto: string, half: "top" | "bottom") => {
  const from = (await row(page, id).boundingBox())!;
  const to = (await row(page, onto).boundingBox())!;
  await page.mouse.move(from.x + 60, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + 60, half === "top" ? to.y + 4 : to.y + to.height - 4, { steps: 8 });
};

/** Drags a row onto the top or bottom half of another row and drops it. */
const drag = async (page: Page, id: string, onto: string, half: "top" | "bottom") => {
  await hold(page, id, onto, half);
  await page.mouse.up();
};

const openEditor = async (page: Page) => {
  await page.goto(`/admin/pages/${pageId}`);
  await expect(canvas(page).getByText("Outro text")).toBeVisible();
};

test.describe("dragging blocks in the outline", () => {
  test("moves among siblings, into and out of a container, and saves the layout", async ({
    page,
    request,
  }) => {
    await createPage(request, layout());
    await openEditor(page);

    // Among the top-level blocks
    await drag(page, "outro", "intro", "top");
    await expect.poll(() => outlineRows(page)).toEqual(["0:outro", "0:intro", "0:box", "1:child"]);
    await expect.poll(() => canvasBlocks(page)).toEqual(["outro", "intro", "box", "box>child"]);
    // An unsaved change, with the moved block selected
    await expect(unsaved(page)).toBeVisible();
    await expect(page.getByRole("button", { name: "Save" })).toBeEnabled();
    await expect(selectedRow(page)).toHaveAttribute("data-block-id", "outro");

    // Into the container: the bottom half of its row is its start
    await drag(page, "intro", "box", "bottom");
    await expect.poll(() => outlineRows(page)).toEqual(["0:outro", "0:box", "1:intro", "1:child"]);
    await expect.poll(() => canvasBlocks(page)).toEqual(["outro", "box", "box>intro", "box>child"]);
    await expect(selectedRow(page)).toHaveAttribute("data-block-id", "intro");

    // Out of it, before a top-level block, keeping its content
    await drag(page, "child", "outro", "top");
    await expect.poll(() => outlineRows(page)).toEqual(["0:child", "0:outro", "0:box", "1:intro"]);
    await expect(canvas(page).locator('[data-block-id="child"]')).toContainText("Child text");

    // Leaving now warns first
    const dialogs: string[] = [];
    page.on("dialog", async (dialog) => {
      dialogs.push(dialog.message());
      await dialog.dismiss();
    });
    await page.locator('a[href="/admin/categories"]').first().click();
    await expect.poll(() => dialogs).toEqual([LEAVE_MESSAGE]);

    // Saved, and the same after a reload
    const saved = page.waitForResponse(
      (r) => r.url().includes("/api/pages/") && r.request().method() === "PUT"
    );
    await page.getByRole("button", { name: "Save" }).click();
    expect((await saved).ok()).toBe(true);
    await expect(unsaved(page)).toHaveCount(0);

    const blocks = await savedBlocks(request);
    expect(blocks.map((b) => [b.id, b.parentId, b.properties.content])).toEqual([
      ["child", null, "Child text"],
      ["outro", null, "Outro text"],
      ["box", null, undefined],
      ["intro", "box", "Intro text"],
    ]);
    await page.reload();
    await expect.poll(() => outlineRows(page)).toEqual(["0:child", "0:outro", "0:box", "1:intro"]);
  });

  test("a container dragged onto its own child shows no drop place and stays put", async ({
    page,
    request,
  }) => {
    await createPage(request, layout());
    await openEditor(page);
    const before = await outlineRows(page);
    const markers = outline(page).locator("[data-drop-marker]");

    // A place it may go gets a line, so the checks below can fail
    await hold(page, "box", "outro", "top");
    await expect(markers).toHaveCount(1);
    // Over its own child: no line marks a place
    const child = (await row(page, "child").boundingBox())!;
    await page.mouse.move(child.x + 60, child.y + 4, { steps: 8 });
    await expect(markers).toHaveCount(0);
    // Screen readers hear the same
    await expect(page.getByRole("status").filter({ hasText: "Can't move it here." })).toBeAttached();
    await page.mouse.up();

    expect(await outlineRows(page)).toEqual(before);
    await expect(unsaved(page)).toHaveCount(0);
  });
});

test.describe("moving a block with the keyboard", () => {
  // The handle is the row's "Move <type>" button (the arrows are "Move <type> up/down")
  const handle = (page: Page, id: string): Locator =>
    row(page, id).getByRole("button", { name: "Move Paragraph", exact: true });

  test("Space picks it up, the arrows choose a place, Enter drops it", async ({
    page,
    request,
  }) => {
    await createPage(request, layout());
    await openEditor(page);

    await handle(page, "outro").focus();
    await page.keyboard.press("Space");
    // From its own place, one up is the end of the container
    await page.keyboard.press("ArrowUp");
    await expect(outline(page).getByText("At the end of Container")).toBeAttached();
    await page.keyboard.press("Enter");

    await expect.poll(() => outlineRows(page)).toEqual(["0:intro", "0:box", "1:child", "1:outro"]);
    await expect(unsaved(page)).toBeVisible();
    await expect(selectedRow(page)).toHaveAttribute("data-block-id", "outro");
    // Focus stays on the moved block, so it can be moved again
    await expect(handle(page, "outro")).toBeFocused();

    // Escape puts it back where it was
    await page.keyboard.press("Space");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("ArrowUp");
    await page.keyboard.press("Escape");
    await expect(outline(page).locator("[data-drop-marker]")).toHaveCount(0);
    expect(await outlineRows(page)).toEqual(["0:intro", "0:box", "1:child", "1:outro"]);
  });

  test("a drop in its own place changes nothing and leaves focus alone", async ({
    page,
    request,
  }) => {
    await createPage(request, layout());
    await openEditor(page);
    const before = await outlineRows(page);

    await handle(page, "outro").focus();
    await page.keyboard.press("Space");
    await page.keyboard.press("Enter");
    expect(await outlineRows(page)).toEqual(before);
    await expect(unsaved(page)).toHaveCount(0);
    await expect(selectedRow(page)).toHaveCount(0);

    // Editing afterwards keeps the focus where the user put it
    const text = canvas(page).locator(".ProseMirror", { hasText: "Intro text" });
    await text.click();
    await page.keyboard.type(" more");
    await expect(text).toBeFocused();
    await expect(text).toContainText("Intro text more");
  });
});
