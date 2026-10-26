import { test as setup, expect } from "@playwright/test";
import { AUTH_FILES } from "../playwright.config";

// Logs in once per role and saves the session for that role's specs.
// The accounts come from the seed script (prisma/seed.ts).
const accounts = [
  {
    role: "admin",
    email: "admin@example.com",
    password: process.env.USER_PASSWORD_ADMIN,
    // Admins land in the admin area
    landing: /\/admin/,
  },
  {
    role: "user",
    email: "user@example.com",
    password: process.env.USER_PASSWORD_USER,
    // Non-admins land on the home page
    landing: /localhost:3003\/$/,
  },
] as const;

for (const { role, email, password, landing } of accounts) {
  setup(`log in as ${role}`, async ({ page }) => {
    expect(password, `USER_PASSWORD_${role.toUpperCase()} is not set`).toBeTruthy();

    await page.goto("/auth/login");
    await page.locator('input[name="email"]').fill(email);
    await page.locator('input[name="password"]').fill(password!);
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(landing);

    await page.context().storageState({ path: AUTH_FILES[role] });
  });
}
