import { Page } from "@playwright/test";

/*
 * Reading the editor's block outline. Each row says what it shows through
 * data attributes (data-block-id, data-block-type, data-depth) and marks the
 * selected block with aria-current, so tests read those rather than the
 * row's markup, which can change without the outline behaving differently.
 */

export const outline = (page: Page) =>
  page.locator("aside", { has: page.getByRole("heading", { name: "Blocks", exact: true }) });

/** One block's row in the outline. */
export const outlineRow = (page: Page, id: string) =>
  outline(page).locator(`[data-block-id="${id}"]`);

/** The selected row: there is at most one. */
export const selectedRow = (page: Page) => outline(page).locator('[aria-current="true"]');

/** The outline as "depth:type" (or "depth:id") lines, top to bottom. */
export const outlineRows = (page: Page, label: "type" | "id" = "type") =>
  outline(page)
    .locator("[data-depth]")
    .evaluateAll(
      (rows, key) =>
        rows.map((r) => {
          const data = (r as HTMLElement).dataset;
          return `${data.depth}:${key === "id" ? data.blockId : data.blockType}`;
        }),
      label
    );
