import { test, expect } from "@playwright/test";

/**
 * Phase 05 · Sprint 05: Draw Flow and Game Result
 * E2E test suite validating Draw offer/accept/decline, GameResultModal display, Review Board mode, and Rematch flow.
 * Reference: docs/testing/test_cases_catalog_P05_S05.md (TC-DRAW-01 to TC-DRAW-16, TC-E2E-02)
 */

test.describe("ChessForge Draw Flow & Game Result E2E (TC-E2E-02)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TC-DRAW-01 to TC-DRAW-04: should support Draw Offer, Decline, and Accept flows", async ({
    page,
  }) => {
    const offerDrawBtn = page.getByTestId("btn-offer-draw");
    await expect(offerDrawBtn).toBeEnabled();

    // 1. Open Draw Offer dialog
    await offerDrawBtn.click();
    const drawModal = page.getByTestId("draw-offer-confirm-modal");
    await expect(drawModal).toBeVisible();
    await expect(page.getByText("Draw Offered?")).toBeVisible();

    // 2. Decline Draw
    await page.getByTestId("btn-decline-draw").click();
    await expect(drawModal).not.toBeVisible();
    await expect(page.getByTestId("game-result-modal")).not.toBeVisible();

    // Board remains interactive
    const board = page.getByTestId("chess-board");
    await expect(board).toHaveAttribute("aria-disabled", "false");

    // 3. Re-offer and Accept Draw
    await offerDrawBtn.click();
    await page.getByTestId("btn-accept-draw").click();

    // 4. Game Result Modal appears with draw outcome
    const resultModal = page.getByTestId("game-result-modal");
    await expect(resultModal).toBeVisible();
    await expect(page.getByTestId("game-result-title")).toHaveText(
      "Game Drawn"
    );
    await expect(page.getByTestId("game-result-subtitle")).toHaveText(
      "by Mutual Agreement"
    );
    await expect(page.getByTestId("game-result-scoreline")).toHaveText("½ - ½");

    // Board controls disabled
    await expect(offerDrawBtn).toBeDisabled();
    await expect(page.getByTestId("btn-resign-game")).toBeDisabled();
    await expect(page.getByTestId("btn-undo-move")).toBeDisabled();
  });

  test("TC-DRAW-11 & TC-DRAW-12: should support Review Board mode and View Result reopening", async ({
    page,
  }) => {
    // Conclude game by draw
    await page.getByTestId("btn-offer-draw").click();
    await page.getByTestId("btn-accept-draw").click();

    const resultModal = page.getByTestId("game-result-modal");
    await expect(resultModal).toBeVisible();

    // Click Review Board
    await page.getByTestId("btn-review-board").click();
    await expect(resultModal).not.toBeVisible();

    // Board is disabled in review mode
    const board = page.getByTestId("chess-board");
    await expect(board).toHaveAttribute("aria-disabled", "true");

    // View Result button appears in controls
    const viewResultBtn = page.getByTestId("btn-view-result");
    await expect(viewResultBtn).toBeVisible();

    // Click View Result to reopen modal
    await viewResultBtn.click();
    await expect(resultModal).toBeVisible();
  });

  test("TC-DRAW-13: should restart cleanly via Rematch button in GameResultModal", async ({
    page,
  }) => {
    // Play 1. e4 e5
    await page.getByTestId("board-square-e2").click();
    await page.getByTestId("board-square-e4").click();
    await page.getByTestId("board-square-e7").click();
    await page.getByTestId("board-square-e5").click();

    // Conclude game by resignation
    await page.getByTestId("btn-resign-game").click();
    await page.getByTestId("btn-confirm-resign").click();

    const resultModal = page.getByTestId("game-result-modal");
    await expect(resultModal).toBeVisible();
    await expect(page.getByTestId("game-result-title")).toHaveText(
      "Black Wins!"
    );
    await expect(page.getByTestId("game-result-subtitle")).toHaveText(
      "by Resignation"
    );

    // Click Rematch
    await page.getByTestId("btn-rematch").click();
    await expect(resultModal).not.toBeVisible();

    // Fresh game state
    await expect(page.getByTestId("turn-indicator")).toHaveText(
      "White to move"
    );
    await expect(page.getByTestId("last-move-indicator")).not.toBeVisible();
    await expect(page.getByTestId("btn-offer-draw")).toBeEnabled();
    await expect(page.getByTestId("btn-undo-move")).toBeDisabled();
  });
});
