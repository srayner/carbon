import { describe, expect, it } from "vitest";
import { IMAGE_ACCEPT, IMAGE_TYPES } from "@/lib/upload-types";
import {
  ALLOWED_EXTENSIONS,
  getContentType,
  isImageExtension,
  makeStoredName,
} from "@/lib/uploads";

describe("SVG uploads", () => {
  it("are allowed, as images", () => {
    expect(ALLOWED_EXTENSIONS).toContain(".svg");
    expect(isImageExtension(".svg")).toBe(true);
  });

  it("are served as SVG, so <img> can show them", () => {
    expect(getContentType(".svg")).toBe("image/svg+xml");
  });

  it("keep their extension when stored", () => {
    expect(makeStoredName("Logo Icon.SVG")).toMatch(/^[a-f0-9]{12}-logo-icon\.svg$/);
  });
});

// The upload field in the browser offers the same image types the server takes
describe("IMAGE_ACCEPT", () => {
  it("lists every image type, and only those", () => {
    expect(IMAGE_ACCEPT.split(",").sort()).toEqual(Object.keys(IMAGE_TYPES).sort());
  });
});
