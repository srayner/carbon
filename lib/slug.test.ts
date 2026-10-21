import { describe, expect, it } from "vitest";
import { getSlugError, slugify } from "@/lib/slug";

describe("slugify", () => {
  it("lowercases and joins words with single hyphens", () => {
    expect(slugify("  Hello,  World! ")).toBe("hello-world");
  });
});

describe("getSlugError", () => {
  it("accepts a normal slug", () => {
    expect(getSlugError("desk-lamp-2")).toBeNull();
  });

  it.each(["", "Upper", "double--hyphen", "-lead", "trail-", "a b"])(
    "rejects %j",
    (slug) => {
      expect(getSlugError(slug)).not.toBeNull();
    }
  );

  it.each(["admin", "api", "auth"])("rejects the reserved slug %s", (slug) => {
    expect(getSlugError(slug)).toContain("reserved");
  });
});
