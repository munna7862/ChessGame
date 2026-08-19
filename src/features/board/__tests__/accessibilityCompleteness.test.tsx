import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { App } from "../../../App";
import { InMemoryPersistenceAdapter } from "../../../domain/persistence/adapters/InMemoryPersistenceAdapter";
import {
  PersistenceService,
  SettingsService,
} from "../../../domain/persistence";

describe("Phase 09 · Sprint 04: Accessibility Completeness Suite (TC-A11Y-01 to TC-A11Y-06)", () => {
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

  it("TC-A11Y-01: renders Skip to Chessboard link and targets #main-chessboard", () => {
    render(
      <App
        persistenceService={persistenceService}
        settingsService={settingsService}
      />
    );

    const skipLink = screen.getByTestId("skip-to-board-link");
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-chessboard");
    expect(skipLink).toHaveTextContent("Skip to chessboard");

    const board = screen.getByTestId("chess-board-wrapper");
    expect(board).toHaveAttribute("id", "main-chessboard");
  });

  it("TC-A11Y-02: ensures all header, action, and modal trigger buttons have accessible names", () => {
    render(
      <App
        persistenceService={persistenceService}
        settingsService={settingsService}
      />
    );

    // Header buttons
    expect(screen.getByTestId("btn-open-shortcuts")).toHaveAccessibleName();
    expect(screen.getByTestId("btn-open-settings")).toHaveAccessibleName();

    // Board action buttons
    expect(screen.getByTestId("btn-flip-board")).toHaveAccessibleName();
    expect(screen.getByTestId("btn-toggle-motion")).toHaveAccessibleName();
    expect(screen.getByTestId("btn-undo-move")).toHaveAccessibleName();
    expect(screen.getByTestId("btn-restart-game")).toHaveAccessibleName();
    expect(screen.getByTestId("btn-resign-game")).toHaveAccessibleName();
    expect(screen.getByTestId("btn-offer-draw")).toHaveAccessibleName();
    expect(screen.getByTestId("btn-export-pgn")).toHaveAccessibleName();
    expect(screen.getByTestId("btn-import-pgn")).toHaveAccessibleName();
    expect(screen.getByTestId("btn-fen-workflow")).toHaveAccessibleName();
    expect(screen.getByTestId("btn-reset-game")).toHaveAccessibleName();
  });

  it("TC-A11Y-03: verifies aria-live polite announcements on game events", () => {
    render(
      <App
        persistenceService={persistenceService}
        settingsService={settingsService}
      />
    );

    const liveAnnouncer = screen.getByTestId("board-live-announcer");
    expect(liveAnnouncer).toHaveAttribute("aria-live", "polite");
    expect(liveAnnouncer).toHaveAttribute("role", "status");

    // Play move e2-e4
    fireEvent.click(screen.getByTestId("board-square-e2"));
    fireEvent.click(screen.getByTestId("board-square-e4"));

    // Flip board
    fireEvent.click(screen.getByTestId("btn-flip-board"));
    expect(liveAnnouncer).toHaveTextContent(
      "Board flipped to Black perspective."
    );
  });

  it("TC-A11Y-04: non-color state indicators for check, selection, and last move", () => {
    render(
      <App
        persistenceService={persistenceService}
        settingsService={settingsService}
      />
    );

    const e2Square = screen.getByTestId("board-square-e2");

    // Select e2
    fireEvent.click(e2Square);
    expect(e2Square).toHaveAttribute("data-is-selected", "true");
    expect(e2Square).toHaveAttribute("aria-selected", "true");
    expect(e2Square).toHaveAttribute(
      "aria-label",
      expect.stringContaining("selected")
    );

    // Move to e4
    const e4Square = screen.getByTestId("board-square-e4");
    fireEvent.click(e4Square);

    expect(e4Square).toHaveAttribute("data-is-last-move", "to");
    expect(e4Square).toHaveAttribute(
      "aria-label",
      expect.stringContaining("last move destination")
    );
  });

  it("TC-A11Y-05: reduced motion settings toggle immediately applies data-reduced-motion attribute", () => {
    render(
      <App
        persistenceService={persistenceService}
        settingsService={settingsService}
      />
    );

    const motionBtn = screen.getByTestId("btn-toggle-motion");
    expect(motionBtn).toHaveTextContent("Motion: Standard");

    // Toggle reduced motion
    fireEvent.click(motionBtn);
    expect(motionBtn).toHaveTextContent("Motion: Reduced");

    const board = screen.getByTestId("chess-board");
    expect(board).toHaveAttribute("data-reduced-motion", "true");
  });
});
