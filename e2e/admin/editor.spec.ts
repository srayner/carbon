import { test, expect, Locator, Page } from "@playwright/test";
import { parseRows } from "../../lib/key-value-rows";
import { KeyValueTableBlockConfig } from "../../config/blocks/keyValueTable";

const openShowcase = async (page: Page) => {
  const response = await page.request.get("/api/pages?search=Block%20Showcase");
  const { content } = await response.json();
  const showcase = content.find(
    (p: { slug: string }) => p.slug === "block-showcase"
  );
  await page.goto(`/admin/pages/${showcase.id}`);
};

test.describe.configure({ mode: "serial" });

test.describe("the page editor", () => {
  test("shows every block type on the canvas", async ({ page }) => {
    await openShowcase(page);

    // Heading, Paragraph and RichText are editable text
    await expect(
      page.locator(".ProseMirror", { hasText: "Showcase heading" })
    ).toBeVisible();
    await expect(
      page.locator(".ProseMirror", { hasText: "Showcase paragraph" })
    ).toBeVisible();
    // Image, File, Card and Query are previews
    await expect(page.locator("figcaption")).toHaveText("Showcase caption");
    await expect(page.getByText("Showcase download")).toBeVisible();
    await expect(page.getByText("Showcase card one")).toBeVisible();
    await expect(page.getByText("Showcase card two")).toBeVisible();
    await expect(page.getByText(/^Pages in/).first()).toBeVisible();
  });

  test("the block outline is open, and the main navigation stays as it was", async ({
    page,
  }) => {
    const nav = page.locator('[data-sidebar="sidebar"]').first();
    const sidebar = page.locator('[data-collapsible]').first();
    const toggleNav = page.getByRole("button", { name: "Toggle navigation" });

    // Opened by the user before editing...
    await page.goto("/admin");
    if ((await sidebar.getAttribute("data-state")) !== "expanded") await toggleNav.click();
    await expect(sidebar).toHaveAttribute("data-state", "expanded");

    // ...it stays open in the editor
    await openShowcase(page);
    await expect(
      page.getByRole("button", { name: "Toggle block outline" })
    ).toHaveAttribute("aria-pressed", "true");
    await expect(sidebar).toHaveAttribute("data-state", "expanded");
    await expect(nav).toBeVisible();

    // Folded in the editor, it stays folded after leaving it
    await toggleNav.click();
    await expect(sidebar).toHaveAttribute("data-state", "collapsed");
    await page.goto("/admin");
    await expect(sidebar).toHaveAttribute("data-state", "collapsed");
  });

  test("selecting a block shows its properties", async ({ page }) => {
    await openShowcase(page);
    await page.getByText("Showcase card one").click();
    await expect(page.getByText("Card Properties")).toBeVisible();
    await expect(page.locator("label", { hasText: /^Title$/ })).toBeVisible();
  });

  test("the block panel groups the properties", async ({ page }) => {
    await openShowcase(page);
    await page.getByText("Showcase card one").click();
    for (const group of ["Content", "Spacing", "Box", "Colour and font", "Advanced"]) {
      await expect(
        page.locator("summary", { hasText: new RegExp(`^${group}$`) })
      ).toBeVisible();
    }
    // Only the content group starts open
    await expect(page.locator("label", { hasText: /^Title$/ })).toBeVisible();
    await expect(page.getByText("Corner radius")).toBeHidden();
    await page.locator("summary", { hasText: /^Box$/ }).click();
    await expect(page.getByText("Corner radius")).toBeVisible();
  });

  test("a token chosen in the panel is saved and published", async ({ page }) => {
    const setShadow = async (value: string) => {
      await openShowcase(page);
      await page.getByText("Showcase card one").click();
      await page.locator("summary", { hasText: /^Box$/ }).click();
      await page
        .locator("label", { hasText: "Shadow" })
        .locator("..")
        .locator("select")
        .selectOption(value);
      const saved = page.waitForResponse(
        (r) => r.url().includes("/api/pages/") && r.request().method() === "PUT"
      );
      await page.getByRole("button", { name: "Save" }).click();
      expect((await saved).ok()).toBe(true);
    };
    const cardShadow = async () => {
      await page.goto("/block-showcase");
      return page.locator("#showcase-card-one");
    };

    await setShadow("m");
    await expect(await cardShadow()).toHaveCSS("box-shadow", /rgba\(0, 0, 0, 0\.12\)/);

    // Back to the theme default so the run can be repeated
    await setShadow("");
    await expect(await cardShadow()).toHaveCSS("box-shadow", "none");
  });

  test("an edit to a heading is saved, published and loaded back as typed", async ({ page }) => {
    await openShowcase(page);

    const edit = async (text: string) => {
      const heading = page.locator(".ProseMirror").first();
      await heading.click();
      await page.keyboard.press("Control+A");
      await page.keyboard.type(text);
      // Saved straight away, with the cursor still in the heading
      const saved = page.waitForResponse(
        (r) => r.url().includes("/api/pages/") && r.request().method() === "PUT"
      );
      await page.getByRole("button", { name: "Save" }).click();
      expect((await saved).ok()).toBe(true);
    };

    // Text that looks like an entity or a tag is still just text
    const edited = "Tom & Jerry <b>live</b> &amp; more";
    await edit(edited);
    await page.goto("/block-showcase");
    await expect(page.locator("h2#showcase-heading")).toHaveText(edited);
    // And it loads back into the editor as typed
    await openShowcase(page);
    await expect(page.locator(".ProseMirror").first()).toHaveText(edited);

    // Put it back so the run can be repeated
    await edit("Showcase heading");
    await page.goto("/block-showcase");
    await expect(page.locator("h2#showcase-heading")).toHaveText("Showcase heading");
  });
});

