import bcrypt from "bcryptjs";
import { Prisma, PrismaClient } from "../lib/generated/prisma";
import { DEFAULT_TEMPLATE_ID, PRESET_TEMPLATES } from "../config/templates";

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
          }),
        ],
      },
    },
  });

  console.log("Pages have been seeded!");
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
