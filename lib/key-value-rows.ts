/*
 * The rows of a KeyValueTable block. They are saved as a JSON string in the
 * block's `rows` property, because block properties hold single values.
 */

export type KeyValueRow = { key: string; value: string };

const isRecord = (x: unknown): x is Record<string, unknown> =>
  typeof x === "object" && x !== null && !Array.isArray(x);

// A missing key or value is treated as empty; any other non-string is invalid
const asText = (x: unknown): string | null =>
  x === undefined ? "" : typeof x === "string" ? x : null;

/**
 * Read the rows from the saved string. Never throws: a broken value gives an
 * empty list, and entries with the wrong shape are dropped, so a bad save
 * cannot break the public page. Blank rows are kept (the editor needs them
 * while a row is being filled in); the view decides whether to show them.
 */
export const parseRows = (json: string | undefined | null): KeyValueRow[] => {
  if (!json) return [];

  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];

  const rows: KeyValueRow[] = [];
  for (const entry of data) {
    if (!isRecord(entry)) continue;
    const key = asText(entry.key);
    const value = asText(entry.value);
    if (key === null || value === null) continue;
    rows.push({ key, value });
  }
  return rows;
};

/** Write the rows as the string saved in the block. Extra fields are dropped. */
export const serialiseRows = (rows: readonly KeyValueRow[]): string =>
  JSON.stringify(rows.map(({ key, value }) => ({ key, value })));

const isBlank = (text: string) => text.trim() === "";

/** The rows worth showing on the public page: a row with neither a key nor a value is skipped. */
export const visibleRows = (rows: readonly KeyValueRow[]): KeyValueRow[] =>
  rows.filter((row) => !(isBlank(row.key) && isBlank(row.value)));
