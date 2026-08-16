import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E Test Configuration for ChessForge.
 * Validates the webview/browser presentation layer and launch smoke behaviors.
 * Reference: docs/testing-strategy.md (Tier 5 E2E Playout)
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30 * 1000,
  expect: {
    timeout: 5000,
  },
  reporter: [
    ["html", { open: "never", outputFolder: "playwright-report" }],
    ["list"],
  ],
  outputDir: "test-results",
  use: {
    baseURL: "http://localhost:1420",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:1420",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
