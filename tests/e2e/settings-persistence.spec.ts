import { test, expect } from "@playwright/test";

/**
 * Phase 10 · Sprint 04: End-to-End Release Suite
 * Settings Persistence & Preferences E2E Suite
 * Reference: docs/testing/test_cases_catalog_P10_S04.md (TC-E2E-11)
 */

test.describe("ChessForge Settings Persistence E2E Workflow (TC-E2E-11)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForSelector('[data-testid="chessforge-app"]');
  });

  test("should open settings modal, update theme and piece set, and persist across page reloads", async ({
    page,
  }) => {
    // 1. Open Settings modal
    const openSettingsBtn = page.getByTestId("btn-open-settings");
    await expect(openSettingsBtn).toBeVisible();
    await openSettingsBtn.click();

    const settingsModal = page.getByTestId("settings-modal");
    await expect(settingsModal).toBeVisible();

    // 2. Select Wood Theme
    const woodThemeOption = page.getByTestId("theme-option-wood");
    await expect(woodThemeOption).toBeVisible();
    await woodThemeOption.click();
    await expect(page.getByTestId("theme-badge-selected-wood")).toBeVisible();

    // 3. Select Modern Neo piece set
    const modernPieceSetOption = page.getByTestId("piece-set-option-modern");
    await expect(modernPieceSetOption).toBeVisible();
    await modernPieceSetOption.click();
    await expect(
      page.getByTestId("piece-set-badge-selected-modern")
    ).toBeVisible();

    // 4. Close settings via Done
    await page.getByTestId("btn-done-settings").click();
    await expect(settingsModal).not.toBeVisible();

    // 5. Verify board container reflects updated theme and piece set
    const board = page.getByTestId("chess-board");
    await expect(board).toHaveAttribute("data-board-theme", "wood");
    await expect(board).toHaveAttribute("data-piece-set", "modern");

    // 6. Reload page to verify persistence in localStorage
    await page.reload();
    await page.waitForSelector('[data-testid="chessforge-app"]');

    // Verify theme and piece set still active on board after reload
    await expect(page.getByTestId("chess-board")).toHaveAttribute(
      "data-board-theme",
      "wood"
    );
    await expect(page.getByTestId("chess-board")).toHaveAttribute(
      "data-piece-set",
      "modern"
    );

    // Reopen settings and verify active badges
    await page.getByTestId("btn-open-settings").click();
    await expect(settingsModal).toBeVisible();
    await expect(page.getByTestId("theme-badge-selected-wood")).toBeVisible();
    await expect(
      page.getByTestId("piece-set-badge-selected-modern")
    ).toBeVisible();

    await page.getByTestId("btn-done-settings").click();
  });

  test("should navigate through all settings tabs seamlessly", async ({
    page,
  }) => {
    await page.getByTestId("btn-open-settings").click();
    const settingsModal = page.getByTestId("settings-modal");
    await expect(settingsModal).toBeVisible();

    // Tab 1: Appearance (default)
    await expect(page.getByTestId("settings-section-appearance")).toBeVisible();

    // Tab 2: Gameplay
    await page.getByTestId("tab-gameplay").click();
    await expect(page.getByTestId("settings-section-gameplay")).toBeVisible();

    // Tab 3: Sound & Motion
    await page.getByTestId("tab-audio-motion").click();
    await expect(
      page.getByTestId("settings-section-audio-motion")
    ).toBeVisible();

    // Tab 4: AI Engine
    await page.getByTestId("tab-engine").click();
    await expect(page.getByTestId("settings-section-engine")).toBeVisible();

    await page.getByTestId("btn-done-settings").click();
    await expect(settingsModal).not.toBeVisible();
  });

  test("should reset all settings to defaults via confirmation modal", async ({
    page,
  }) => {
    // Open settings and change theme to Ocean
    await page.getByTestId("btn-open-settings").click();
    await page.getByTestId("theme-option-ocean").click();
    await expect(page.getByTestId("theme-badge-selected-ocean")).toBeVisible();

    // Click Reset to Defaults
    await page.getByTestId("btn-reset-settings").click();
    const confirmModal = page.getByTestId("reset-settings-confirm-modal");
    await expect(confirmModal).toBeVisible();

    // Confirm reset
    await page.getByTestId("btn-confirm-reset-settings").click();
    await expect(confirmModal).not.toBeVisible();

    // Verify theme reverted to Classic
    await expect(
      page.getByTestId("theme-badge-selected-classic")
    ).toBeVisible();
    await expect(
      page.getByTestId("piece-set-badge-selected-standard")
    ).toBeVisible();

    await page.getByTestId("btn-done-settings").click();
  });
});
