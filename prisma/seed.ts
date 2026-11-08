import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "../lib/generated/prisma";
import { DEFAULT_TEMPLATE_ID, PRESET_TEMPLATES } from "../config/templates";
import { MAX_DEPTH } from "../lib/block-tree";

const prisma = new PrismaClient();

// The seed deletes all data, so only allow it against a local database.
function assertLocalDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }

  const { hostname } = new URL(url);
  if (!["localhost", "127.0.0.1", "::1"].includes(hostname)) {
    throw new Error(
      `Refusing to seed: database host is "${hostname}", not localhost.`
    );
  }
}

async function clearData() {
  // Models should be cleared in the correct order, dependencies first.
  const models: (keyof PrismaClient)[] = [
    "pageCategory",
    "templateSlot",
    "block",
    "pageMeta",
    "page",
    "fragment",
    "template",
    "siteTheme",
    "account",
    "user",
  ];

  for (const model of models) {
    await (prisma[model] as any).deleteMany({});
  }

  // Categories point at their parents (restricted), so detach them first
  await prisma.category.updateMany({ data: { parentId: null } });
  await prisma.category.deleteMany({});

  console.log("Data has been cleared!");
}

async function seedUsers() {
  const userPassword = process.env.USER_PASSWORD_USER;
  const adminPassword = process.env.USER_PASSWORD_ADMIN;
  if (!userPassword || !adminPassword) {
    throw new Error(
      "USER_PASSWORD_USER and USER_PASSWORD_ADMIN must be set in .env."
    );
  }

  const now = new Date();

  await prisma.user.createMany({
    data: [
      {
        name: "Example User",
        email: "user@example.com",
        emailVerified: now,
        password: await bcrypt.hash(userPassword, 10),
        role: "USER",
      },
      {
        name: "Admin User",
        email: "admin@example.com",
        emailVerified: now,
        password: await bcrypt.hash(adminPassword, 10),
        role: "ADMIN",
      },
    ],
  });

  console.log("Users have been created with hashed passwords!");
}

async function seedTemplates() {
  for (const { id, name, description, layout } of PRESET_TEMPLATES) {
    await prisma.template.create({
      data: { id, name, description, layout, isSystem: true },
    });
  }

  const header = await prisma.fragment.create({
    data: {
      name: "Main header",
      kind: "HEADER",
      blocks: {
        create: [
          {
            id: crypto.randomUUID(),
            type: "Heading",
            order: 0,
            properties: { level: "h3", content: "Carbon" },
          },
        ],
      },
    },
  });
  const footer = await prisma.fragment.create({
    data: {
      name: "Main footer",
      kind: "FOOTER",
      blocks: {
        create: [
          {
            id: crypto.randomUUID(),
            type: "Paragraph",
            order: 0,
            properties: { content: "Made with Carbon CMS." },
          },
        ],
      },
    },
  });
  const sidebar = await prisma.fragment.create({
    data: {
      name: "Main sidebar",
      kind: "GENERAL",
      blocks: {
        create: [
          {
            id: crypto.randomUUID(),
            type: "Heading",
            order: 0,
            properties: { level: "h4", content: "In this section" },
          },
          {
            id: crypto.randomUUID(),
            type: "Paragraph",
            order: 1,
            properties: { content: "Sidebar content shared by every page." },
          },
        ],
      },
    },
  });
  await prisma.templateSlot.createMany({
    data: [
      { templateId: "tpl_left_sidebar", slot: "header", fragmentId: header.id },
      { templateId: "tpl_left_sidebar", slot: "sidebar", fragmentId: sidebar.id },
      { templateId: "tpl_left_sidebar", slot: "footer", fragmentId: footer.id },
      { templateId: DEFAULT_TEMPLATE_ID, slot: "header", fragmentId: header.id },
      { templateId: DEFAULT_TEMPLATE_ID, slot: "footer", fragmentId: footer.id },
    ],
  });

  console.log("Templates have been seeded!");
}

// Fixed ids and slugs, so the tests can rely on them
export const SEED = {
  categories: {
    projects: "seed-cat-projects",
    electronics: "seed-cat-electronics",
    guides: "seed-cat-guides",
  },
} as const;

async function seedCategories() {
  await prisma.category.create({
    data: { id: SEED.categories.projects, name: "Projects", order: 0 },
  });
  await prisma.category.create({
    data: {
      id: SEED.categories.electronics,
      name: "Electronics",
      parentId: SEED.categories.projects,
      order: 0,
    },
  });
  await prisma.category.create({
    data: { id: SEED.categories.guides, name: "Guides", order: 1 },
  });

  console.log("Categories have been seeded!");
}

