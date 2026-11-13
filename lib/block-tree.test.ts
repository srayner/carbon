import { describe, expect, it, vi } from "vitest";
import { ALL_BLOCKS } from "@/config/blocks";
import {
  BlockNode,
  BlockPlace,
  MAX_DEPTH,
  TreeBlock,
  buildTree,
  canMoveTo,
  depthOf,
  insertBlock,
  moveBlock,
  moveBlockTo,
  removeBlock,
  subtreeIds,
  validateBlockTree,
} from "@/lib/block-tree";

// The real container type, since moves check the block configs; everything
// else is a plain block
const BOX = "Container";
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
  it("nothing when the parent's config is a container", () => {
    const containers = ALL_BLOCKS.filter((c) => "container" in c && c.container);
    expect(containers.map((c) => c.name)).toContain("Container");
    for (const { name } of containers) {
      expect(validateBlockTree([block("p", null, name), block("a", "p")])).toBeNull();
    }
  });

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

/*
 * Editing the flat list. The fixture is in tree order, as the editor keeps it:
 *
 *   intro
 *   row
 *     left
 *     col
 *       top
 *       bottom
 *     right
 *   empty      (a container with nothing in it)
 *   outro
 */
const page = (): TreeBlock[] => [
  block("intro"),
  box("row"),
  block("left", "row"),
  box("col", "row"),
  block("top", "col"),
  block("bottom", "col"),
  block("right", "row"),
  box("empty"),
  block("outro"),
];
const ids = (blocks: TreeBlock[]) => blocks.map((b) => b.id);

/** The list must still be a valid tree, in tree order. */
const expectTreeOrder = (blocks: TreeBlock[]) => {
  expect(validateBlockTree(blocks, isBox)).toBeNull();
  expect(outline(buildTree(blocks)).map((line) => line.trim())).toEqual(ids(blocks));
};

describe("the fixture", () => {
  it("is itself a valid tree in tree order", () => expectTreeOrder(page()));
});

describe("subtreeIds", () => {
  it.each([
    ["row", ["row", "left", "col", "top", "bottom", "right"]],
    ["col", ["col", "top", "bottom"]],
    ["left", ["left"]],
    ["empty", ["empty"]],
  ])("of %s is it and everything inside it", (id, expected) => {
    expect([...subtreeIds(page(), id)].sort()).toEqual([...expected].sort());
  });

  it("stops on a loop", () => {
    expect([...subtreeIds([box("x", "y"), box("y", "x")], "x")].sort()).toEqual(["x", "y"]);
  });
});

describe("depthOf", () => {
  it.each([
    ["intro", 0],
    ["row", 0],
    ["left", 1],
    ["col", 1],
    ["top", 2],
  ])("%s is %i deep", (id, depth) => {
    expect(depthOf(page(), id)).toBe(depth);
  });

  it("stops on a loop", () => {
    expect(depthOf([box("x", "y"), box("y", "x")], "x")).toBe(1);
  });
});

describe("insertBlock", () => {
  it.each([
    ["the top level", null, "outro"],
    ["a row, after everything inside it", "row", "right"],
    ["a column inside a row", "col", "bottom"],
    ["an empty container", "empty", "empty"],
  ])("adds to the end of %s", (_, parentId, after) => {
    const result = insertBlock(page(), block("new"), parentId);
    expect(result.find((b) => b.id === "new")!.parentId).toBe(parentId);
    expect(ids(result)[ids(result).indexOf(after) + 1]).toBe("new");
    expect(ids(result).filter((id) => id !== "new")).toEqual(ids(page()));
    expectTreeOrder(result);
  });

  it("refuses a container that is not in the list", () => {
    expect(() => insertBlock(page(), block("new"), "gone")).toThrow("not in the list");
  });

  it("leaves the list it was given alone", () => {
    const before = page();
    insertBlock(before, block("new"), "row");
    expect(before).toEqual(page());
  });
});

