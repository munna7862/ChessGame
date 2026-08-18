import { test, expect, type Page } from "@playwright/test";

test.describe("ChessForge Human vs Human End-to-End Playout (Phase 05 · Sprint 06)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await expect(page.getByTestId("chessforge-app")).toBeVisible();
    await expect(page.getByTestId("chess-board")).toBeVisible();
  });

  const clickSquare = async (page: Page, squareId: string) => {
    const square = page.getByTestId(`board-square-${squareId}`);
    await square.click();
  };

  const playMove = async (page: Page, from: string, to: string) => {
    await clickSquare(page, from);
    await clickSquare(page, to);
  };

  test("TC-HVH-01: should execute full opening moves and sync history and turn indicators", async ({
    page,
  }) => {
    const turnIndicator = page.getByTestId("turn-indicator");
    await expect(turnIndicator).toContainText("White to move");

    // 1. e4 e5
    await playMove(page, "e2", "e4");
    await expect(turnIndicator).toContainText("Black to move");

    await playMove(page, "e7", "e5");
    await expect(turnIndicator).toContainText("White to move");

    // 2. Nf3 Nc6
    await playMove(page, "g1", "f3");
    await playMove(page, "b8", "c6");

    // 3. Bc4 Bc5
    await playMove(page, "f1", "c4");
    await playMove(page, "f8", "c5");

    // Verify history panel contains all SAN moves
    const historyPanel = page.getByTestId("move-history-panel");
    await expect(historyPanel).toContainText("e4");
    await expect(historyPanel).toContainText("e5");
    await expect(historyPanel).toContainText("Nf3");
    await expect(historyPanel).toContainText("Nc6");
    await expect(historyPanel).toContainText("Bc4");
    await expect(historyPanel).toContainText("Bc5");

    // Last move indicator
    await expect(page.getByTestId("last-move-indicator")).toContainText(
      "Last: f8 → c5 (Bc5)"
    );
  });

  test("TC-HVH-02: should deliver checkmate via Scholar's Mate and display GameResultModal with White victory", async ({
    page,
  }) => {
    // 1. e4 e5 2. Bc4 Nc6 3. Qh5 Nf6 4. Qxf7#
    await playMove(page, "e2", "e4");
    await playMove(page, "e7", "e5");
    await playMove(page, "f1", "c4");
    await playMove(page, "b8", "c6");
    await playMove(page, "d1", "h5");
    await playMove(page, "g8", "f6");
    await playMove(page, "h5", "f7");

    // Checkmate indicator & Modal
    await expect(page.getByTestId("checkmate-indicator")).toBeVisible();
    const modal = page.getByTestId("game-result-modal");
    await expect(modal).toBeVisible();
    await expect(page.getByTestId("game-result-title")).toContainText(
      "White Wins!"
    );
    await expect(page.getByTestId("game-result-subtitle")).toContainText(
      "by Checkmate"
    );
    await expect(page.getByTestId("game-result-scoreline")).toContainText(
      "1 - 0"
    );
  });

  test("TC-HVH-03: should deliver checkmate via Fool's Mate and display GameResultModal with Black victory", async ({
    page,
  }) => {
    // 1. f3 e5 2. g4 Qh4#
    await playMove(page, "f2", "f3");
    await playMove(page, "e7", "e5");
    await playMove(page, "g2", "g4");
    await playMove(page, "d8", "h4");

    await expect(page.getByTestId("checkmate-indicator")).toBeVisible();
    const modal = page.getByTestId("game-result-modal");
    await expect(modal).toBeVisible();
    await expect(page.getByTestId("game-result-title")).toContainText(
      "Black Wins!"
    );
    await expect(page.getByTestId("game-result-subtitle")).toContainText(
      "by Checkmate"
    );
    await expect(page.getByTestId("game-result-scoreline")).toContainText(
      "0 - 1"
    );
  });

  test("TC-HVH-04: should handle resignation workflow and award win to opponent", async ({
    page,
  }) => {
    await playMove(page, "e2", "e4");
    await playMove(page, "e7", "e5");

    // White resigns
    await page.getByTestId("btn-resign-game").click();
    await expect(page.getByTestId("resign-confirm-modal")).toBeVisible();

    await page.getByTestId("btn-confirm-resign").click();
    await expect(page.getByTestId("game-result-modal")).toBeVisible();
    await expect(page.getByTestId("game-result-title")).toContainText(
      "Black Wins!"
    );
    await expect(page.getByTestId("game-result-subtitle")).toContainText(
      "by Resignation"
    );
    await expect(page.getByTestId("game-result-scoreline")).toContainText(
      "0 - 1"
    );
  });

  test("TC-HVH-05: should prompt on restart, support cancel, and cleanly reset state on confirm", async ({
    page,
  }) => {
    await playMove(page, "e2", "e4");
    await playMove(page, "e7", "e5");

    // Click Restart
    await page.getByTestId("btn-restart-game").click();
    await expect(page.getByTestId("restart-confirm-modal")).toBeVisible();

    // Cancel
    await page.getByTestId("btn-cancel-restart").click();
    await expect(page.getByTestId("restart-confirm-modal")).not.toBeVisible();
    await expect(page.getByTestId("last-move-indicator")).toBeVisible();

    // Confirm Restart
    await page.getByTestId("btn-restart-game").click();
    await page.getByTestId("btn-confirm-restart").click();

    await expect(page.getByTestId("restart-confirm-modal")).not.toBeVisible();
    await expect(page.getByTestId("last-move-indicator")).not.toBeVisible();
    await expect(page.getByTestId("turn-indicator")).toContainText(
      "White to move"
    );
  });

  test("TC-HVH-06 & TC-HVH-07: should support Draw Offer, Accept, and Decline flows", async ({
    page,
  }) => {
    await playMove(page, "e2", "e4");
    await playMove(page, "e7", "e5");

    // White offers draw -> Black declines
    await page.getByTestId("btn-offer-draw").click();
    await expect(page.getByTestId("draw-offer-confirm-modal")).toBeVisible();
    await page.getByTestId("btn-decline-draw").click();
    await expect(
      page.getByTestId("draw-offer-confirm-modal")
    ).not.toBeVisible();

    // Playout continues: 2. Nf3
    await playMove(page, "g1", "f3");
    await expect(page.getByTestId("turn-indicator")).toContainText(
      "Black to move"
    );

    // Black offers draw -> White accepts
    await page.getByTestId("btn-offer-draw").click();
    await expect(page.getByTestId("draw-offer-confirm-modal")).toBeVisible();
    await page.getByTestId("btn-accept-draw").click();

    await expect(page.getByTestId("game-result-modal")).toBeVisible();
    await expect(page.getByTestId("game-result-title")).toContainText(
      "Game Drawn"
    );
    await expect(page.getByTestId("game-result-subtitle")).toContainText(
      "by Mutual Agreement"
    );
    await expect(page.getByTestId("game-result-scoreline")).toContainText(
      "½ - ½"
    );
  });

  test("TC-HVH-08: should support Review Board mode, View Result reopening, and Rematch flow", async ({
    page,
  }) => {
    // Quick Fool's Mate
    await playMove(page, "f2", "f3");
    await playMove(page, "e7", "e5");
    await playMove(page, "g2", "g4");
    await playMove(page, "d8", "h4");

    await expect(page.getByTestId("game-result-modal")).toBeVisible();

    // Click Review Board
    await page.getByTestId("btn-review-board").click();
    await expect(page.getByTestId("game-result-modal")).not.toBeVisible();

    // Board is disabled in review mode
    const squareE2 = page.getByTestId("board-square-e2");
    await expect(squareE2).toHaveAttribute("aria-disabled", "true");
    await squareE2.click({ force: true });
    await expect(
      page.getByTestId("selected-square-indicator")
    ).not.toBeVisible();

    // View Result button reopens modal
    await page.getByTestId("btn-view-result").click();
    await expect(page.getByTestId("game-result-modal")).toBeVisible();

    // Click Rematch
    await page.getByTestId("btn-rematch").click();
    await expect(page.getByTestId("game-result-modal")).not.toBeVisible();
    await expect(page.getByTestId("turn-indicator")).toContainText(
      "White to move"
    );
    await expect(page.getByTestId("checkmate-indicator")).not.toBeVisible();
  });

  test("TC-HVH-09: should support step-by-step undo and restore captured material", async ({
    page,
  }) => {
    // 1. e4 d5 2. exd5
    await playMove(page, "e2", "e4");
    await playMove(page, "d7", "d5");
    await playMove(page, "e4", "d5");

    const undoBtn = page.getByTestId("btn-undo-move");
    await expect(undoBtn).toBeEnabled();

    // Undo capture
    await undoBtn.click();
    await expect(page.getByTestId("turn-indicator")).toContainText(
      "White to move"
    );
    await expect(page.getByTestId("last-move-indicator")).toContainText(
      "Last: d7 → d5 (d5)"
    );

    // Undo move 1... d5
    await undoBtn.click();
    await expect(page.getByTestId("turn-indicator")).toContainText(
      "Black to move"
    );

    // Undo move 1. e4
    await undoBtn.click();
    await expect(page.getByTestId("turn-indicator")).toContainText(
      "White to move"
    );
    await expect(undoBtn).toBeDisabled();
  });

  test("TC-HVH-10: should configure and launch a New Game via modal", async ({
    page,
  }) => {
    await page.getByTestId("btn-reset-game").click();
    await expect(page.getByTestId("new-game-modal")).toBeVisible();

    const p1Input = page.getByTestId("input-player1-name");
    const p2Input = page.getByTestId("input-player2-name");

    await p1Input.fill("Magnus");
    await p2Input.fill("Hikaru");

    await page.getByTestId("btn-submit-new-game").click();
    await expect(page.getByTestId("new-game-modal")).not.toBeVisible();

    await expect(page.getByTestId("player-name-w")).toContainText("Magnus");
    await expect(page.getByTestId("player-name-b")).toContainText("Hikaru");
  });
});
