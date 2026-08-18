import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MoveHistoryPanel } from "../MoveHistoryPanel";
import type { Move } from "../../../domain/chess/types";
import type { CapturedPieces, PlayerConfig } from "../types";

describe("MoveHistoryPanel Component (TC-HIST-01 to TC-HIST-10, TC-CAPT-01 to TC-CAPT-04)", () => {
  const defaultPlayers: { w: PlayerConfig; b: PlayerConfig } = {
    w: { id: "p1", name: "Magnus", color: "w", type: "human" },
    b: { id: "p2", name: "Hikaru", color: "b", type: "human" },
  };

  const sampleMoves: Move[] = [
    {
      from: "e2",
      to: "e4",
      piece: { type: "p", color: "w" },
      san: "e4",
      lan: "e2e4",
      beforeFen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      afterFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
    },
    {
      from: "e7",
      to: "e5",
      piece: { type: "p", color: "b" },
      san: "e5",
      lan: "e7e5",
      beforeFen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1",
      afterFen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
    },
    {
      from: "g1",
      to: "f3",
      piece: { type: "n", color: "w" },
      san: "Nf3",
      lan: "g1f3",
      beforeFen:
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq e6 0 2",
      afterFen:
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
    },
    {
      from: "b8",
      to: "c6",
      piece: { type: "n", color: "b" },
      san: "Nc6",
      lan: "b8c6",
      beforeFen:
        "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
      afterFen:
        "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
    },
    {
      from: "f1",
      to: "b5",
      piece: { type: "b", color: "w" },
      san: "Bb5",
      lan: "f1b5",
      beforeFen:
        "r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 2 3",
      afterFen:
        "r1bqkbnr/pppp1ppp/2n5/1B2p3/4P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 3 3",
    },
  ];

  it("TC-HIST-05: renders clean empty state when no moves are played", () => {
    render(<MoveHistoryPanel moveHistory={[]} players={defaultPlayers} />);

    expect(screen.getByTestId("move-history-panel")).toBeInTheDocument();
    expect(screen.getByTestId("move-history-empty")).toHaveTextContent(
      "No moves played yet."
    );
    expect(screen.getByTestId("move-count-badge")).toHaveTextContent("0 plies");
  });

  it("TC-HIST-01 & TC-HIST-02: renders SAN move list grouped by move number", () => {
    render(
      <MoveHistoryPanel moveHistory={sampleMoves} players={defaultPlayers} />
    );

    expect(screen.getByTestId("move-count-badge")).toHaveTextContent("5 plies");

    // Row 1: 1. e4 e5
    expect(screen.getByTestId("move-row-1")).toBeInTheDocument();
    expect(screen.getByTestId("move-cell-0")).toHaveTextContent("e4");
    expect(screen.getByTestId("move-cell-1")).toHaveTextContent("e5");

    // Row 2: 2. Nf3 Nc6
    expect(screen.getByTestId("move-row-2")).toBeInTheDocument();
    expect(screen.getByTestId("move-cell-2")).toHaveTextContent("Nf3");
    expect(screen.getByTestId("move-cell-3")).toHaveTextContent("Nc6");

    // Row 3: 3. Bb5 (White only, odd ply)
    expect(screen.getByTestId("move-row-3")).toBeInTheDocument();
    expect(screen.getByTestId("move-cell-4")).toHaveTextContent("Bb5");
    expect(screen.getByTestId("move-cell-empty-3")).toBeInTheDocument();
  });

  it("TC-HIST-04: highlights the active/latest move correctly", () => {
    render(
      <MoveHistoryPanel moveHistory={sampleMoves} players={defaultPlayers} />
    );

    // Latest move is index 4 (Bb5)
    const activeCell = screen.getByTestId("move-cell-4");
    expect(activeCell).toHaveAttribute("data-active", "true");
    expect(activeCell).toHaveClass("move-cell--active");

    // Earlier move is not active
    const earlierCell = screen.getByTestId("move-cell-0");
    expect(earlierCell).toHaveAttribute("data-active", "false");
    expect(earlierCell).not.toHaveClass("move-cell--active");
  });

  it("TC-HIST-06: handles move selection callback with correct ply index", () => {
    const handleSelect = vi.fn();
    render(
      <MoveHistoryPanel
        moveHistory={sampleMoves}
        players={defaultPlayers}
        onSelectMove={handleSelect}
      />
    );

    fireEvent.click(screen.getByTestId("move-cell-2"));
    expect(handleSelect).toHaveBeenCalledWith(2);

    fireEvent.click(screen.getByTestId("move-cell-1"));
    expect(handleSelect).toHaveBeenCalledWith(1);
  });

  it("TC-CAPT-01 to TC-CAPT-04: renders captured piece summary and material differential", () => {
    const captured: CapturedPieces = {
      white: ["q", "p"], // White captured Black's Queen (9) and Pawn (1) = 10 pts
      black: ["r"], // Black captured White's Rook (5) = 5 pts -> White leads by +5
    };

    render(
      <MoveHistoryPanel
        moveHistory={sampleMoves}
        capturedPieces={captured}
        players={defaultPlayers}
      />
    );

    expect(screen.getByTestId("captures-summary")).toBeInTheDocument();
    expect(
      screen.getByTestId("history-captured-w-advantage")
    ).toHaveTextContent("+5");
    expect(screen.queryByTestId("history-captured-b-advantage")).toBeNull();
  });
});