describe("removeBlock", () => {
  it("removes a plain block and nothing else", () => {
    expect(ids(removeBlock(page(), "top"))).toEqual(ids(page()).filter((id) => id !== "top"));
  });

  it("removes a container with everything inside it", () => {
    const result = removeBlock(page(), "row");
    expect(ids(result)).toEqual(["intro", "empty", "outro"]);
    expectTreeOrder(result);
  });
});

describe("moveBlock", () => {
  it.each([
    ["a container up, taking its children", "col", -1,
      ["intro", "row", "col", "top", "bottom", "left", "right", "empty", "outro"]],
    ["a block down past a container and its children", "left", 1,
      ["intro", "row", "col", "top", "bottom", "left", "right", "empty", "outro"]],
    ["a block up past a container and its children", "right", -1,
      ["intro", "row", "left", "right", "col", "top", "bottom", "empty", "outro"]],
    ["a whole row down", "row", 1,
      ["intro", "empty", "row", "left", "col", "top", "bottom", "right", "outro"]],
    ["a block inside a nested column", "bottom", -1,
      ["intro", "row", "left", "col", "bottom", "top", "right", "empty", "outro"]],
  ])("moves %s", (_, id, direction, expected) => {
    expect(ids(moveBlock(page(), id, direction as -1 | 1))).toEqual(expected);
  });

  // A block stays with its siblings: it never leaves or enters a container
  it.each([
    ["the first top-level block up", "intro", -1],
    ["the last top-level block down", "outro", 1],
    ["the first child up, out of its container", "left", -1],
    ["the last child down, out of its container", "right", 1],
    ["a block that is not in the list", "gone", 1],
  ])("does nothing to %s", (_, id, direction) => {
    expect(moveBlock(page(), id, direction as -1 | 1)).toEqual(page());
  });

  it("keeps every block, the tree and its order, for every move", () => {
    for (const { id } of page()) {
      for (const direction of [-1, 1] as const) {
        const result = moveBlock(page(), id, direction);
        expect(ids(result).sort()).toEqual(ids(page()).sort());
        expect(result.map((b) => [b.id, b.parentId])).toEqual(
          expect.arrayContaining(page().map((b) => [b.id, b.parentId]))
        );
        expectTreeOrder(result);
      }
    }
  });
});

