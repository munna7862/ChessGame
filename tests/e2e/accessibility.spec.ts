import { test, expect } from "@playwright/test";

/**
 * Phase 04 · Sprint 06: Board Accessibility and Visual States E2E Suite
 * Reference: docs/testing/test_cases_catalog_P04_S06.md (TC-A11Y-01 to TC-A11Y-21)
 */

test.describe("ChessForge Board Accessibility & Keyboard Navigation (Phase 04 · Sprint 06)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("TC-A11Y-01: roving tabindex allows single tabstop into board grid", async ({
    page,
  }) => {
    // Focus the initial default square e2
    const squareE2 = page.getByTestId("board-square-e2");
    await expect(squareE2).toHaveAttribute("tabindex", "0");

    // Other squares have tabindex -1
    const squareE4 = page.getByTestId("board-square-e4");
    await expect(squareE4).toHaveAttribute("tabindex", "-1");
  });

  test("TC-A11Y-02 & TC-A11Y-10: complete keyboard navigation and move execution (e2-e4)", async ({
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
  });

  test("TC-A11Y-11: Escape key cancels active piece selection", async ({
    page,
  }) => {
    const squareE2 = page.getByTestId("board-square-e2");
    await squareE2.focus();
    await page.keyboard.press("Enter");
    await expect(squareE2).toHaveAttribute("data-is-selected", "true");

    // Press Escape
    await page.keyboard.press("Escape");
    await expect(squareE2).not.toHaveAttribute("data-is-selected", "true");
    await expect(page.getByTestId("board-live-announcer")).toContainText(
      "Selection cleared."
    );
  });

  test("TC-A11Y-16 & TC-A11Y-20: Board flip and motion toggles update attributes and announce state", async ({
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
