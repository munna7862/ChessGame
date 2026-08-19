import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { App } from "../../../App";
import { InMemoryPersistenceAdapter } from "../../../domain/persistence/adapters/InMemoryPersistenceAdapter";
import {
  PersistenceService,
  SettingsService,
} from "../../../domain/persistence";

describe("Phase 09 · Sprint 04: Keyboard Shortcuts Suite (TC-KBD-01 to TC-KBD-08)", () => {
  let persistenceService: PersistenceService;
  let settingsService: SettingsService;

  beforeEach(() => {
    localStorage.clear();
    const memoryAdapter = new InMemoryPersistenceAdapter();
    persistenceService = new PersistenceService({ adapter: memoryAdapter });
    settingsService = new SettingsService({ persistenceService });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("TC-KBD-01: opens New Game modal via Ctrl+N and closes via Escape", () => {
    render(
      <App
        persistenceService={persistenceService}
        settingsService={settingsService}
      />
    );

    expect(screen.queryByTestId("new-game-modal")).not.toBeInTheDocument();

    // Trigger Ctrl+N
    fireEvent.keyDown(window, { key: "n", ctrlKey: true });
    expect(screen.getByTestId("new-game-modal")).toBeInTheDocument();

    // Trigger Escape to dismiss
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByTestId("new-game-modal")).not.toBeInTheDocument();
  });

  it("TC-KBD-02: performs Move Undo via 'u' and Ctrl+Z", () => {
    render(
      <App
        persistenceService={persistenceService}
        settingsService={settingsService}
      />
    );

    // Play move e2-e4
    const e2Square = screen.getByTestId("board-square-e2");
    fireEvent.click(e2Square);
    const e4Square = screen.getByTestId("board-square-e4");
    fireEvent.click(e4Square);

    expect(screen.getByTestId("last-move-indicator")).toHaveTextContent(
      "e2 → e4"
    );

    // Press 'u' to undo
    fireEvent.keyDown(window, { key: "u" });
    expect(screen.queryByTestId("last-move-indicator")).not.toBeInTheDocument();

    // Play move e2-e4 again
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));
    expect(screen.getByTestId("last-move-indicator")).toHaveTextContent(
      "e2 → e4"
    );

    // Press Ctrl+Z to undo
    fireEvent.keyDown(window, { key: "z", ctrlKey: true });
    expect(screen.queryByTestId("last-move-indicator")).not.toBeInTheDocument();
  });

  it("TC-KBD-03: flips board orientation via 'f' and Ctrl+F", () => {
    render(
      <App
        persistenceService={persistenceService}
        settingsService={settingsService}
      />
    );

    const board = screen.getByTestId("chess-board");
    expect(board).toHaveAttribute("data-orientation", "w");

    // Press 'f' to flip
    fireEvent.keyDown(window, { key: "f" });
    expect(board).toHaveAttribute("data-orientation", "b");

    // Press Ctrl+F to flip back
    fireEvent.keyDown(window, { key: "f", ctrlKey: true });
    expect(board).toHaveAttribute("data-orientation", "w");
  });

  it("TC-KBD-04: opens Settings modal via Ctrl+, and closes via Escape", () => {
    render(
      <App
        persistenceService={persistenceService}
        settingsService={settingsService}
      />
    );

    expect(screen.queryByTestId("settings-modal")).not.toBeInTheDocument();

    // Trigger Ctrl+,
    fireEvent.keyDown(window, { key: ",", ctrlKey: true });
    expect(screen.getByTestId("settings-modal")).toBeInTheDocument();

    // Escape to close
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByTestId("settings-modal")).not.toBeInTheDocument();
  });

  it("TC-KBD-05: opens PGN Export and Import modals via Ctrl+E and Ctrl+I", () => {
    render(
      <App
        persistenceService={persistenceService}
        settingsService={settingsService}
      />
    );

    // Ctrl+E -> Export Modal
    fireEvent.keyDown(window, { key: "e", ctrlKey: true });
    expect(screen.getByTestId("pgn-export-modal")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByTestId("pgn-export-modal")).not.toBeInTheDocument();

    // Ctrl+I -> Import Modal
    fireEvent.keyDown(window, { key: "i", ctrlKey: true });
    expect(screen.getByTestId("pgn-import-modal")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByTestId("pgn-import-modal")).not.toBeInTheDocument();
  });

  it("TC-KBD-06: opens Keyboard Shortcuts help modal via '?' and F1", () => {
    render(
      <App
        persistenceService={persistenceService}
        settingsService={settingsService}
      />
    );

    expect(screen.queryByTestId("shortcuts-modal")).not.toBeInTheDocument();

    // Press '?'
    fireEvent.keyDown(window, { key: "?" });
    expect(screen.getByTestId("shortcuts-modal")).toBeInTheDocument();

    // Dismiss with button
    fireEvent.click(screen.getByTestId("btn-close-shortcuts"));
    expect(screen.queryByTestId("shortcuts-modal")).not.toBeInTheDocument();

    // Press F1
    fireEvent.keyDown(window, { key: "F1" });
    expect(screen.getByTestId("shortcuts-modal")).toBeInTheDocument();

    // Dismiss with Escape
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByTestId("shortcuts-modal")).not.toBeInTheDocument();
  });

  it("TC-KBD-07: opens FEN position modal via Ctrl+Shift+F", () => {
    render(
      <App
        persistenceService={persistenceService}
        settingsService={settingsService}
      />
    );

    expect(screen.queryByTestId("fen-modal")).not.toBeInTheDocument();

    // Press Ctrl+Shift+F
    fireEvent.keyDown(window, { key: "F", ctrlKey: true, shiftKey: true });
    expect(screen.getByTestId("fen-modal")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByTestId("fen-modal")).not.toBeInTheDocument();
  });

  it("TC-KBD-08: suppresses single-character game shortcuts when user is typing in text inputs", () => {
    render(
      <App
        persistenceService={persistenceService}
        settingsService={settingsService}
      />
    );

    // Open New Game modal
    fireEvent.click(screen.getByTestId("btn-reset-game"));
    const inputP1 = screen.getByTestId("input-player1-name");

    // Focus input and type 'f' and 'u'
    inputP1.focus();
    fireEvent.change(inputP1, { target: { value: "Full" } });
    fireEvent.keyDown(inputP1, { key: "f" });
    fireEvent.keyDown(inputP1, { key: "u" });

    // Board orientation should still be default 'w' when modal is open and user types
    const board = screen.getByTestId("chess-board");
    expect(board).toHaveAttribute("data-orientation", "w");
  });
});
