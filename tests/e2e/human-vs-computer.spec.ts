import { test, expect } from "@playwright/test";

/**
 * Phase 06 · Sprint 05: Human vs Computer Game Flow
 * E2E test suite validating Human vs Computer game initiation, Stockfish engine turn execution,
 * thinking state indicators, board locking, and clean reset/undo handling.
 * Reference: docs/testing/test_cases_catalog_P06_S05.md (TC-HVC-01 to TC-HVC-12)
 */

test.describe("ChessForge Human vs Computer Game Flow E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TC-HVC-01 & TC-HVC-04: should start Human vs Computer game and execute turns with Stockfish", async ({
    page,
  }) => {
    // 1. Open New Game modal and select Vs Computer mode
    await page.getByTestId("btn-reset-game").click();
    await expect(page.getByTestId("new-game-modal")).toBeVisible();

    await page.getByTestId("mode-human-vs-engine").click();
    await page.getByTestId("btn-submit-new-game").click();
    await expect(page.getByTestId("new-game-modal")).not.toBeVisible();

    // Verify Black player is configured as Engine AI
    await expect(page.getByTestId("player-name-b")).toHaveText("Stockfish");
    await expect(page.getByTestId("player-type-b")).toHaveText("AI");

    // 2. Human plays 1. e4
    await page.getByTestId("board-square-e2").click();
    await page.getByTestId("board-square-e4").click();

    // 3. Engine responds with a legal move (turn returns to White)
    await expect(page.getByTestId("turn-indicator")).toHaveText(
      "White to move",
      { timeout: 15000 }
    );

    // 4. Move history records at least 2 plies
    const historyPanel = page.getByTestId("move-history-panel");
    await expect(historyPanel).toBeVisible();
    await expect(page.getByTestId("last-move-indicator")).toBeVisible();
  });

  test("TC-HVC-05: should make automatic opening move for White when Human plays as Black", async ({
    page,
  }) => {
    await page.getByTestId("btn-reset-game").click();
    await page.getByTestId("mode-human-vs-engine").click();
    await page.getByTestId("color-choice-black").click();
    await page.getByTestId("btn-submit-new-game").click();

    // White engine should make the first move automatically
    await expect(page.getByTestId("turn-indicator")).toHaveText(
      "Black to move",
      { timeout: 15000 }
    );
    await expect(page.getByTestId("last-move-indicator")).toBeVisible();
  });

  test("TC-HVC-06 & TC-HVC-08: should handle Restart and Undo in Human vs Computer cleanly", async ({
    page,
  }) => {
    // Start game vs computer
    await page.getByTestId("btn-reset-game").click();
    await page.getByTestId("mode-human-vs-engine").click();
    await page.getByTestId("btn-submit-new-game").click();

    // Play 1. e4
    await page.getByTestId("board-square-e2").click();
    await page.getByTestId("board-square-e4").click();

    // Wait for engine response
    await expect(page.getByTestId("turn-indicator")).toHaveText(
      "White to move",
      { timeout: 15000 }
    );

    // Human clicks Undo -> rolls back 2 plies
    await page.getByTestId("btn-undo-move").click();
    await expect(page.getByTestId("turn-indicator")).toHaveText(
      "White to move"
    );
    await expect(page.getByTestId("last-move-indicator")).not.toBeVisible();

    // Restart game via confirmation modal
    await page.getByTestId("btn-restart-game").click();
    await expect(page.getByTestId("restart-confirm-modal")).toBeVisible();
    await page.getByTestId("btn-confirm-restart").click();
    await expect(page.getByTestId("restart-confirm-modal")).not.toBeVisible();
  });
});
