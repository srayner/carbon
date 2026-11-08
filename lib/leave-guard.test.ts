import { describe, expect, it } from "vitest";
import { LinkClick, clickLeavesPage } from "./leave-guard";

const HERE = "http://localhost:3003/admin/pages/abc?tab=seo#top";

// A plain left click on a link with no target, changed per case below
const click = (change: Partial<LinkClick>): LinkClick => ({
  button: 0,
  modified: false,
  href: "http://localhost:3003/admin/categories",
  target: "",
  download: false,
  ...change,
});

describe("which link clicks leave the page and so ask first", () => {
  it.each([
    ["another page in the app", {}, true],
    ["a relative link to another page", { href: "/admin/theme" }, true],
    ["the same page with a different query", { href: "/admin/pages/abc?tab=main" }, true],
    ["the same page with no query", { href: "/admin/pages/abc" }, true],
    ["a target of _self", { target: "_self" }, true],
  ])("%s: asks", (_, change, expected) => {
    expect(clickLeavesPage(click(change), HERE)).toBe(expected);
  });

  it.each([
    ["a spot on this page", { href: "#bottom" }],
    ["this page itself", { href: HERE }],
    ["a new tab", { target: "_blank" }],
    ["a named window", { target: "preview" }],
    ["Ctrl, Cmd, Shift or Alt held", { modified: true }],
    ["the middle button", { button: 1 }],
    ["a download", { download: true }],
    // Loads a new document, so the browser's own prompt covers it
    ["another site", { href: "https://example.com/admin/categories" }],
    ["the same host on another port", { href: "http://localhost:3001/admin" }],
  ])("%s: does not ask", (_, change) => {
    expect(clickLeavesPage(click(change), HERE)).toBe(false);
  });
});
