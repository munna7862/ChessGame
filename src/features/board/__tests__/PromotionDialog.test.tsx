import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PromotionDialog } from "../PromotionDialog";

describe("PromotionDialog Component (Phase 04 · Sprint 05)", () => {
  it("TC-PROM-09: renders all four promotion choices (Queen, Rook, Bishop, Knight) with piece graphics", () => {
    const handleSelect = vi.fn();
    const handleCancel = vi.fn();

    render(
      <PromotionDialog
        color="w"
        targetSquare="e8"
        onSelect={handleSelect}
        onCancel={handleCancel}
      />
    );

    expect(screen.getByTestId("promotion-dialog")).toBeInTheDocument();
    expect(screen.getByTestId("promotion-choice-q")).toBeInTheDocument();
    expect(screen.getByTestId("promotion-choice-r")).toBeInTheDocument();
    expect(screen.getByTestId("promotion-choice-b")).toBeInTheDocument();
    expect(screen.getByTestId("promotion-choice-n")).toBeInTheDocument();
    expect(screen.getByTestId("promotion-cancel-btn")).toBeInTheDocument();

    // Verify White piece SVGs are rendered
    expect(screen.getByTestId("piece-wq")).toBeInTheDocument();
    expect(screen.getByTestId("piece-wr")).toBeInTheDocument();
    expect(screen.getByTestId("piece-wb")).toBeInTheDocument();
    expect(screen.getByTestId("piece-wn")).toBeInTheDocument();
  });

  it("TC-PROM-09 (Black): renders black piece options when color is 'b'", () => {
    render(
      <PromotionDialog
        color="b"
        targetSquare="a1"
        onSelect={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    expect(screen.getByTestId("piece-bq")).toBeInTheDocument();
    expect(screen.getByTestId("piece-br")).toBeInTheDocument();
    expect(screen.getByTestId("piece-bb")).toBeInTheDocument();
    expect(screen.getByTestId("piece-bn")).toBeInTheDocument();
  });

  it("TC-PROM-10 - TC-PROM-13: clicking each piece choice triggers onSelect with corresponding piece type", () => {
    const handleSelect = vi.fn();
    render(
      <PromotionDialog
        color="w"
        targetSquare="e8"
        onSelect={handleSelect}
        onCancel={vi.fn()}
      />
    );

    // Queen
    fireEvent.click(screen.getByTestId("promotion-choice-q"));
    expect(handleSelect).toHaveBeenCalledWith("q");

    // Rook
    fireEvent.click(screen.getByTestId("promotion-choice-r"));
    expect(handleSelect).toHaveBeenCalledWith("r");

    // Bishop
    fireEvent.click(screen.getByTestId("promotion-choice-b"));
    expect(handleSelect).toHaveBeenCalledWith("b");

    // Knight
    fireEvent.click(screen.getByTestId("promotion-choice-n"));
    expect(handleSelect).toHaveBeenCalledWith("n");
  });

  it("TC-PROM-14: pressing Escape key triggers onCancel", () => {
    const handleCancel = vi.fn();
    render(
      <PromotionDialog
        color="w"
        targetSquare="e8"
        onSelect={vi.fn()}
        onCancel={handleCancel}
      />
    );

    const dialog = screen.getByTestId("promotion-dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(handleCancel).toHaveBeenCalledTimes(1);
  });

  it("TC-PROM-15: clicking backdrop or cancel button triggers onCancel", () => {
    const handleCancel = vi.fn();
    render(
      <PromotionDialog
        color="w"
        targetSquare="e8"
        onSelect={vi.fn()}
        onCancel={handleCancel}
      />
    );

    const cancelBtn = screen.getByTestId("promotion-cancel-btn");
    fireEvent.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalledTimes(1);

    const backdrop = screen.getByTestId("promotion-dialog-backdrop");
    fireEvent.click(backdrop);
    expect(handleCancel).toHaveBeenCalledTimes(2);
  });

  it("TC-PROM-16: keyboard hotkeys (Q, R, B, N and 1, 2, 3, 4) trigger immediate piece selection", () => {
    const handleSelect = vi.fn();
    render(
      <PromotionDialog
        color="w"
        targetSquare="e8"
        onSelect={handleSelect}
        onCancel={vi.fn()}
      />
    );

    const dialog = screen.getByTestId("promotion-dialog");

    // Letter keys
    fireEvent.keyDown(dialog, { key: "q" });
    expect(handleSelect).toHaveBeenCalledWith("q");

    fireEvent.keyDown(dialog, { key: "R" });
    expect(handleSelect).toHaveBeenCalledWith("r");

    fireEvent.keyDown(dialog, { key: "b" });
    expect(handleSelect).toHaveBeenCalledWith("b");

    fireEvent.keyDown(dialog, { key: "N" });
    expect(handleSelect).toHaveBeenCalledWith("n");

    // Number keys
    fireEvent.keyDown(dialog, { key: "1" });
    expect(handleSelect).toHaveBeenCalledWith("q");

    fireEvent.keyDown(dialog, { key: "2" });
    expect(handleSelect).toHaveBeenCalledWith("r");

    fireEvent.keyDown(dialog, { key: "3" });
    expect(handleSelect).toHaveBeenCalledWith("b");

    fireEvent.keyDown(dialog, { key: "4" });
    expect(handleSelect).toHaveBeenCalledWith("n");
  });

  it("TC-PROM-17: arrow keys navigate through options and auto-focuses first option on mount", () => {
    render(
      <PromotionDialog
        color="w"
        targetSquare="d8"
        onSelect={vi.fn()}
        onCancel={vi.fn()}
      />
    );

    const queenBtn = screen.getByTestId("promotion-choice-q");
    const rookBtn = screen.getByTestId("promotion-choice-r");
    const bishopBtn = screen.getByTestId("promotion-choice-b");

    expect(document.activeElement).toBe(queenBtn);

    const dialog = screen.getByTestId("promotion-dialog");

    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(document.activeElement).toBe(rookBtn);

    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(document.activeElement).toBe(bishopBtn);

    fireEvent.keyDown(dialog, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(rookBtn);
  });

  it("TC-PROM-19: disabled state disables all buttons and prevents selection", () => {
    const handleSelect = vi.fn();
    const handleCancel = vi.fn();
    render(
      <PromotionDialog
        color="w"
        targetSquare="e8"
        disabled={true}
        onSelect={handleSelect}
        onCancel={handleCancel}
      />
    );

    const queenBtn = screen.getByTestId("promotion-choice-q");
    expect(queenBtn).toBeDisabled();

    fireEvent.click(queenBtn);
    expect(handleSelect).not.toHaveBeenCalled();

    const dialog = screen.getByTestId("promotion-dialog");
    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(handleCancel).not.toHaveBeenCalled();
  });
});
