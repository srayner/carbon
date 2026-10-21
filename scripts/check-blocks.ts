// Fails if a block in config/blocks has no edit renderer or published renderer.
// The renderers are found by name at run time, so this is the check that
// stands in for the compiler: components/Block/<Name>Editable.tsx and
// components/Block/<Name>View.tsx must exist for every block.
import { existsSync } from "fs";
import { join } from "path";
import { ALL_BLOCKS } from "../config/blocks";

const dir = join(__dirname, "..", "components", "Block");
const missing: string[] = [];

for (const { name } of ALL_BLOCKS) {
  for (const file of [`${name}Editable.tsx`, `${name}View.tsx`]) {
    if (!existsSync(join(dir, file))) missing.push(`${name}: components/Block/${file}`);
  }
}

if (missing.length > 0) {
  console.error("Blocks with a missing renderer:\n  " + missing.join("\n  "));
  process.exit(1);
}
console.log(`All ${ALL_BLOCKS.length} blocks have an edit and a published renderer.`);
