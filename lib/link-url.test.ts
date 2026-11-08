import { describe, expect, it } from "vitest";
import { safeHref } from "@/lib/link-url";

describe("safeHref", () => {
  it.each([
    ["https://youtube.com/@steve", "a web address"],
    ["http://example.com", "plain http"],
    ["HTTPS://Example.com/Path", "a scheme in capitals"],
    ["mailto:steve@example.com", "an email address"],
    ["tel:+441234567890", "a phone number"],
    ["/projects", "a path on this site"],
    ["/projects?tag=Robotics#top", "a path with a query and anchor"],
    ["#subscribe", "an anchor"],
    ["?page=2", "a query"],
    ["projects/ralph", "a relative path"],
    ["//cdn.example.com/file.pdf", "a protocol-relative address"],
  ])("links %s (%s)", (url) => {
    expect(safeHref(url)).toBe(url);
  });

  it("trims spaces around the address", () => {
    expect(safeHref("  /about  ")).toBe("/about");
  });

  // Addresses that would run script or load something other than a page
  it.each([
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    " javascript:alert(1)",
    "java\tscript:alert(1)",
    "java\nscript:alert(1)",
    "\u0000javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
  ])("refuses %j", (url) => {
    expect(safeHref(url)).toBeNull();
  });

  it.each([
    { url: "", what: "empty" },
    { url: "   ", what: "blank" },
    { url: undefined, what: "missing" },
    { url: 42, what: "not text" },
  ])("has nothing to link when the address is $what", ({ url }) => {
    expect(safeHref(url)).toBeNull();
  });
});
