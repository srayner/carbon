"use client";

import React, { useRef } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { EditableProps } from "@/types/blocks";
import {
  KeyValueRow,
  moveItem,
  parseRows,
  serialiseRows,
} from "@/lib/key-value-rows";
import { KEY_COLUMNS } from "@/components/Block/KeyValueTableView";

const INPUT =
  "w-full min-w-0 rounded-sm border border-transparent bg-transparent px-1 py-0.5 hover:border-site-border focus:border-site-border focus:outline-none";
const ICON_BUTTON =
  "rounded-sm p-1 text-site-muted hover:bg-site-border hover:text-site-text disabled:opacity-30 disabled:hover:bg-transparent";

// The rows are edited here, on the canvas: one key and one value input per
// row, laid out like the published table, with buttons to reorder and delete.
const KeyValueTableEditable = ({
  block,
  onChange,
}: EditableProps<"KeyValueTable">) => {
  const rows = parseRows(block.properties.rows);
  const columns = KEY_COLUMNS[block.properties.keyWidth] ?? KEY_COLUMNS["1/3"];

  // A stable React key per row, so moving a row moves its inputs with it.
  // Kept in step with every change below; rebuilt if the rows change elsewhere.
  const nextId = useRef(0);
  const newId = () => `row-${nextId.current++}`;
  const ids = useRef<string[]>([]);
  if (ids.current.length !== rows.length) ids.current = rows.map(newId);

  const save = (next: KeyValueRow[], nextIds: string[]) => {
    ids.current = nextIds;
    onChange({ rows: serialiseRows(next) });
  };

  const update = (index: number, patch: Partial<KeyValueRow>) =>
    save(
      rows.map((row, i) => (i === index ? { ...row, ...patch } : row)),
      ids.current
    );
  const remove = (index: number) =>
    save(
      rows.filter((_, i) => i !== index),
      ids.current.filter((_, i) => i !== index)
    );
  const move = (index: number, direction: -1 | 1) =>
    save(moveItem(rows, index, direction), moveItem(ids.current, index, direction));
  const add = () =>
    save([...rows, { key: "", value: "" }], [...ids.current, newId()]);

  return (
    <div role="group" aria-label="Key/value rows" className="not-prose my-6">
      {rows.length === 0 && (
        <p className="px-3 py-3 text-site-muted">No rows yet.</p>
      )}
      {rows.map((row, i) => {
        const n = i + 1;
        return (
          <div
            key={ids.current[i]}
            className="flex items-start gap-2 border-b border-site-border px-3 py-2"
          >
            <div className={`grid flex-1 grid-cols-1 gap-x-6 gap-y-1 ${columns}`}>
              <input
                type="text"
                value={row.key}
                placeholder="Key"
                aria-label={`Key, row ${n}`}
                onChange={(e) => update(i, { key: e.target.value })}
                className={`${INPUT} font-semibold`}
              />
              <input
                type="text"
                value={row.value}
                placeholder="Value"
                aria-label={`Value, row ${n}`}
                onChange={(e) => update(i, { value: e.target.value })}
                className={INPUT}
              />
            </div>
            <div className="flex shrink-0 gap-0.5">
              <button
                type="button"
                aria-label={`Move row ${n} up`}
                disabled={i === 0}
                onClick={() => move(i, -1)}
                className={ICON_BUTTON}
              >
                <ArrowUp size={16} />
              </button>
              <button
                type="button"
                aria-label={`Move row ${n} down`}
                disabled={i === rows.length - 1}
                onClick={() => move(i, 1)}
                className={ICON_BUTTON}
              >
                <ArrowDown size={16} />
              </button>
              <button
                type="button"
                aria-label={`Delete row ${n}`}
                onClick={() => remove(i)}
                className={ICON_BUTTON}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        );
      })}
      <button
        type="button"
        onClick={add}
        className="mt-2 inline-flex items-center gap-1 rounded-sm px-3 py-1 text-sm text-site-muted hover:bg-site-border hover:text-site-text"
      >
        <Plus size={16} /> Add row
      </button>
    </div>
  );
};

export default KeyValueTableEditable;
