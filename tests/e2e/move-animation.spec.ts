import { test, expect } from "@playwright/test";

/**
 * Phase 04 · Sprint 04: Move Animation & Last-Move State E2E Suite
 * Reference: docs/testing/test_cases_catalog_P04_S04.md (TC-ANIM-01 to TC-ANIM-13)
 */

test.describe("ChessForge Move Animation & Last-Move State (Phase 04 · Sprint 04)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TC-ANIM-01, TC-ANIM-02, TC-ANIM-03: tracks and highlights last move origin and destination", async ({
    page,
  }) => {
    // White opens e2-e4
    const e2Square = page.getByTestId("board-square-e2");
    await e2Square.click();

    const e4Square = page.getByTestId("board-square-e4");
    await e4Square.click();

    // Verify last move indicator in status bar
    const lastMoveBadge = page.getByTestId("last-move-indicator");
    await expect(lastMoveBadge).toBeVisible();
    await expect(lastMoveBadge).toContainText("Last: e2 → e4 (e4)");

    // Verify square dataset attributes and CSS classes
    await expect(e2Square).toHaveAttribute("data-is-last-move", "from");
    await expect(e2Square).toHaveClass(/is-last-move-from/);

    await expect(e4Square).toHaveAttribute("data-is-last-move", "to");
    await expect(e4Square).toHaveClass(/is-last-move-to/);

    // Black responds e7-e5
    const e7Square = page.getByTestId("board-square-e7");
    await e7Square.click();

    const e5Square = page.getByTestId("board-square-e5");
    await e5Square.click();

    // Verify updated last move
    await expect(lastMoveBadge).toContainText("Last: e7 → e5 (e5)");
    await expect(e7Square).toHaveAttribute("data-is-last-move", "from");
    await expect(e5Square).toHaveAttribute("data-is-last-move", "to");

    // Previous e2/e4 squares no longer have last move classes
    await expect(e2Square).not.toHaveClass(/is-last-move/);
    await expect(e4Square).not.toHaveClass(/is-last-move/);
  });

  test("TC-ANIM-11, TC-ANIM-12, TC-ANIM-13: toggles reduced motion mode and preserves visual highlights", async ({
    page,
  }) => {
    const motionBtn = page.getByTestId("btn-toggle-motion");
    await expect(motionBtn).toBeVisible();
    await expect(motionBtn).toContainText("Motion: Standard");

    const board = page.getByTestId("chess-board");
    await expect(board).not.toHaveClass(/reduced-motion/);

    // Toggle reduced motion
    await motionBtn.click();
    await expect(motionBtn).toContainText("Motion: Reduced");
    await expect(board).toHaveClass(/reduced-motion/);
    await expect(board).toHaveAttribute("data-reduced-motion", "true");

    // Make a move under reduced motion
    await page.getByTestId("board-square-d2").click();
    await page.getByTestId("board-square-d4").click();

    // Highlights remain fully visible
    await expect(page.getByTestId("board-square-d2")).toHaveClass(
      /is-last-move-from/
    );
    await expect(page.getByTestId("board-square-d4")).toHaveClass(
      /is-last-move-to/
    );

    // Toggle back to standard
    await motionBtn.click();
    await expect(motionBtn).toContainText("Motion: Standard");
    await expect(board).not.toHaveClass(/reduced-motion/);
  });

  test("TC-ANIM-04: resets last move state when New Game is clicked", async ({
    page,
  }) => {
    // Play move e2-e4
    await page.getByTestId("board-square-e2").click();
    await page.getByTestId("board-square-e4").click();

    await expect(page.getByTestId("last-move-indicator")).toBeVisible();
    await expect(page.getByTestId("board-square-e2")).toHaveClass(
      /is-last-move/
    );

    // Reset game
    await page.getByTestId("btn-reset-game").click();

    await expect(page.getByTestId("last-move-indicator")).not.toBeVisible();
    await expect(page.getByTestId("board-square-e2")).not.toHaveClass(
      /is-last-move/
    );
    await expect(page.getByTestId("board-square-e4")).not.toHaveClass(
      /is-last-move/
    );
  });
});