const block = (
  order: number,
  type: string,
  properties: Prisma.InputJsonObject
) => ({ id: crypto.randomUUID(), type, order, properties });

const YESTERDAY = new Date(Date.now() - 24 * 60 * 60 * 1000);
const NEXT_YEAR = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

async function seedPages() {
  await prisma.page.create({
    data: {
      title: "Hello World",
      templateId: DEFAULT_TEMPLATE_ID,
      slug: "hello-world",
      publishedAt: YESTERDAY,
      blocks: {
        create: [
          block(0, "Heading", { level: "h2", content: "Getting started" }),
          block(1, "Paragraph", {
            content: "This page was created by the seed script.",
          }),
          block(2, "RichText", {
            content:
              "<p>Some <strong>rich</strong> text with a table:</p>" +
              "<table><thead><tr><th>Part</th><th>Qty</th></tr></thead>" +
              "<tbody><tr><td>Resistor</td><td>10</td></tr>" +
              "<tr><td>Capacitor</td><td>4</td></tr></tbody></table>",
          }),
        ],
      },
    },
  });

  // Pages that the query blocks list, in a category and its sub-category
  const projects: [string, string, string, string][] = [
    ["Desk Lamp", "desk-lamp", SEED.categories.projects, "A lamp for the bench."],
    ["Robot Arm", "robot-arm", SEED.categories.electronics, "A six axis arm."],
  ];
  for (const [title, slug, categoryId, summary] of projects) {
    await prisma.page.create({
      data: {
        title,
        slug,
        summary,
        image: "/favicon.ico",
        templateId: DEFAULT_TEMPLATE_ID,
        publishedAt: YESTERDAY,
        categories: { create: [{ categoryId }] },
        blocks: {
          create: [block(0, "Paragraph", { content: `About the ${title}.` })],
        },
      },
    });
  }

  // Not visible to guests: a draft, and a page scheduled for the future
  await prisma.page.create({
    data: {
      title: "Secret Draft",
      slug: "secret-draft",
      templateId: DEFAULT_TEMPLATE_ID,
      publishedAt: null,
      blocks: { create: [block(0, "Paragraph", { content: "A draft." })] },
    },
  });
  await prisma.page.create({
    data: {
      title: "Coming Soon",
      slug: "coming-soon",
      templateId: DEFAULT_TEMPLATE_ID,
      publishedAt: NEXT_YEAR,
      blocks: { create: [block(0, "Paragraph", { content: "Scheduled." })] },
    },
  });

  // Enough extra pages, in every state, for the admin page list to paginate
  const filler: [string, Date | null][] = [
    ["Soldering Basics", YESTERDAY],
    ["Choosing a Microcontroller", YESTERDAY],
    ["Bench Power Supply", YESTERDAY],
    ["Oscilloscope Tips", YESTERDAY],
    ["Printed Circuit Boards", YESTERDAY],
    ["Stepper Motors", YESTERDAY],
    ["Sensor Roundup", YESTERDAY],
    ["Workshop Safety", YESTERDAY],
    ["Parts Storage Ideas", null],
    ["Firmware Notes", null],
    ["Enclosure Design", null],
    ["Spring Newsletter", NEXT_YEAR],
    ["Open Day Announcement", NEXT_YEAR],
    ["Product Launch", NEXT_YEAR],
  ];
  for (const [title, publishedAt] of filler) {
    await prisma.page.create({
      data: {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        templateId: DEFAULT_TEMPLATE_ID,
        publishedAt,
        blocks: { create: [block(0, "Paragraph", { content: `${title}.` })] },
      },
    });
  }

  // One of every block type, with consecutive Cards and both query displays
  await prisma.page.create({
    data: {
      title: "Block Showcase",
      slug: "block-showcase",
      templateId: DEFAULT_TEMPLATE_ID,
      publishedAt: YESTERDAY,
      blocks: {
        create: [
          block(0, "Heading", {
            level: "h2",
            content: "Showcase heading",
            cssId: "showcase-heading",
          }),
          block(1, "Paragraph", { content: "Showcase paragraph" }),
          block(2, "RichText", { content: "<p>Showcase <em>rich</em> text</p>" }),
          block(3, "Image", {
            src: "/favicon.ico",
            alt: "Showcase image",
            caption: "Showcase caption",
          }),
          block(4, "File", {
            file: "/files/example.pdf",
            label: "Showcase download",
            description: "A file",
          }),
          block(5, "Card", { title: "Showcase card one", description: "One" }),
          block(6, "Card", { title: "Showcase card two", description: "Two" }),
          block(7, "Query", {
            category: SEED.categories.projects,
            includeSubcategories: "true",
            orderBy: "title",
            limit: "12",
            display: "cards",
            columns: "2",
          }),
          block(8, "Query", {
            category: SEED.categories.projects,
            includeSubcategories: "true",
            orderBy: "title",
            limit: "12",
            display: "list",
            cssId: "showcase-list",
            paddingSize: "m",
            background: "surface",
          }),
          // Theme tokens, and a raw value that overrides one of them
          block(9, "Paragraph", {
            content: "Styled with tokens",
            cssId: "styled-paragraph",
            paddingSize: "l",
            radius: "m",
            border: "thin",
            shadow: "m",
            background: "surface",
            textColor: "accent",
          }),
          // A download with a background token: only the link is filled
          block(11, "File", {
            file: "/files/example.pdf",
            label: "Tinted download",
            background: "border",
            radius: "l",
          }),
          block(10, "Paragraph", {
            content: "Raw padding wins",
            cssId: "override-paragraph",
            paddingSize: "l",
            padding: "5px",
          }),
          // Specifications: a blank row (not shown), a repeated key, a key
          // with no value, text that looks like HTML, and a long value
          block(12, "KeyValueTable", {
            cssId: "showcase-specs",
            background: "surface",
            rows: JSON.stringify([
              { key: "Platter diameter", value: "185 mm" },
              { key: "Motor", value: "28BYJ-48 geared stepper" },
              { key: "", value: "" },
              { key: "Controller", value: "ESP32-C3 Super Mini" },
              { key: "Motor", value: "Spare: NEMA 17" },
              {
                key: "Design tools",
                value: 'Fusion 360 <mechanical> & EasyEDA "PCB", Arduino for the firmware',
              },
              { key: "Wi-Fi", value: "" },
            ]),
          }),
          // Nothing to show: only blank rows, and a value that is not JSON
          block(13, "KeyValueTable", {
            cssId: "showcase-specs-blank",
            rows: JSON.stringify([
              { key: "", value: "" },
              { key: "  ", value: " " },
            ]),
          }),
          block(14, "KeyValueTable", {
            cssId: "showcase-specs-broken",
            rows: "Motor: 28BYJ-48",
          }),
          // Button-like: padding wider than tall over a Padding that the two
          // directions override, a coloured border and small text
          block(15, "Paragraph", {
            content: "Button tokens",
            cssId: "button-tokens",
            paddingSize: "m",
            paddingX: "l",
            paddingY: "xs",
            border: "thin",
            borderColor: "accent",
            textSize: "xs",
          }),
        ],
      },
    },
  });

  await seedLayoutPages();

  console.log("Pages have been seeded!");
}

