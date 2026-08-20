import { test, expect } from "@playwright/test";

/**
 * Phase 02 · Sprint 03: Playwright and E2E Foundation
 * Launch smoke test validating webview presentation, stable locators, and core layout.
 * Reference: docs/testing-strategy.md (Tier 5: Desktop E2E Playout)
 * Test Cases Catalog: docs/testing/test_cases_catalog_P02_S03.md (TC-E2E-01 to TC-E2E-09)
 */

test.describe("ChessForge Desktop Webview Launch Smoke Tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TC-E2E-03: should launch application and verify document title and root container", async ({
    page,
  }) => {
    // Verify document title
    await expect(page).toHaveTitle(/ChessForge/i);

    // Verify root application container
    const appContainer = page.getByTestId("chessforge-app");
    await expect(appContainer).toBeVisible();
  });

  test("TC-E2E-04: should render header with brand logo and version badge", async ({
    page,
  }) => {
    const header = page.getByTestId("app-header");
    await expect(header).toBeVisible();

    const brand = page.getByTestId("app-brand");
    await expect(brand).toBeVisible();
    await expect(brand).toHaveText(/ChessForge/);

    const version = page.getByTestId("app-version");
    await expect(version).toBeVisible();
    await expect(version).toHaveText(/v1\.0\.0/);
  });

  test("TC-E2E-04: should display engine status badge indicating local readiness", async ({
    page,
  }) => {
    const statusBadge = page.getByTestId("engine-status-badge");
    await expect(statusBadge).toBeVisible();
    await expect(statusBadge).toContainText("Local Engine Ready");
  });

  test("TC-E2E-04: should render hero card with performance metrics and feature stack", async ({
    page,
  }) => {
    // Title & subtitle
    const appTitle = page.getByTestId("app-title");
    await expect(appTitle).toBeVisible();
    await expect(appTitle).toHaveText("ChessForge");

    const heroSubtitle = page.getByTestId("hero-subtitle");
    await expect(heroSubtitle).toBeVisible();
    await expect(heroSubtitle).toContainText("Tauri v2");

    // Metrics grid items
    const memoryMetric = page.getByTestId("metric-memory");
    await expect(memoryMetric).toBeVisible();
    await expect(memoryMetric).toContainText("< 150 MB");

    const fpsMetric = page.getByTestId("metric-fps");
    await expect(fpsMetric).toBeVisible();
    await expect(fpsMetric).toContainText("60 FPS");

    const localMetric = page.getByTestId("metric-local");
    await expect(localMetric).toBeVisible();
    await expect(localMetric).toContainText("100% Local");

    // Feature badges
    const featureList = page.getByTestId("feature-list");
    await expect(featureList).toBeVisible();
    await expect(page.getByTestId("feature-tauri")).toBeVisible();
    await expect(page.getByTestId("feature-react")).toBeVisible();
    await expect(page.getByTestId("feature-domain")).toBeVisible();
    await expect(page.getByTestId("feature-stockfish")).toBeVisible();
  });

  test("TC-E2E-09: should maintain desktop layout responsiveness across viewport sizes", async ({
    page,
  }) => {
    // Test standard desktop (1440x900)
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.getByTestId("chessforge-app")).toBeVisible();
    await expect(page.getByTestId("app-header")).toBeVisible();

    // Test compact desktop / small window (1024x768)
    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(page.getByTestId("chessforge-app")).toBeVisible();
    await expect(page.getByTestId("app-title")).toBeVisible();

    // Test wide screen (1920x1080)
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.getByTestId("chessforge-app")).toBeVisible();
    await expect(page.getByTestId("metrics-grid")).toBeVisible();
  });
});
