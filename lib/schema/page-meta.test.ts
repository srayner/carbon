import { describe, expect, it } from "vitest";
import { pageMetaSchema } from "@/lib/schema/page-meta";

const valid = {
  metaTitle: "About Carbon",
  metaDescription: "What Carbon is for",
  metaKeywords: "cms, blocks",
  canonicalPath: "/about",
  ogTitle: "About Carbon",
  ogDescription: "What Carbon is for",
  ogImage: "https://example.com/og.png",
  twitterTitle: "About Carbon",
  twitterDescription: "What Carbon is for",
  twitterImage: "https://example.com/tw.png",
  robots: "noindex, nofollow" as const,
};

const fieldsWithErrors = (input: unknown) => {
  const result = pageMetaSchema.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => String(i.path[0]));
};

describe("pageMetaSchema", () => {
  // Every field is optional, so an empty form saves
  it("accepts no fields at all", () => {
    expect(pageMetaSchema.safeParse({})).toEqual({ success: true, data: {} });
  });

  it("accepts every field filled in, unchanged", () => {
    expect(pageMetaSchema.safeParse(valid)).toEqual({ success: true, data: valid });
  });

  // Length limits: the limit itself is allowed, one more is not
  it.each([
    ["metaTitle", 160],
    ["metaDescription", 300],
    ["metaKeywords", 500],
    ["ogTitle", 160],
    ["ogDescription", 300],
    ["twitterTitle", 160],
    ["twitterDescription", 300],
  ])("limits %s to %i characters", (field, max) => {
    expect(fieldsWithErrors({ ...valid, [field]: "a".repeat(max) })).toEqual([]);
    expect(fieldsWithErrors({ ...valid, [field]: "a".repeat(max + 1) })).toEqual([field]);
  });

  it("has no length limit on canonicalPath", () => {
    expect(fieldsWithErrors({ ...valid, canonicalPath: "/" + "a".repeat(2000) })).toEqual([]);
  });

  // Images must be full URLs
  it.each(["ogImage", "twitterImage"])("rejects a %s that is not a URL", (field) => {
    for (const bad of ["og.png", "/images/og.png", ""]) {
      expect(fieldsWithErrors({ ...valid, [field]: bad }), bad).toEqual([field]);
    }
  });

  it.each(["index, follow", "noindex, nofollow"])("accepts robots %j", (robots) => {
    expect(fieldsWithErrors({ ...valid, robots })).toEqual([]);
  });

  it.each(["noindex", "Index, Follow", ""])("rejects robots %j", (robots) => {
    expect(fieldsWithErrors({ ...valid, robots })).toEqual(["robots"]);
  });
});
