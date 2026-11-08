import { describe, expect, it, vi } from "vitest";
import { ALL_BLOCKS } from "@/config/blocks";
import {
  BlockNode,
  MAX_DEPTH,
  TreeBlock,
  buildTree,
  validateBlockTree,
} from "@/lib/block-tree";

// "Box" stands in for a container type; everything else is a plain block
const BOX = "Box";
const isBox = (type: string) => type === BOX;

const block = (id: string, parentId: string | null = null, type = "Text"): TreeBlock => ({
  id,
  type,
  parentId,
});
const box = (id: string, parentId: string | null = null) => block(id, parentId, BOX);

/** Boxes nested `depth` deep, with a plain block in the innermost one. */
const nested = (depth: number): TreeBlock[] => {
  const blocks: TreeBlock[] = [];
  let parent: string | null = null;
  for (let i = 0; i < depth; i++) {
    blocks.push(box(`box${i}`, parent));
    parent = `box${i}`;
  }
  blocks.push(block("leaf", parent));
  return blocks;
};

/** The ids in the tree, indented by depth, so a whole tree is one assertion. */
const outline = (nodes: BlockNode<TreeBlock>[]): string[] =>
  nodes.flatMap((n) => ["  ".repeat(n.depth) + n.block.id, ...outline(n.children)]);

// What may be saved
describe("validateBlockTree accepts", () => {
  it.each([
    ["an empty list", []],
    ["flat blocks", [block("a"), block("b")]],
    ["blocks inside a container", [box("row"), block("a", "row"), block("b", "row")]],
    ["a child listed before its container", [block("a", "row"), box("row")]],
    [`nesting exactly ${MAX_DEPTH} deep`, nested(MAX_DEPTH)],
  ])("%s", (_, blocks) => {
    expect(validateBlockTree(blocks, isBox)).toBeNull();
  });
});

// What must be refused, and that the message says why
describe("validateBlockTree rejects", () => {
  it.each([
    ["a duplicate id", [block("a"), block("a")], /same id/],
    ["a parent that is not in the list", [block("a", "gone")], /not one of the blocks/],
    ["a parent that is not a container", [block("p"), block("a", "p")], /Text block cannot hold/],
    ["a block that is its own parent", [box("a", "a")], /loop/],
    ["two containers inside each other", [box("a", "b"), box("b", "a")], /loop/],
    [
      `a loop longer than ${MAX_DEPTH}, reported as a loop`,
      Array.from({ length: MAX_DEPTH + 2 }, (_, i) =>
        box(`b${i}`, `b${(i + 1) % (MAX_DEPTH + 2)}`)
      ),
      /loop/,
    ],
    [`nesting ${MAX_DEPTH + 1} deep`, nested(MAX_DEPTH + 1), /at most/],
  ])("%s", (_, blocks, message) => {
    expect(validateBlockTree(blocks, isBox)).toMatch(message);
  });

  // With the real block configs: only container blocks can be parents
  it("any child of a block whose config is not a container", () => {
    const plain = ALL_BLOCKS.filter((c) => !("container" in c && c.container));
    expect(plain.length).toBeGreaterThan(0);
    for (const { name } of plain) {
      expect(validateBlockTree([block("p", null, name), block("a", "p")])).toMatch(
        "cannot hold"
      );
    }
  });
});

// Building the tree the renderers walk
describe("buildTree", () => {
  it("nests children under their container, keeping the list's order", () => {
    const blocks = [
      block("intro"),
      box("row"),
      block("left", "row"),
      box("col", "row"),
      block("top", "col"),
      block("bottom", "col"),
      block("right", "row"),
      block("outro"),
    ];
    expect(outline(buildTree(blocks))).toEqual([
      "intro",
      "row",
      "  left",
      "  col",
      "    top",
      "    bottom",
      "  right",
      "outro",
    ]);
  });

  it("does not depend on a parent coming before its children", () => {
    const tree = buildTree([block("a", "row"), block("b", "row"), box("row")]);
    expect(outline(tree)).toEqual(["row", "  a", "  b"]);
  });

  it("returns the same block objects it was given", () => {
    const blocks = [box("row"), block("a", "row")];
    const [row] = buildTree(blocks);
    expect(row.block).toBe(blocks[0]);
    expect(row.children[0].block).toBe(blocks[1]);
  });

  // Bad rows already in the database must not break or hang the page
  describe("with bad data", () => {
    it.each([
      ["a block whose parent is missing", [block("a"), block("lost", "gone")], ["a"]],
      ["blocks in a loop", [block("a"), box("x", "y"), box("y", "x"), block("in", "x")], ["a"]],
      ["a block that is its own parent", [block("a"), box("self", "self")], ["a"]],
    ])("leaves out %s and warns", (_, blocks, expected) => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      expect(outline(buildTree(blocks))).toEqual(expected);
      expect(warn).toHaveBeenCalledOnce();
      warn.mockRestore();
    });

    it(`stops at depth ${MAX_DEPTH}`, () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const tree = buildTree(nested(MAX_DEPTH + 1));
      const lines = outline(tree);
      expect(lines.at(-1)).toBe("  ".repeat(MAX_DEPTH) + `box${MAX_DEPTH}`);
      expect(lines).not.toContain(expect.stringContaining("leaf"));
      expect(warn).toHaveBeenCalledOnce();
      warn.mockRestore();
    });

    it("does not warn when every block is placed", () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      buildTree(nested(MAX_DEPTH));
      expect(warn).not.toHaveBeenCalled();
      warn.mockRestore();
    });
  });
});
