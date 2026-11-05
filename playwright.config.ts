import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config();

export const AUTH_FILES = {
  admin: "playwright/.auth/admin.json",
  user: "playwright/.auth/user.json",
};

// The specs share the one seeded database (`npm run seed`) and some of them
// change it (the theme, a page), so they run one at a time, in order.
export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  reporter: [["html", { outputFolder: "playwright-report", open: "never" }], ["list"]],
  use: {
    baseURL: "http://localhost:3003",
    trace: "on-first-retry",
  },
  // With port 3003 free: seed, build and start a production server, run the
  // tests, then stop it. With a server already running there, use it as it is
  // (no seed, no build). See "Testing" in README.md.
  webServer: {
    command: "npm run seed && npm run build && npm start",
    url: "http://localhost:3003",
    reuseExistingServer: true,
    timeout: 300_000, // the production build takes a while
  },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    // Guests are not logged in
    {
      name: "guest",
      testMatch: /e2e\/guest\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "user",
      testMatch: /e2e\/user\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], storageState: AUTH_FILES.user },
      dependencies: ["setup"],
    },
    {
      name: "admin",
      testMatch: /e2e\/admin\/.*\.spec\.ts/,
      use: { ...devices["Desktop Chrome"], storageState: AUTH_FILES.admin },
      dependencies: ["setup"],
    },
  ],
});
