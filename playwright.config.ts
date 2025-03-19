import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";

export const BASE_URL = process.env.BASE_URL || "http://localhost:5001";

export default defineConfig({
  testDir: "./client/playwright/tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: BASE_URL,
    screenshot: "only-on-failure",
    launchOptions: {
      slowMo: 200,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    stdout: "pipe",
    stderr: "pipe",
  },
});
