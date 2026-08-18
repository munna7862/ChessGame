import { test, expect } from "@playwright/test";

/**
 * Phase 05 · Sprint 03: Move History and Captured Pieces
 * E2E test suite validating Move History table rendering, SAN move grouping, active move highlight, and captured pieces display during playout.
 * Reference: docs/testing/test_cases_catalog_P05_S03.md (TC-HIST-01 to TC-HIST-10, TC-CAPT-01 to TC-CAPT-04, TC-E2E-01)
 */

test.describe("ChessForge Move History & Captured Pieces E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TC-HIST-05: should display empty move history panel on initial load", async ({
    page,
  }) => {
    const historyPanel = page.getByTestId("move-history-panel");
    await expect(historyPanel).toBeVisible();

    const emptyMsg = page.getByTestId("move-history-empty");
    await expect(emptyMsg).toBeVisible();
    await expect(emptyMsg).toHaveText("No moves played yet.");
  });

  test("TC-HIST-01, TC-HIST-02, TC-HIST-04 & TC-CAPT-01: records SAN moves and highlights active ply", async ({
    page,
  }) => {
    // 1. e4
    await page.getByTestId("board-square-e2").click();
    await page.getByTestId("board-square-e4").click();

    // Verify row 1 White move e4
    const row1 = page.getByTestId("move-row-1");
    await expect(row1).toBeVisible();
    const cell0 = page.getByTestId("move-cell-0");
    await expect(cell0).toHaveText("e4");
    await expect(cell0).toHaveAttribute("data-active", "true");

    // 1... e5
    await page.getByTestId("board-square-e7").click();
    await page.getByTestId("board-square-e5").click();

    const cell1 = page.getByTestId("move-cell-1");
    await expect(cell1).toHaveText("e5");
    await expect(cell1).toHaveAttribute("data-active", "true");
    await expect(cell0).toHaveAttribute("data-active", "false");

    // 2. Nf3
    await page.getByTestId("board-square-g1").click();
    await page.getByTestId("board-square-f3").click();

    const row2 = page.getByTestId("move-row-2");
    await expect(row2).toBeVisible();
    const cell2 = page.getByTestId("move-cell-2");
    await expect(cell2).toHaveText("Nf3");
    await expect(cell2).toHaveAttribute("data-active", "true");

    // 2... d5
    await page.getByTestId("board-square-d7").click();
    await page.getByTestId("board-square-d5").click();

    // 3. Nxe5 (White captures Black pawn)
    await page.getByTestId("board-square-f3").click();
    await page.getByTestId("board-square-e5").click();

    const cell4 = page.getByTestId("move-cell-4");
    await expect(cell4).toHaveText("Nxe5");

    // Verify White captured pieces in player panel
    const whiteCaptures = page.getByTestId("captured-pieces-w");
    await expect(whiteCaptures).toBeVisible();
    const whiteAdvantage = page.getByTestId("captured-tray-w-advantage");
    await expect(whiteAdvantage).toHaveText("+1");
  });
});