// The key/value table's rows are edited on the canvas, not in the panel
test.describe("the key/value table editor", () => {
  const save = async (page: Page) => {
    const saved = page.waitForResponse(
      (r) => r.url().includes("/api/pages/") && r.request().method() === "PUT"
    );
    await page.getByRole("button", { name: "Save" }).click();
    expect((await saved).ok()).toBe(true);
  };
  // The table added by this test is the last one on the page
  const table = (page: Page) =>
    page.getByRole("group", { name: "Key/value rows" }).last();
  const keys = (page: Page) => table(page).getByRole("textbox", { name: /^Key, row/ });
  const values = (page: Page) =>
    table(page).getByRole("textbox", { name: /^Value, row/ });
  const seededSpecs = (page: Page) => page.locator("dl#showcase-specs dt");
  // Every text box's value, in order, retried until it matches
  const expectValues = async (boxes: Locator, expected: string[]) =>
    expect
      .poll(() => boxes.evaluateAll((els) => els.map((e) => (e as HTMLInputElement).value)))
      .toEqual(expected);

  test("rows added, edited, moved and deleted are saved and published", async ({
    page,
  }) => {
    // What must not change: the seeded table on the same page
    await page.goto("/block-showcase");
    const seededBefore = await seededSpecs(page).allTextContents();
    expect(seededBefore.length).toBeGreaterThan(1);

    // A new table starts with the config's default rows
    await openShowcase(page);
    await page.getByRole("button", { name: "+ Add Block" }).click();
    await page
      .locator("select", { has: page.locator('option[value="KeyValueTable"]') })
      .selectOption("KeyValueTable");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    const defaults = parseRows(
      KeyValueTableBlockConfig.properties.find((p) => p.name === "rows")!.default
    );
    await expectValues(keys(page), defaults.map((r) => r.key));
    await expectValues(values(page), defaults.map((r) => r.value));

    // The panel has the table's settings but not its rows
    await keys(page).first().click();
    await expect(page.getByText("KeyValueTable Properties")).toBeVisible();
    await page.locator("summary", { hasText: /^Appearance$/ }).click();
    await expect(page.getByText("Key Column Width")).toBeVisible();
    await expect(page.locator("label", { hasText: /^Rows$/ })).toHaveCount(0);

    // Edit the defaults, add two rows (one left blank), move one, delete one
    await keys(page).nth(0).fill("Battery");
    await values(page).nth(0).fill("2× 18650");
    await keys(page).nth(1).fill("Charging");
    await values(page).nth(1).fill("USB-C");
    await table(page).getByRole("button", { name: "Add row" }).click();
    await keys(page).nth(2).fill("Weight");
    await values(page).nth(2).fill("450 g");
    await table(page).getByRole("button", { name: "Move row 3 up" }).click();
    await table(page).getByRole("button", { name: "Delete row 1" }).click();
    await table(page).getByRole("button", { name: "Add row" }).click();
    await expectValues(keys(page), ["Weight", "Charging", ""]);
    await expectValues(values(page), ["450 g", "USB-C", ""]);
    await expect(table(page).getByRole("button", { name: "Move row 1 up" })).toBeDisabled();
    await expect(table(page).getByRole("button", { name: "Move row 3 down" })).toBeDisabled();
    await save(page);

    // Saved: the editor shows the same rows after a reload, blank row included
    await openShowcase(page);
    await expectValues(keys(page), ["Weight", "Charging", ""]);
    await expectValues(values(page), ["450 g", "USB-C", ""]);

    // Published: the new rows in order, without the blank one
    await page.goto("/block-showcase");
    const added = page.locator("dl", { hasText: "Weight" });
    await expect(added.locator("dt")).toHaveText(["Weight", "Charging"]);
    await expect(added.locator("dd")).toHaveText(["450 g", "USB-C"]);
    await expect(seededSpecs(page)).toHaveText(seededBefore);

    // Remove the table again so the run can be repeated
    await openShowcase(page);
    await page.getByRole("button", { name: "Delete KeyValueTable" }).last().click();
    await save(page);
    await page.goto("/block-showcase");
    await expect(page.locator("dl", { hasText: "Weight" })).toHaveCount(0);
    await expect(seededSpecs(page)).toHaveText(seededBefore);
  });
});
