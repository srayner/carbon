import bcrypt from "bcryptjs";
import { PrismaClient } from "../lib/generated/prisma";

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
    "block",
    "pageMeta",
    "page",
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

async function seedPages() {
  await prisma.page.create({
    data: {
      title: "Hello World",
      slug: "hello-world",
      publishedAt: new Date(),
      blocks: {
        create: [
          {
            id: crypto.randomUUID(),
            type: "Heading",
            order: 0,
            properties: { level: "h1", content: "Hello World" },
          },
          {
            id: crypto.randomUUID(),
            type: "Paragraph",
            order: 1,
            properties: { content: "This page was created by the seed script." },
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
