import { describe, expect, it } from "vitest";
import { parseRows, serialiseRows } from "@/lib/key-value-rows";
import { KeyValueTableBlockConfig } from "@/config/blocks/keyValueTable";

// A broken saved value must never throw; it gives an empty table
describe("parseRows with a value that is not a list of rows", () => {
  it.each([
    ["undefined", undefined],
    ["null", null],
    ["an empty string", ""],
    ["bad JSON", '[{"key":"Motor"'],
    ["plain text", "Motor: 28BYJ-48"],
    ["an object", '{"key":"Motor","value":"28BYJ-48"}'],
    ["a string", '"Motor"'],
    ["a number", "42"],
    ["JSON null", "null"],
  ])("gives no rows for %s", (_, json) => {
    expect(parseRows(json)).toEqual([]);
  });
});

// Entries with the wrong shape are dropped; the good ones around them stay
describe("parseRows with some bad entries", () => {
  it("drops entries that are not rows and keeps the rest in order", () => {
    const json = JSON.stringify([
      { key: "Motor", value: "28BYJ-48" },
      "Controller",
      null,
      ["Drive", "Gear"],
      { key: 185, value: "mm" },
      { key: "Protection", value: { fuse: true } },
      { key: "Platter diameter", value: "185 mm" },
    ]);
    expect(parseRows(json)).toEqual([
      { key: "Motor", value: "28BYJ-48" },
      { key: "Platter diameter", value: "185 mm" },
    ]);
  });

  it("treats a missing key or value as empty", () => {
    const json = JSON.stringify([{ key: "Motor" }, { value: "185 mm" }, {}]);
    expect(parseRows(json)).toEqual([
      { key: "Motor", value: "" },
      { key: "", value: "185 mm" },
      { key: "", value: "" },
    ]);
  });

  it("drops extra fields", () => {
    const json = JSON.stringify([{ key: "Motor", value: "28BYJ-48", id: 7 }]);
    expect(parseRows(json)).toEqual([{ key: "Motor", value: "28BYJ-48" }]);
  });
});

// The editor saves rows and reads them back, so nothing may be lost or changed
describe("serialiseRows then parseRows", () => {
  it("gives back the same rows in the same order", () => {
    const rows = [
      { key: "Motor", value: "28BYJ-48 geared stepper" },
      { key: "", value: "" }, // a new row the user has not filled in yet
      { key: "Motor", value: "duplicate keys are allowed" },
      { key: "Design tools", value: 'Fusion 360, "EasyEDA" & Arduino' },
      { key: "  Spaces  ", value: "kept as typed\nwith a line break" },
      { key: "Ünïcödé", value: "185 mm ± 0.5 — ✓" },
    ];
    expect(parseRows(serialiseRows(rows))).toEqual(rows);
  });

  it("keeps an empty table empty", () => {
    expect(parseRows(serialiseRows([]))).toEqual([]);
  });

  it("does not save extra fields", () => {
    const row = { key: "Motor", value: "28BYJ-48", id: 7 };
    expect(serialiseRows([row])).toBe('[{"key":"Motor","value":"28BYJ-48"}]');
  });
});

// A new block must start with rows the editor and view can read
describe("the block's default rows", () => {
  it("parse to at least one filled-in row", () => {
    const rows = KeyValueTableBlockConfig.properties.find(
      (p) => p.name === "rows"
    )?.default;
    const parsed = parseRows(rows);
    expect(parsed.length).toBeGreaterThan(0);
    expect(parsed.every((r) => r.key && r.value)).toBe(true);
  });
});
