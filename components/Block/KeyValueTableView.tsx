import { ViewProps } from "@/types/blocks";
import { parseRows, visibleRows } from "@/lib/key-value-rows";

// Key column width on wide screens. Written out in full so Tailwind finds the classes.
export const KEY_COLUMNS = {
  "1/4": "sm:grid-cols-[1fr_3fr]",
  "1/3": "sm:grid-cols-[1fr_2fr]",
  "1/2": "sm:grid-cols-[1fr_1fr]",
} as const;

// A list of facts: bold keys beside their values, a line under each row.
// On narrow screens each key sits above its value.
const KeyValueTableView = ({ block, shared }: ViewProps<"KeyValueTable">) => {
  const { rows, keyWidth } = block.properties;
  const shown = visibleRows(parseRows(rows));
  if (shown.length === 0) return null;

  const columns = KEY_COLUMNS[keyWidth] ?? KEY_COLUMNS["1/3"];

  return (
    <dl {...shared} className={`not-prose my-6 ${shared.className ?? ""}`}>
      {shown.map((row, i) => (
        <div
          key={i}
          className={`grid grid-cols-1 gap-x-6 gap-y-1 border-b border-site-border px-3 py-3 ${columns}`}
        >
          <dt className="font-semibold">{row.key}</dt>
          <dd className="m-0">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
};

export default KeyValueTableView;