/*
 * Containers. Nested blocks keep the page as their owner and name their
 * container in parentId; `order` follows the list (each container followed by
 * its children), as the editor saves it. Created last, so they come last in
 * the admin's pages list and leave its first page alone.
 */
async function seedLayoutPages() {
  type Row = ReturnType<typeof block> & { parentId?: string };
  let order = 0;
  const add = (
    rows: Row[],
    type: string,
    properties: Prisma.InputJsonObject,
    parentId?: string
  ) => {
    const row = { ...block(order++, type, properties), parentId };
    rows.push(row);
    return row.id;
  };

  // A row holding a paragraph, a column of two paragraphs, and a paragraph,
  // then a top-level paragraph after it and an empty container
  const valid: Row[] = [];
  const row = add(valid, "Container", {
    direction: "row",
    gap: "l",
    align: "start",
    cssId: "layout-row",
    background: "surface",
  });
  add(valid, "Paragraph", { content: "Row first", cssId: "row-first" }, row);
  const column = add(
    valid,
    "Container",
    { direction: "column", gap: "s", cssId: "layout-column" },
    row
  );
  add(valid, "Paragraph", { content: "Column top", cssId: "column-top" }, column);
  add(valid, "Paragraph", { content: "Column bottom", cssId: "column-bottom" }, column);
  add(valid, "Paragraph", { content: "Row last", cssId: "row-last" }, row);
  add(valid, "Paragraph", { content: "After the row", cssId: "after-row" });
  add(valid, "Container", { cssId: "layout-empty" });

  // Grow: a short table beside a long paragraph, both on 1, must split the
  // row evenly; then a 2 : 1 split
  const growRow = add(valid, "Container", { direction: "row", cssId: "grow-row" });
  add(
    valid,
    "KeyValueTable",
    { cssId: "grow-table", grow: "1", rows: JSON.stringify([{ key: "Size", value: "S" }]) },
    growRow
  );
  add(
    valid,
    "Paragraph",
    {
      cssId: "grow-text",
      grow: "1",
      content:
        "A much longer paragraph than the table beside it, so that sized by " +
        "content it would take most of the row, and only Grow makes the two even.",
    },
    growRow
  );
  const ratioRow = add(valid, "Container", { direction: "row", cssId: "ratio-row" });
  add(valid, "Paragraph", { content: "Two parts", cssId: "ratio-two", grow: "2" }, ratioRow);
  add(valid, "Paragraph", { content: "One part", cssId: "ratio-one", grow: "1" }, ratioRow);

  await prisma.page.create({
    data: {
      title: "Layout Showcase",
      slug: "layout-showcase",
      templateId: DEFAULT_TEMPLATE_ID,
      publishedAt: YESTERDAY,
      blocks: { create: valid },
    },
  });

  // Rows saving would refuse, as if written some other way. The page must
  // still render, without them. Never saved by the tests, since saving fails.
  order = 0;
  const broken: Row[] = [];
  add(broken, "Paragraph", { content: "Broken layout intro", cssId: "broken-intro" });
  add(broken, "Paragraph", { content: "Orphan text" }, "no-such-block");
  const x = crypto.randomUUID();
  const y = add(broken, "Container", { cssId: "loop-y" }, x);
  broken.push({ ...block(order++, "Container", { cssId: "loop-x" }), id: x, parentId: y });
  add(broken, "Paragraph", { content: "Looped text" }, x);
  const plain = add(broken, "Paragraph", { content: "Not a container", cssId: "not-a-container" });
  add(broken, "Paragraph", { content: "Child of a paragraph" }, plain);
  // Containers nested one deeper than MAX_DEPTH allows (lib/block-tree.ts)
  let parent: string | undefined;
  for (let depth = 0; depth <= MAX_DEPTH; depth++) {
    parent = add(broken, "Container", { cssId: `deep-${depth}` }, parent);
  }
  add(broken, "Paragraph", { content: "Too deep text" }, parent);

  await prisma.page.create({
    data: {
      title: "Broken Layout",
      slug: "broken-layout",
      templateId: DEFAULT_TEMPLATE_ID,
      publishedAt: YESTERDAY,
      blocks: { create: broken },
    },
  });

  // Links: each style, an underline, a new tab, tokens over a style, a nav
  // row like the mock's header, and an address saving would refuse
  order = 0;
  const links: Row[] = [];
  add(links, "Link", { label: "Plain link", url: "/hello-world", cssId: "link-plain" });
  add(links, "Link", { label: "Button link", url: "/hello-world", style: "button", cssId: "link-button" });
  add(links, "Link", { label: "Outline link", url: "/hello-world", style: "outline", cssId: "link-outline" });
  add(links, "Link", {
    label: "Accent button",
    url: "/hello-world",
    style: "button",
    background: "accent",
    cssId: "link-accent",
  });
  add(links, "Link", { label: "Footer link", url: "/hello-world", underline: "always", cssId: "link-underlined" });
  add(links, "Link", {
    label: "Subscribe on YouTube",
    url: "https://www.youtube.com/",
    newTab: "true",
    style: "button",
    cssId: "link-external",
  });
  // Font weight set once on the Container; the links inherit it
  const nav = add(links, "Container", {
    direction: "row",
    gap: "l",
    weight: "medium",
    cssId: "link-nav",
  });
  for (const label of ["Projects", "Build log", "Videos", "About"]) {
    add(links, "Link", { label, url: `/${label.toLowerCase().replace(" ", "-")}` }, nav);
  }
  // A span Container: plain inline markup round its children. Its own
  // settings apply (the weight); the layout ones (a row, a gap) do not
  const span = add(links, "Container", {
    element: "span",
    direction: "row",
    gap: "xl",
    weight: "bold",
    cssId: "link-span",
  });
  add(links, "Link", { label: "Inline one", url: "/hello-world", cssId: "span-one" }, span);
  add(links, "Link", { label: "Inline two", url: "/hello-world", cssId: "span-two" }, span);
  // A linked Container: the whole row is one link, laid out as a row
  const box = add(links, "Container", {
    direction: "row",
    gap: "l",
    url: "/hello-world",
    cssId: "link-box",
  });
  add(links, "Paragraph", { content: "Linked box left", cssId: "box-left" }, box);
  add(links, "Paragraph", { content: "Linked box right", cssId: "box-right" }, box);
  add(links, "Link", { label: "Unsafe link", url: "javascript:alert(1)", cssId: "link-unsafe" });

  await prisma.page.create({
    data: {
      title: "Link Showcase",
      slug: "link-showcase",
      templateId: DEFAULT_TEMPLATE_ID,
      publishedAt: YESTERDAY,
      blocks: { create: links },
    },
  });
}

async function main() {
  assertLocalDatabase();
  await clearData();
  await seedUsers();
  await seedTemplates();
  await seedCategories();
  await seedPages();

  console.log("All data has been seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
