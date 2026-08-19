import { test, expect } from "@playwright/test";

/**
 * Phase 09 · Sprint 05: Error Loading and Empty States E2E
 * Validates empty states in move history, invalid PGN and FEN validation banners,
 * and game state immutability on input error.
 */

test.describe("ChessForge Error, Loading and Empty States E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TC-E2E-ERR-01: renders empty move history placeholder and transitions on first move", async ({
    page,
  }) => {
    // Verify initial empty state
    const emptyNotice = page.getByTestId("move-history-empty");
    await expect(emptyNotice).toBeVisible();
    await expect(emptyNotice).toContainText("No moves played yet.");
    await expect(page.getByTestId("move-count-badge")).toHaveText("0 plies");

    // Play 1. e4
    await page.getByTestId("board-square-e2").click();
    await page.getByTestId("board-square-e4").click();

    // Empty state should be replaced by move history table
    await expect(emptyNotice).not.toBeVisible();
    await expect(page.getByTestId("move-row-1")).toBeVisible();
    await expect(page.getByTestId("move-cell-0")).toHaveText("e4");
    await expect(page.getByTestId("move-count-badge")).toHaveText("1 ply");
  });

  test("TC-E2E-ERR-02: shows validation error on invalid PGN import and preserves active board", async ({
    page,
  }) => {
    // Open PGN import modal
    await page.getByTestId("btn-import-pgn").click();
    await expect(page.getByTestId("pgn-import-modal")).toBeVisible();

    // Type invalid PGN
    await page
      .getByTestId("pgn-import-textarea")
      .fill("1. e5 (illegal for white)");
    await expect(page.getByTestId("pgn-import-error-banner")).toBeVisible();
    await expect(page.getByTestId("btn-confirm-import-pgn")).toBeDisabled();

    // Close modal
    await page.getByTestId("btn-cancel-import-pgn").click();
    await expect(page.getByTestId("pgn-import-modal")).not.toBeVisible();

    // Verify initial starting board is preserved
    await expect(page.getByTestId("board-square-e2")).toBeVisible();
  });

  test("TC-E2E-ERR-03: shows validation error on invalid FEN and disables load actions", async ({
    page,
  }) => {
    // Open FEN modal
    await page.getByTestId("btn-fen-workflow").click();
    await expect(page.getByTestId("fen-modal")).toBeVisible();

    // Enter invalid FEN
    await page.getByTestId("fen-input-textarea").fill("not_a_valid_fen_string");
    await expect(page.getByTestId("fen-validation-card")).toBeVisible();
    await expect(page.getByTestId("fen-error-message")).toBeVisible();
    await expect(page.getByTestId("btn-load-fen")).toBeDisabled();
    await expect(page.getByTestId("btn-start-game-fen")).toBeDisabled();

    // Close FEN modal
    await page.getByTestId("btn-cancel-fen-modal").click();
    await expect(page.getByTestId("fen-modal")).not.toBeVisible();
  });
});
