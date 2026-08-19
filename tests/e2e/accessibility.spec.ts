import { test, expect } from "@playwright/test";

/**
 * Phase 04 & Phase 09: Board Accessibility and Global Keyboard Shortcuts E2E Suite
 * Reference: docs/testing/test_cases_catalog_P09_S04.md (TC-KBD-01 to TC-KBD-08, TC-A11Y-01 to TC-A11Y-06)
 */

test.describe("ChessForge Accessibility & Keyboard Navigation Suite", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TC-A11Y-01: skip-link allows quick keyboard focus to chessboard", async ({
    page,
  }) => {
    const skipLink = page.getByTestId("skip-to-board-link");
    await skipLink.focus();
    await expect(skipLink).toBeVisible();

    await page.keyboard.press("Enter");
    const board = page.getByTestId("chess-board-wrapper");
    await expect(board).toBeVisible();
  });

  test("TC-A11Y-02: roving tabindex allows single tabstop into board grid", async ({
    page,
  }) => {
    // Focus the initial default square e2
    const squareE2 = page.getByTestId("board-square-e2");
    await expect(squareE2).toHaveAttribute("tabindex", "0");

    // Other squares have tabindex -1
    const squareE4 = page.getByTestId("board-square-e4");
    await expect(squareE4).toHaveAttribute("tabindex", "-1");
  });

  test("TC-A11Y-03 & TC-KBD-02: complete keyboard navigation, move execution (e2-e4), and 'u' undo", async ({
    page,
  }) => {
    const squareE2 = page.getByTestId("board-square-e2");
    await squareE2.focus();

    // Select e2 via Enter
    await page.keyboard.press("Enter");
    await expect(squareE2).toHaveAttribute("data-is-selected", "true");

    // Check live announcer text
    const liveAnnouncer = page.getByTestId("board-live-announcer");
    await expect(liveAnnouncer).toContainText("Selected White Pawn on e2");

    // Navigate to e3 (ArrowUp) and then e4 (ArrowUp)
    await page.keyboard.press("ArrowUp");
    const squareE3 = page.getByTestId("board-square-e3");
    await expect(squareE3).toBeFocused();

    await page.keyboard.press("ArrowUp");
    const squareE4 = page.getByTestId("board-square-e4");
    await expect(squareE4).toBeFocused();

    // Commit move via Space key
    await page.keyboard.press("Space");

    // Verify move commit
    await expect(page.getByTestId("turn-indicator")).toContainText(
      "Black to move"
    );
    await expect(squareE4.locator("[data-testid='piece-wp']")).toBeVisible();
    await expect(liveAnnouncer).toContainText("White Pawn moved from e2 to e4");

    // Press 'u' to undo move
    await page.keyboard.press("u");
    await expect(page.getByTestId("turn-indicator")).toContainText(
      "White to move"
    );
  });

  test("TC-KBD-06: '?' opens Keyboard Shortcuts help modal and Escape closes it", async ({
    page,
  }) => {
    await page.keyboard.press("?");
    const shortcutsModal = page.getByTestId("shortcuts-modal");
    await expect(shortcutsModal).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(shortcutsModal).not.toBeVisible();
  });

  test("TC-KBD-04: Ctrl+, opens Settings modal and Escape closes it", async ({
    page,
  }) => {
    await page.keyboard.press("Control+,");
    const settingsModal = page.getByTestId("settings-modal");
    await expect(settingsModal).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(settingsModal).not.toBeVisible();
  });

  test("TC-A11Y-05: Board flip and motion toggles update attributes and announce state", async ({
    page,
  }) => {
    const flipBtn = page.getByTestId("btn-flip-board");
    await flipBtn.click();

    const liveAnnouncer = page.getByTestId("board-live-announcer");
    await expect(liveAnnouncer).toContainText(
      "Board flipped to Black perspective."
    );
    await expect(page.getByTestId("chess-board")).toHaveAttribute(
      "data-orientation",
      "b"
    );

    // Toggle reduced motion
    const motionBtn = page.getByTestId("btn-toggle-motion");
    await motionBtn.click();

    await expect(page.getByTestId("chess-board-wrapper")).toHaveAttribute(
      "data-reduced-motion",
      "true"
    );
  });
});
