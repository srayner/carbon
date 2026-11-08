import { test, expect, APIRequestContext, Page } from "@playwright/test";
import { DEFAULT_TEMPLATE_ID } from "../../config/templates";
import { MAX_DEPTH } from "../../lib/block-tree";

type SavedBlock = { id: string; type: string; parentId: string | null; order: number; properties: Record<string, string> };
type NewBlock = { id: string; type: string; parentId?: string; properties: Record<string, string> };

/*
 * Each test makes its own published page through the API, and deletes it
 * afterwards, so the tests don't depend on each other or on the seed.
 */
let pageId: string | null = null;
let slug = "";

const createPage = async (request: APIRequestContext, blocks: NewBlock[] = []) => {
  slug = `container-test-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const response = await request.post("/api/pages", {
    data: {
      title: "Container test",
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

const savedBlocks = async (request: APIRequestContext): Promise<SavedBlock[]> => {
  const response = await request.get(`/api/pages/${pageId}`);
  return (await response.json()).page.blocks;
};

const openEditor = (page: Page) => page.goto(`/admin/pages/${pageId}`);

const save = async (page: Page) => {
  const saved = page.waitForResponse(
    (r) => r.url().includes("/api/pages/") && r.request().method() === "PUT"
  );
  await page.getByRole("button", { name: "Save" }).click();
  const response = await saved;
  expect(response.ok(), await response.text()).toBe(true);
};

const outline = (page: Page) =>
  page.locator("aside", { has: page.getByRole("heading", { name: "Blocks", exact: true }) });
const canvas = (page: Page) => page.locator(".site-theme");

/** The outline as "depth:Type" lines, top to bottom. */
const outlineRows = (page: Page) =>
  outline(page)
    .locator("[data-depth]")
    .evaluateAll((rows) =>
      rows.map((r) => `${(r as HTMLElement).dataset.depth}:${r.querySelector("span")!.textContent}`)
    );

/** Adds a block with the bottom button (parent: null) or a container's "+". */
const addBlock = async (page: Page, type: string, parentRow?: number) => {
  if (parentRow === undefined) {
    await page.getByRole("button", { name: "+ Add Block" }).click();
  } else {
    await outline(page)
      .getByRole("button", { name: "Add block inside Container" })
      .nth(parentRow)
      .click();
  }
  await outline(page).locator("select").selectOption(type);
  await outline(page).getByRole("button", { name: "Add", exact: true }).click();
};

const paragraph = (id: string, content: string, parentId?: string): NewBlock => ({
  id,
  type: "Paragraph",
  properties: { content, cssId: id },
  ...(parentId && { parentId }),
});
const container = (id: string, parentId?: string, direction = "column"): NewBlock => ({
  id,
  type: "Container",
  properties: { direction, cssId: id },
  ...(parentId && { parentId }),
});

// Building a layout in the editor and getting the same layout on the site
test.describe("adding blocks inside a container", () => {
  test("adds them inside it, then saves and publishes the nesting", async ({ page, request }) => {
    await createPage(request);
    await openEditor(page);

    await addBlock(page, "Container");
    await addBlock(page, "Paragraph", 0);
    await addBlock(page, "Heading", 0);
    await addBlock(page, "Paragraph"); // top level, after the container

    await expect.poll(() => outlineRows(page)).toEqual([
      "0:Container",
      "1:Paragraph",
      "1:Heading",
      "0:Paragraph",
    ]);
    // On the canvas the two children are drawn inside the container
    const box = canvas(page).locator(".block-container");
    await expect(box.locator("> [data-block-id]")).toHaveCount(2);
    await expect(box.getByText("My Fancy Heading")).toBeVisible();

    await save(page);
    const blocks = await savedBlocks(request);
    const [outer, child1, child2, after] = blocks;
    expect(blocks.map((b) => b.type)).toEqual(["Container", "Paragraph", "Heading", "Paragraph"]);
    expect([outer.parentId, child1.parentId, child2.parentId, after.parentId]).toEqual([
      null,
      outer.id,
      outer.id,
      null,
    ]);

    // Still nested after a reload
    await page.reload();
    await expect.poll(() => outlineRows(page)).toEqual([
      "0:Container",
      "1:Paragraph",
      "1:Heading",
      "0:Paragraph",
    ]);

    await page.goto(`/${slug}`);
    const published = page.locator("main .block-container");
    await expect(published.locator("> *")).toHaveCount(2);
    await expect(
      published.locator("> .block-item > :is(h1, h2, h3, h4, h5, h6)")
    ).toHaveText("My Fancy Heading");
    await expect(page.locator("main > p")).toHaveCount(1);
  });

  test("selecting a block inside a container selects that block, not the container", async ({
    page,
    request,
  }) => {
    await createPage(request, [container("outer"), paragraph("inner", "Inner text", "outer")]);
    await openEditor(page);

    await canvas(page).getByText("Inner text").click();
    await expect(page.getByText("Paragraph Properties")).toBeVisible();
    await expect(outline(page).locator("[data-depth='1']")).toHaveClass(/border-ring/);
    await expect(outline(page).locator("[data-depth='0']")).not.toHaveClass(/border-ring/);
  });

  test(`stops at ${MAX_DEPTH} containers deep`, async ({ page, request }) => {
    // Containers nested down to the deepest level allowed
    const chain = Array.from({ length: MAX_DEPTH + 1 }, (_, d) =>
      container(`c${d}`, d ? `c${d - 1}` : undefined)
    );
    await createPage(request, chain);
    await openEditor(page);

    const plus = outline(page).getByRole("button", { name: "Add block inside Container" });
    await expect(plus).toHaveCount(MAX_DEPTH + 1);
    // The deepest container cannot hold anything
    await expect(plus.last()).toBeDisabled();
    await expect(plus.nth(MAX_DEPTH - 1)).toBeEnabled();

    // One level up, blocks can still be added, but not a container that
    // could hold nothing
    await plus.nth(MAX_DEPTH - 1).click();
    const options = await outline(page).locator("select option").allTextContents();
    expect(options).not.toContain("Container");
    expect(options).toContain("Paragraph");
  });
});

// Removing children, and containers with their children
test.describe("deleting", () => {
  const nested = () => [
    paragraph("intro", "Intro"),
    container("outer"),
    paragraph("a", "Child A", "outer"),
    container("inner", "outer"),
    paragraph("b", "Child B", "inner"),
    paragraph("outro", "Outro"),
  ];

  test("a child leaves its container and siblings alone", async ({ page, request }) => {
    await createPage(request, nested());
    await openEditor(page);

    await outline(page).locator("[data-depth='1']", { hasText: "Paragraph" })
      .getByRole("button", { name: "Delete Paragraph" }).click();
    await save(page);

    expect((await savedBlocks(request)).map((b) => b.id)).toEqual([
      "intro", "outer", "inner", "b", "outro",
    ]);
  });

  test("a container asks first, and keeps everything if cancelled", async ({ page, request }) => {
    await createPage(request, nested());
    await openEditor(page);

    let message = "";
    page.once("dialog", (dialog) => {
      message = dialog.message();
      dialog.dismiss();
    });
    await outline(page).getByRole("button", { name: "Delete Container" }).first().click();
    expect(message).toBe("Delete this Container and the 3 blocks inside it?");
    await expect.poll(() => outlineRows(page)).toHaveLength(6);
  });

  test("a container goes with everything inside it", async ({ page, request }) => {
    await createPage(request, nested());
    await openEditor(page);

    page.once("dialog", (dialog) => dialog.accept());
    await outline(page).getByRole("button", { name: "Delete Container" }).first().click();
    await expect.poll(() => outlineRows(page)).toEqual(["0:Paragraph", "0:Paragraph"]);
    await save(page);

    expect((await savedBlocks(request)).map((b) => b.id)).toEqual(["intro", "outro"]);
    await page.goto(`/${slug}`);
    await expect(page.locator("main")).not.toContainText("Child");
  });

  // Found in code review: the open form kept the deleted container as its
  // target, and pressing Add crashed the editor
  test("a container deleted while adding inside it closes the form, and editing goes on", async ({
    page,
    request,
  }) => {
    await createPage(request, [container("box"), paragraph("p", "Kept")]);
    await openEditor(page);
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await outline(page).getByRole("button", { name: "Add block inside Container" }).click();
    await expect(outline(page).getByText("Adding inside Container")).toBeVisible();
    await outline(page).getByRole("button", { name: "Delete Container" }).click();

    await expect(outline(page).locator("select")).toHaveCount(0);
    await addBlock(page, "Heading");
    await expect.poll(() => outlineRows(page)).toEqual(["0:Paragraph", "0:Heading"]);
    await save(page);
    expect((await savedBlocks(request)).map((b) => [b.type, b.parentId])).toEqual([
      ["Paragraph", null],
      ["Heading", null],
    ]);
    expect(errors).toEqual([]);
  });

  test("an empty container goes without asking", async ({ page, request }) => {
    await createPage(request, [container("empty"), paragraph("p", "Kept")]);
    await openEditor(page);

    let asked = false;
    page.once("dialog", (dialog) => {
      asked = true;
      dialog.dismiss();
    });
    await outline(page).getByRole("button", { name: "Delete Container" }).click();
    await expect.poll(() => outlineRows(page)).toEqual(["0:Paragraph"]);
    expect(asked).toBe(false);
  });
});

// Moving keeps a block among its siblings, and a container takes its children
test.describe("moving", () => {
  test("moves within a container, never out of it", async ({ page, request }) => {
    await createPage(request, [
      container("row", undefined, "row"),
      paragraph("first", "First", "row"),
      paragraph("second", "Second", "row"),
      paragraph("outside", "Outside"),
    ]);
    await openEditor(page);

    const children = outline(page).locator("[data-depth='1']");
    await expect(children.first().getByRole("button", { name: "Move Paragraph up" })).toBeDisabled();
    await expect(children.last().getByRole("button", { name: "Move Paragraph down" })).toBeDisabled();

    await children.last().getByRole("button", { name: "Move Paragraph up" }).click();
    await expect(canvas(page).locator(".block-container")).toHaveText(/Second[\s\S]*First/);
    await save(page);

    const blocks = await savedBlocks(request);
    expect(blocks.map((b) => [b.id, b.parentId])).toEqual([
      ["row", null],
      ["second", "row"],
      ["first", "row"],
      ["outside", null],
    ]);
    await page.goto(`/${slug}`);
    await expect(page.locator("#row > .block-item > p")).toHaveText(["Second", "First"]);
  });

  test("a container moves with everything inside it", async ({ page, request }) => {
    await createPage(request, [
      paragraph("top", "Top"),
      container("box"),
      paragraph("inside", "Inside", "box"),
    ]);
    await openEditor(page);

    await outline(page).getByRole("button", { name: "Move Container up" }).click();
    await expect.poll(() => outlineRows(page)).toEqual(["0:Container", "1:Paragraph", "0:Paragraph"]);
    await save(page);

    expect((await savedBlocks(request)).map((b) => b.id)).toEqual(["box", "inside", "top"]);
  });
});

// Grow is set in the panel and shares out the row, on the canvas and the site
test("Grow set in the panel splits a row evenly, in the editor and on the site", async ({
  page,
  request,
}) => {
  await createPage(request, [
    container("row", undefined, "row"),
    paragraph("short", "Short", "row"),
    paragraph("long", "A much longer paragraph that would take most of the row on its own", "row"),
  ]);
  await openEditor(page);

  const setGrow = async (text: string, value: string) => {
    await canvas(page).getByText(text).click();
    // The panel keeps a group open from one block to the next
    const group = page.locator("details", {
      has: page.locator("summary", { hasText: /^In a container$/ }),
    });
    if (!(await group.evaluate((d) => (d as HTMLDetailsElement).open))) {
      await group.locator("summary").click();
    }
    await page
      .locator("label", { hasText: /^Grow$/ })
      .locator("..")
      .locator("select")
      .selectOption(value);
  };
  const frameWidth = async (id: string) =>
    (await canvas(page).locator(`[data-block-id="${id}"]`).boundingBox())!.width;

  // Sized by content first, so the two differ
  expect(Math.abs((await frameWidth("short")) - (await frameWidth("long")))).toBeGreaterThan(20);

  await setGrow("Short", "1");
  await setGrow("A much longer", "1");
  await expect
    .poll(async () => Math.abs((await frameWidth("short")) - (await frameWidth("long"))))
    .toBeLessThan(1);

  await save(page);
  // The container was made through the API without a Grow; only the two
  // children were changed
  expect((await savedBlocks(request)).map((b) => [b.id, b.properties.grow])).toEqual([
    ["row", undefined],
    ["short", "1"],
    ["long", "1"],
  ]);

  await page.goto(`/${slug}`);
  const [short, long] = await Promise.all(
    ["#short", "#long"].map(async (id) => (await page.locator(id).boundingBox())!.width)
  );
  expect(Math.abs(short - long)).toBeLessThan(1);
});

// A page that already has nested blocks opens as a tree
test("an existing nested page opens with its children inside their containers", async ({
  page,
}) => {
  const response = await page.request.get("/api/pages?search=Layout%20Showcase");
  const { content } = await response.json();
  const showcase = content.find((p: { slug: string }) => p.slug === "layout-showcase");
  await page.goto(`/admin/pages/${showcase.id}`);

  await expect.poll(() => outlineRows(page)).toEqual([
    "0:Container",
    "1:Paragraph",
    "1:Container",
    "2:Paragraph",
    "2:Paragraph",
    "1:Paragraph",
    "0:Paragraph",
    "0:Container",
    "0:Container",
    "1:KeyValueTable",
    "1:Paragraph",
    "0:Container",
    "1:Paragraph",
    "1:Paragraph",
  ]);
  const row = canvas(page).locator(".block-container").first();
  await expect(row.locator(".block-container").getByText("Column top")).toBeVisible();
  await expect(row.getByText("After the row")).toHaveCount(0);
});
