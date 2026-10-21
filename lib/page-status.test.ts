import { describe, expect, it } from "vitest";
import { getPageStatus, isPageLive } from "@/lib/page-status";

const now = new Date("2026-06-01T12:00:00Z");

describe("getPageStatus", () => {
  it("is a draft with no publish date", () => {
    expect(getPageStatus(null, now)).toBe("draft");
    expect(getPageStatus(undefined, now)).toBe("draft");
  });

  it("is scheduled while the date is in the future", () => {
    expect(getPageStatus("2026-06-02T00:00:00Z", now)).toBe("scheduled");
  });

  it("is live once the date has passed, including exactly now", () => {
    expect(getPageStatus("2026-05-31T00:00:00Z", now)).toBe("live");
    expect(getPageStatus(now, now)).toBe("live");
  });
});

describe("isPageLive", () => {
  it("is only true for live pages", () => {
    expect(isPageLive(null, now)).toBe(false);
    expect(isPageLive("2027-01-01T00:00:00Z", now)).toBe(false);
    expect(isPageLive("2026-01-01T00:00:00Z", now)).toBe(true);
  });
});
