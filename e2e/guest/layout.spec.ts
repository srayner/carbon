import { test, expect, Locator } from "@playwright/test";
import { COLORS, rgb } from "../helpers";
import { MAX_DEPTH } from "../../lib/block-tree";

const box = async (locator: Locator) => {
  const b = await locator.boundingBox();
  expect(b, "element should be laid out").not.toBeNull();
  return b!;
};

// Containers on the public site: the seeded "Layout Showcase" page has a row
// holding a paragraph, a column of two paragraphs and another paragraph
test.describe("a Container", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/layout-showcase");
  });

  test("shows its children inside it, nested as saved", async ({ page }) => {
    const row = page.locator("#layout-row");
    await expect(row.locator("> *")).toHaveCount(3);
    // Each child sits in its own flex item
    await expect(row.locator("> .block-item > #layout-column > .block-item > p")).toHaveText([
      "Column top",
      "Column bottom",
    ]);
    // The top-level block after the row is not inside it
    await expect(row.locator("#after-row")).toHaveCount(0);
    await expect(page.locator("#after-row")).toBeVisible();
  });

  test("a row puts its children side by side, in order", async ({ page }) => {
    const [first, column, last] = await Promise.all(
      ["#row-first", "#layout-column", "#row-last"].map((id) => box(page.locator(id)))
    );
    expect(column.x).toBeGreaterThan(first.x + first.width);
    expect(last.x).toBeGreaterThan(column.x + column.width);
    // Aligned to the start: the tops line up
    expect(Math.abs(column.y - first.y)).toBeLessThan(1);
    expect(Math.abs(last.y - first.y)).toBeLessThan(1);
  });

  test("a column stacks its children", async ({ page }) => {
    const [top, bottom] = await Promise.all([
      box(page.locator("#column-top")),
      box(page.locator("#column-bottom")),
    ]);
    expect(bottom.y).toBeGreaterThanOrEqual(top.y + top.height);
    expect(Math.abs(bottom.x - top.x)).toBeLessThan(1);
  });

  test("spaces its children by its gap, not their prose margins", async ({ page }) => {
    const gap = (id: string) =>
      page.locator(id).evaluate((el) => parseFloat(getComputedStyle(el).columnGap));
    const [rowGap, columnGap] = await Promise.all([gap("#layout-row"), gap("#layout-column")]);
    // l and s are different steps, so the theme's values must differ
    expect(rowGap).toBeGreaterThan(columnGap);
    expect(columnGap).toBeGreaterThan(0);

    const [first, column, top, bottom] = await Promise.all(
      ["#row-first", "#layout-column", "#column-top", "#column-bottom"].map((id) =>
        box(page.locator(id))
      )
    );
    expect(column.x - (first.x + first.width)).toBeCloseTo(rowGap, 0);
    expect(bottom.y - (top.y + top.height)).toBeCloseTo(columnGap, 0);
  });

  test("takes the theme tokens", async ({ page }) => {
    const row = page.locator("#layout-row");
    await expect(row).toHaveCSS("background-color", rgb(COLORS.surface));
    // Its background image goes on the same element, covering it
    await expect(row).toHaveCSS("background-image", /^url\(".*\/logo-icon\.svg"\)$/);
    await expect(row).toHaveCSS("background-size", "cover");
  });

  test("an empty container is still on the page", async ({ page }) => {
    const empty = page.locator("#layout-empty");
    await expect(empty).toBeAttached();
    await expect(empty.locator("> *")).toHaveCount(0);
  });
});

// Grow shares a row's width by ratio, ignoring the content's own size
test.describe("Grow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/layout-showcase");
  });

  const width = async (page: import("@playwright/test").Page, id: string) =>
    (await box(page.locator(id))).width;

  test("on 1 and 1 splits the row evenly, a short table beside long text", async ({ page }) => {
    const [table, text] = await Promise.all([width(page, "#grow-table"), width(page, "#grow-text")]);
    expect(Math.abs(table - text)).toBeLessThan(1);
    // and the two fill the row between them
    const row = await width(page, "#grow-row");
    expect(table + text).toBeGreaterThan(row * 0.9);
  });

  test("on 2 and 1 splits the row two to one", async ({ page }) => {
    const [two, one] = await Promise.all([width(page, "#ratio-two"), width(page, "#ratio-one")]);
    expect(two / one).toBeCloseTo(2, 1);
  });

  test("left on content, blocks keep their own size and leave the rest of the row", async ({
    page,
  }) => {
    const [first, column, last, row] = await Promise.all(
      ["#row-first", "#layout-column", "#row-last", "#layout-row"].map((id) => width(page, id))
    );
    expect(first + column + last).toBeLessThan(row * 0.6);
  });
});

// Rows that saving would refuse (see prisma/seed.ts) must not break the page
test.describe("a page with bad nested blocks", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/broken-layout");
  });

  test("still shows its good blocks", async ({ page }) => {
    await expect(page.locator("#broken-intro")).toHaveText("Broken layout intro");
    await expect(page.locator("#not-a-container")).toHaveText("Not a container");
  });

  for (const [what, text] of [
    ["a block whose container is missing", "Orphan text"],
    ["blocks in a loop", "Looped text"],
    ["a child of a block that is not a container", "Child of a paragraph"],
    ["a block nested too deep", "Too deep text"],
  ]) {
    test(`leaves out ${what}`, async ({ page }) => {
      await expect(page.locator("main")).not.toContainText(text);
    });
  }

  test("leaves out the containers in the loop", async ({ page }) => {
    await expect(page.locator("#loop-x, #loop-y")).toHaveCount(0);
  });

  test(`shows containers down to depth ${MAX_DEPTH}, nested`, async ({ page }) => {
    const chain = Array.from({ length: MAX_DEPTH + 1 }, (_, d) => `#deep-${d}`).join(
      " > .block-item > "
    );
    await expect(page.locator(chain)).toBeAttached();
    await expect(page.locator(`#deep-${MAX_DEPTH} > *`)).toHaveCount(0);
  });
});