describe("moveBlockTo", () => {
  const to = (parentId: string | null, beforeId: string | null = null): BlockPlace => ({
    parentId,
    beforeId,
  });

  // Among siblings, into a container and out of one
  it.each([
    ["a top-level block before another", "outro", to(null, "intro"),
      ["outro", "intro", "row", "left", "col", "top", "bottom", "right", "empty"]],
    ["a block into an empty container", "intro", to("empty"),
      ["row", "left", "col", "top", "bottom", "right", "empty", "intro", "outro"]],
    ["a block into a container, before a child", "outro", to("row", "col"),
      ["intro", "row", "left", "outro", "col", "top", "bottom", "right", "empty"]],
    ["a block into a nested container, at the end", "intro", to("col"),
      ["row", "left", "col", "top", "bottom", "intro", "right", "empty", "outro"]],
    ["a container out to the top level, taking its children", "col", to(null, "intro"),
      ["col", "top", "bottom", "intro", "row", "left", "right", "empty", "outro"]],
    ["a child out to the end of the page", "top", to(null),
      ["intro", "row", "left", "col", "bottom", "right", "empty", "outro", "top"]],
    ["a child out to its container's parent", "top", to("row", "right"),
      ["intro", "row", "left", "col", "bottom", "top", "right", "empty", "outro"]],
    ["a container with children into another container", "row", to("empty"),
      ["intro", "empty", "row", "left", "col", "top", "bottom", "right", "outro"]],
  ])("moves %s", (_, id, place, expected) => {
    const result = moveBlockTo(page(), id, place);
    expect(ids(result)).toEqual(expected);
    expect(result.find((b) => b.id === id)!.parentId).toBe(place.parentId);
    // Nothing else changes container
    for (const b of result.filter((b) => b.id !== id)) {
      expect(b.parentId).toBe(page().find((p) => p.id === b.id)!.parentId);
    }
    expectTreeOrder(result);
  });

  it("keeps the block's other fields", () => {
    const blocks = [...page(), { ...block("styled"), properties: { color: "red" } }];
    const moved = moveBlockTo(blocks, "styled", to("col", "top"));
    expect(moved.find((b) => b.id === "styled")).toEqual({
      id: "styled",
      type: "Text",
      parentId: "col",
      properties: { color: "red" },
    });
  });

  it("leaves the list it was given alone", () => {
    const before = page();
    moveBlockTo(before, "col", to(null));
    expect(before).toEqual(page());
  });

  it("returns the same list when the block is already there", () => {
    const blocks = page();
    expect(moveBlockTo(blocks, "intro", to(null, "row"))).toBe(blocks);
    expect(moveBlockTo(blocks, "right", to("row"))).toBe(blocks);
    expect(moveBlockTo(blocks, "col", to("row", "col"))).toBe(blocks);
  });

  // Refused: nothing changes
  it.each([
    ["a container into itself", "row", to("row")],
    ["a container into its own child", "row", to("col")],
    ["a container before its own child", "row", to("row", "left")],
    ["a block into a block that is not a container", "intro", to("left")],
    ["a block before a block in another container", "intro", to(null, "left")],
    ["a block that is not in the list", "gone", to(null)],
    ["a block into a container that is not in the list", "intro", to("gone")],
    ["a block before a block that is not in the list", "intro", to(null, "gone")],
  ])("refuses %s", (_, id, place) => {
    const blocks = page();
    expect(canMoveTo(blocks, id, place)).toBe(false);
    expect(moveBlockTo(blocks, id, place)).toBe(blocks);
  });

  // The nesting limit counts the dragged block's own contents
  describe(`the ${MAX_DEPTH}-deep limit`, () => {
    // Containers box0..box{MAX_DEPTH-1}, and a container "x" holding "y"
    const deep = () => [...nested(MAX_DEPTH), box("x"), block("y", "x")];
    const deepest = `box${MAX_DEPTH - 1}`;
    const oneUp = `box${MAX_DEPTH - 2}`;

    it.each([
      ["a plain block into the deepest container", "y", deepest],
      ["a container with a child one level above it", "x", oneUp],
    ])("allows %s", (_, id, parentId) => {
      const result = moveBlockTo(deep(), id, to(parentId));
      expect(result.find((b) => b.id === id)!.parentId).toBe(parentId);
      expectTreeOrder(result);
    });

    it("refuses a container whose child would go past it", () => {
      expect(canMoveTo(deep(), "x", to(deepest))).toBe(false);
      // Empty, the same container fits
      const empty = deep().filter((b) => b.id !== "y");
      expect(canMoveTo(empty, "x", to(deepest))).toBe(true);
    });
  });

  it("gives a valid tree for every move it allows, and refuses the rest unchanged", () => {
    const blocks = page();
    const parents = [null, ...ids(blocks)];
    const befores = [null, ...ids(blocks)];
    let allowed = 0;
    for (const { id } of blocks) {
      for (const parentId of parents) {
        for (const beforeId of befores) {
          const place = to(parentId, beforeId);
          const result = moveBlockTo(blocks, id, place);
          if (canMoveTo(blocks, id, place)) {
            allowed++;
            expect(ids(result).sort()).toEqual(ids(blocks).sort());
            expectTreeOrder(result);
          } else {
            expect(result).toBe(blocks);
          }
        }
      }
    }
    // The fixture has room to move, so most checks above are not refusals
    expect(allowed).toBeGreaterThan(50);
  });
});
