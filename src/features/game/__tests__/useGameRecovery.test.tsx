import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGameRecovery } from "../useGameRecovery";
import { GameSessionController } from "../GameSessionController";
import { PersistenceService } from "../../../domain/persistence/PersistenceService";
import { InMemoryPersistenceAdapter } from "../../../domain/persistence/adapters/InMemoryPersistenceAdapter";
import type { PersistedActiveGame } from "../../../domain/persistence/schema";
import type { BoardOrientation } from "../../board/types";
import type { TimeControl } from "../../../domain/clock/types";

describe("useGameRecovery Hook Tests", () => {
  const sampleTimeControl: TimeControl = {
    type: "rapid",
    initialMs: 600000,
    incrementMs: 5000,
    label: "10 min",
  };

  const createMockClock = () => ({
    whiteRemainingMs: 580000,
    blackRemainingMs: 590000,
    isRunning: true,
    timeControl: sampleTimeControl,
    startClock: vi.fn(),
    pauseClock: vi.fn(),
    restoreClock: vi.fn(),
  });

  it("TC-RECOV-10: detects recoverable game on startup and opens recovery modal", () => {
    const adapter = new InMemoryPersistenceAdapter();
    const persistenceService = new PersistenceService({ adapter });

    const savedGame: PersistedActiveGame = {
      id: "recover-1",
      mode: "human_vs_engine",
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
      moveHistorySan: ["e4", "e5"],
      players: {
        w: { id: "p1", name: "Player", color: "w", type: "human" },
        b: {
          id: "p2",
          name: "Engine",
          color: "b",
          type: "engine",
          difficulty: 4,
        },
      },
      clock: {
        whiteMs: 580000,
        blackMs: 590000,
        timeControl: sampleTimeControl,
      },
      userOrientation: "w",
      startedAt: 1000,
      updatedAt: 2000,
    };

    persistenceService.saveActiveGame(savedGame);

    const controller = new GameSessionController();
    const mockClock = createMockClock();
    let orientation: BoardOrientation = "w";
    const setOrientation = (o: BoardOrientation) => {
      orientation = o;
    };

    const { result } = renderHook(() =>
      useGameRecovery({
        persistenceService,
        sessionController: controller,
        sessionState: controller.getState(),
        clock: mockClock,
        orientation,
        setOrientation,
      })
    );

    expect(result.current.isRecoveryModalOpen).toBe(true);
    expect(result.current.recoverableGame).not.toBeNull();
    expect(result.current.recoverableGame?.players.b.name).toBe("Engine");
  });

  it("TC-RECOV-11: does not prompt recovery when storage has no active game or initial state", () => {
    const adapter = new InMemoryPersistenceAdapter();
    const persistenceService = new PersistenceService({ adapter });
    const controller = new GameSessionController();
    const mockClock = createMockClock();

    const { result } = renderHook(() =>
      useGameRecovery({
        persistenceService,
        sessionController: controller,
        sessionState: controller.getState(),
        clock: mockClock,
        orientation: "w",
        setOrientation: vi.fn(),
      })
    );

    expect(result.current.isRecoveryModalOpen).toBe(false);
    expect(result.current.recoverableGame).toBeNull();
  });

  it("TC-RECOV-12: purges stale/completed games and does not show recovery modal", () => {
    const adapter = new InMemoryPersistenceAdapter();
    const persistenceService = new PersistenceService({ adapter });

    // Scholar's Mate checkmate position (isOver === true)
    const checkmatedGame: PersistedActiveGame = {
      id: "recover-ended",
      mode: "human_vs_human",
      fen: "r1bqkb1r/pppp1Qpp/2n5/4p3/2B1n3/8/PPPP1PPP/RNB1K1NR b KQkq - 0 4",
      moveHistorySan: ["e4", "e5", "Bc4", "Nc6", "Qh5", "Nf6", "Qxf7#"],
      players: {
        w: { id: "p1", name: "White", color: "w", type: "human" },
        b: { id: "p2", name: "Black", color: "b", type: "human" },
      },
      userOrientation: "w",
      startedAt: 1000,
      updatedAt: 2000,
    };

    persistenceService.saveActiveGame(checkmatedGame);

    const controller = new GameSessionController();
    const mockClock = createMockClock();

    const { result } = renderHook(() =>
      useGameRecovery({
        persistenceService,
        sessionController: controller,
        sessionState: controller.getState(),
        clock: mockClock,
        orientation: "w",
        setOrientation: vi.fn(),
      })
    );

    expect(result.current.isRecoveryModalOpen).toBe(false);
    expect(result.current.recoverableGame).toBeNull();

    // Stale game should be purged from storage
    const loaded = persistenceService.load();
    expect(loaded.success).toBe(true);
    if (loaded.success) {
      expect(loaded.data?.activeGame).toBeNull();
    }
  });

  it("TC-RECOV-14: continuing game restores session, clock, orientation, and closes modal", () => {
    const adapter = new InMemoryPersistenceAdapter();
    const persistenceService = new PersistenceService({ adapter });

    const savedGame: PersistedActiveGame = {
      id: "recover-continue",
      mode: "human_vs_engine",
      fen: "rnbqkbnr/pppp1ppp/8/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R b KQkq - 1 2",
      moveHistorySan: ["e4", "e5", "Nf3"],
      players: {
        w: { id: "p1", name: "Alice", color: "w", type: "human" },
        b: {
          id: "p2",
          name: "Engine 5",
          color: "b",
          type: "engine",
          difficulty: 5,
        },
      },
      clock: {
        whiteMs: 540000,
        blackMs: 560000,
        timeControl: sampleTimeControl,
      },
      userOrientation: "b",
      startedAt: 1000,
      updatedAt: 2000,
    };

    persistenceService.saveActiveGame(savedGame);

    const controller = new GameSessionController();
    const mockClock = createMockClock();
    let orientation: BoardOrientation = "w";
    const setOrientation = (o: BoardOrientation) => {
      orientation = o;
    };
    const onGameRestored = vi.fn();

    const { result } = renderHook(() =>
      useGameRecovery({
        persistenceService,
        sessionController: controller,
        sessionState: controller.getState(),
        clock: mockClock,
        orientation,
        setOrientation,
        onGameRestored,
      })
    );

    expect(result.current.isRecoveryModalOpen).toBe(true);

    act(() => {
      const success = result.current.continueGame();
      expect(success).toBe(true);
    });

    expect(result.current.isRecoveryModalOpen).toBe(false);
    expect(controller.getState().moveHistory.map((m) => m.san)).toEqual([
      "e4",
      "e5",
      "Nf3",
    ]);
    expect(controller.getState().players.b.name).toBe("Engine 5");
    expect(mockClock.restoreClock).toHaveBeenCalledWith(
      sampleTimeControl,
      540000,
      560000,
      "b"
    );
    expect(orientation).toBe("b");
    expect(onGameRestored).toHaveBeenCalledWith(savedGame);
  });

  it("TC-RECOV-15: discarding game purges recovery state and keeps clean game", () => {
    const adapter = new InMemoryPersistenceAdapter();
    const persistenceService = new PersistenceService({ adapter });

    const savedGame: PersistedActiveGame = {
      id: "recover-discard",
      mode: "human_vs_human",
      fen: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
      moveHistorySan: ["e4"],
      players: {
        w: { id: "p1", name: "White", color: "w", type: "human" },
        b: { id: "p2", name: "Black", color: "b", type: "human" },
      },
      userOrientation: "w",
      startedAt: 1000,
      updatedAt: 2000,
    };

    persistenceService.saveActiveGame(savedGame);

    const controller = new GameSessionController();
    const mockClock = createMockClock();

    const { result } = renderHook(() =>
      useGameRecovery({
        persistenceService,
        sessionController: controller,
        sessionState: controller.getState(),
        clock: mockClock,
        orientation: "w",
        setOrientation: vi.fn(),
      })
    );

    expect(result.current.isRecoveryModalOpen).toBe(true);

    act(() => {
      result.current.discardGame();
    });

    expect(result.current.isRecoveryModalOpen).toBe(false);
    expect(result.current.recoverableGame).toBeNull();
    const finalLoaded = persistenceService.load();
    expect(finalLoaded.success).toBe(true);
    if (finalLoaded.success) {
      expect(finalLoaded.data?.activeGame).toBeNull();
    }
  });
});
