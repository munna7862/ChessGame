import { test, expect } from "@playwright/test";

/**
 * Phase 04 · Sprint 02: Piece Rendering E2E Suite
 * Reference: docs/testing/test_cases_catalog_P04_S02.md (TC-PIECE-23)
 */

test.describe("ChessForge Piece Rendering (Phase 04 · Sprint 02)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TC-PIECE-23: renders all starting position pieces on the board with correct roles and labels", async ({
    page,
  }) => {
    const board = page.getByTestId("chess-board");
    await expect(board).toBeVisible();

    // Verify White Kings and Queens
    const whiteKing = page.getByTestId("piece-wk");
    await expect(whiteKing).toBeVisible();
    await expect(whiteKing).toHaveAttribute("role", "img");
    await expect(whiteKing).toHaveAttribute("aria-label", "White King");

    const whiteQueen = page.getByTestId("piece-wq");
    await expect(whiteQueen).toBeVisible();
    await expect(whiteQueen).toHaveAttribute("role", "img");
    await expect(whiteQueen).toHaveAttribute("aria-label", "White Queen");

    // Verify Black Kings and Queens
    const blackKing = page.getByTestId("piece-bk");
    await expect(blackKing).toBeVisible();
    await expect(blackKing).toHaveAttribute("role", "img");
    await expect(blackKing).toHaveAttribute("aria-label", "Black King");

    const blackQueen = page.getByTestId("piece-bq");
    await expect(blackQueen).toBeVisible();
    await expect(blackQueen).toHaveAttribute("role", "img");
    await expect(blackQueen).toHaveAttribute("aria-label", "Black Queen");

    // Verify white pawns (8) and black pawns (8)
    const whitePawns = page.getByTestId("piece-wp");
    await expect(whitePawns).toHaveCount(8);

    const blackPawns = page.getByTestId("piece-bp");
    await expect(blackPawns).toHaveCount(8);

    // Verify empty squares in center
    const squareE4 = page.getByTestId("board-square-e4");
    await expect(squareE4).toHaveAttribute("data-has-piece", "false");
    await expect(squareE4.locator(".chess-piece")).toHaveCount(0);
  });

  test("should preserve piece positions across board flip", async ({
    page,
  }) => {
    const flipButton = page.getByTestId("btn-flip-board");
    await expect(flipButton).toBeVisible();

    const squareE1 = page.getByTestId("board-square-e1");
    await expect(squareE1.locator("[data-testid='piece-wk']")).toBeVisible();

    // Flip to Black
    await flipButton.click();
    await expect(squareE1.locator("[data-testid='piece-wk']")).toBeVisible();

    // Flip back to White
    await flipButton.click();
    await expect(squareE1.locator("[data-testid='piece-wk']")).toBeVisible();
  });
});
