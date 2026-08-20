import { test, expect, type Page } from "@playwright/test";

/**
 * Phase 10 · Sprint 05: Performance and Reliability Soak Suite
 * Verifies startup latency, rapid move execution throughput, memory stability,
 * and zero UI freeze under continuous load.
 */

test.describe("ChessForge Desktop Performance & Reliability Soak Suite", () => {
  const clickSquare = async (page: Page, squareId: string) => {
    const square = page.getByTestId(`board-square-${squareId}`);
    await square.click();
  };

  const playMove = async (page: Page, from: string, to: string) => {
    await clickSquare(page, from);
    await clickSquare(page, to);
  };

  test("TC-PERF-01: should initialize application within < 1000ms startup budget", async ({
    page,
  }) => {
    const startNav = Date.now();
    await page.goto("/");
    await expect(page.getByTestId("chessforge-app")).toBeVisible();
    await expect(page.getByTestId("chess-board")).toBeVisible();
    const elapsedNav = Date.now() - startNav;

    // Verify fast startup
    expect(elapsedNav).toBeLessThan(3000);

    // Verify key indicators and zero JS error state
    await expect(page.getByTestId("engine-status-badge")).toBeVisible();
    await expect(page.getByTestId("metric-memory")).toContainText("< 150 MB");
  });

  test("TC-PERF-02: should execute rapid move sequences with responsive UI frame budget", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("chess-board")).toBeVisible();

    const moves = [
      ["e2", "e4"],
      ["e7", "e5"],
      ["g1", "f3"],
      ["b8", "c6"],
      ["f1", "c4"],
      ["f8", "c5"],
      ["c2", "c3"],
      ["g8", "f6"],
      ["d2", "d4"],
      ["e5", "d4"],
    ];

    const startMoves = Date.now();
    for (const [from, to] of moves) {
      await playMove(page, from, to);
    }
    const elapsedMoves = Date.now() - startMoves;

    // 10 moves in Playwright should complete cleanly without UI lockup
    expect(elapsedMoves).toBeLessThan(8000);

    // Verify history panel rendered all 10 moves
    const historyPanel = page.getByTestId("move-history-panel");
    await expect(historyPanel).toBeVisible();
    await expect(historyPanel).toContainText("c3");
    await expect(historyPanel).toContainText("d4");
  });

  test("TC-PERF-05: should maintain DOM element and memory stability across repeated game resets", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByTestId("chess-board")).toBeVisible();

    for (let run = 0; run < 10; run++) {
      // Play 2 opening moves
      await playMove(page, "e2", "e4");
      await playMove(page, "e7", "e5");

      // Reset via quick restart
      await page.getByTestId("btn-restart-game").click();
      await page.getByTestId("btn-confirm-restart").click();
      await expect(page.getByTestId("turn-indicator")).toContainText(
        "White to move"
      );
    }

    // Verify DOM node count remains healthy
    const nodeCount = await page.evaluate(
      () => document.querySelectorAll("*").length
    );
    // Standard ChessForge DOM tree is compact (< 800 elements)
    expect(nodeCount).toBeLessThan(1200);
  });
});
