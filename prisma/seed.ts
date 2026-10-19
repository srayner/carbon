import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated/prisma";
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
    "templateSlot",
    "block",
    "fragment",
    "pageMeta",
    "page",
    "template",
    "account",
    "user",
  ];

  for (const model of models) {
    await (prisma[model] as any).deleteMany({});
  }

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

async function seedPages() {
  await prisma.page.create({
    data: {
      title: "Hello World",
      templateId: DEFAULT_TEMPLATE_ID,
      slug: "hello-world",
      publishedAt: new Date(),
      blocks: {
        create: [
          {
            id: crypto.randomUUID(),
            type: "Heading",
            order: 0,
            properties: { level: "h2", content: "Getting started" },
          },
          {
            id: crypto.randomUUID(),
            type: "Paragraph",
            order: 1,
            properties: { content: "This page was created by the seed script." },
          },
          {
            id: crypto.randomUUID(),
            type: "RichText",
            order: 2,
            properties: {
              content:
                "<p>Some <strong>rich</strong> text with a table:</p>" +
                "<table><thead><tr><th>Part</th><th>Qty</th></tr></thead>" +
                "<tbody><tr><td>Resistor</td><td>10</td></tr>" +
                "<tr><td>Capacitor</td><td>4</td></tr></tbody></table>",
            },
          },
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
