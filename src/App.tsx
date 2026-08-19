import React, { useState, useEffect, useCallback, useRef } from "react";
import type { Color } from "./domain/chess/types";
import type { TimeProvider } from "./domain/clock/types";
import { PersistenceService } from "./domain/persistence/PersistenceService";
import { Header } from "./components/Header";
import { ConfirmationModal } from "./components/ConfirmationModal";
import { Board } from "./features/board/Board";
import type { BoardOrientation } from "./features/board/types";
import { useBoardInteraction } from "./features/board/useBoardInteraction";
import { useReducedMotion } from "./features/board/useReducedMotion";
import { useEngineOpponent, EngineErrorBanner } from "./features/engine";
import { useClock } from "./features/clock";
import {
  useGameSession,
  useGameRecovery,
  PlayerPanel,
  NewGameModal,
  MoveHistoryPanel,
  GameResultModal,
  GameRecoveryModal,
  calculateMaterialAdvantage,
  type ResolvedNewGameSession,
} from "./features/game";
import "./App.css";

export interface AppProps {
  readonly timeProvider?: TimeProvider | undefined;
  readonly persistenceService?: PersistenceService | undefined;
}

export const App: React.FC<AppProps> = ({
  timeProvider,
  persistenceService,
}) => {
  const [defaultPersistenceService] = useState(() => new PersistenceService());
  const activePersistenceService =
    persistenceService ?? defaultPersistenceService;

  const {
    sessionState,
    sessionController,
    chessGame,
    resetGame,
    undoMove,
    resign,
    agreeDraw,
  } = useGameSession();

  const [orientation, setOrientation] = useState<BoardOrientation>("w");
  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState<boolean>(false);
  const [isRestartModalOpen, setIsRestartModalOpen] = useState<boolean>(false);
  const [isResignModalOpen, setIsResignModalOpen] = useState<boolean>(false);
  const [isDrawOfferModalOpen, setIsDrawOfferModalOpen] =
    useState<boolean>(false);
  const [hasDismissedResultModal, setHasDismissedResultModal] =
    useState<boolean>(false);
  const { prefersReducedMotion, toggleReducedMotion } = useReducedMotion();

  const cancelThinkingRef = useRef<() => Promise<void>>(() =>
    Promise.resolve()
  );
  const handlePromotionCancelRef = useRef<() => void>(() => {});
  const clearSelectionRef = useRef<(focusBoard?: boolean) => void>(() => {});
  const setAnnouncementRef = useRef<(text: string) => void>(() => {});

  // Handle clock flag fall timeout
  const handleClockTimeout = useCallback(
    (timedOutColor: Color) => {
      if (!sessionState.isGameOver) {
        void cancelThinkingRef.current();
        const res = sessionController.timeout(timedOutColor);
        if (res.success) {
          handlePromotionCancelRef.current();
          clearSelectionRef.current(false);
          const loserName =
            timedOutColor === "w"
              ? sessionState.players.w.name
              : sessionState.players.b.name;
          const winnerName =
            timedOutColor === "w"
              ? sessionState.players.b.name
              : sessionState.players.w.name;
          setAnnouncementRef.current(
            `${loserName} ran out of time. ${winnerName} wins by timeout.`
          );
        }
      }
    },
    [sessionState.isGameOver, sessionState.players, sessionController]
  );

  const clock = useClock({
    timeControl: sessionState.timeControl,
    timeProvider,
    onTimeout: handleClockTimeout,
  });

  const engineClockRemainingMs =
    sessionState.turn === "w" ? clock.whiteRemainingMs : clock.blackRemainingMs;

  const {
    isEngineThinking,
    isEngineTurn,
    cancelThinking,
    engineError,
    restartEngine,
    continueAsTwoPlayers,
    clearError,
  } = useEngineOpponent({
    sessionController,
    sessionState,
    clockRemainingMs: engineClockRemainingMs,
    clockIncrementMs: sessionState.timeControl?.incrementMs,
  });

  useEffect(() => {
    cancelThinkingRef.current = cancelThinking;
  }, [cancelThinking]);

  const isInputDisabled =
    sessionState.isGameOver || isEngineThinking || isEngineTurn;

  const {
    selectedSquare,
    focusedSquare,
    legalDestinations,
    lastMove,
    checkSquare,
    isCheckmate,
    isGameOver,
    gameStatus,
    pendingPromotion,
    announcement,
    setAnnouncement,
    clearSelection,
    handleSquareClick,
    handlePromotionSelect,
    handlePromotionCancel,
    setLastMove,
    resetLastMove,
  } = useBoardInteraction({
    game: chessGame,
    disabled: isInputDisabled,
  });

  useEffect(() => {
    handlePromotionCancelRef.current = handlePromotionCancel;
    clearSelectionRef.current = clearSelection;
    setAnnouncementRef.current = setAnnouncement;
  }, [handlePromotionCancel, clearSelection, setAnnouncement]);

  // Keep clock running and synced with move history
  const prevMoveCountRef = useRef<number>(sessionState.moveHistory.length);
  useEffect(() => {
    const currentCount = sessionState.moveHistory.length;
    const prevCount = prevMoveCountRef.current;
    prevMoveCountRef.current = currentCount;

    if (sessionState.isGameOver) {
      clock.pauseClock();
      return;
    }

    if (currentCount > prevCount) {
      if (!clock.isRunning && clock.timeControl.type !== "none") {
        clock.startClock(sessionState.turn);
      } else if (clock.isRunning) {
        clock.switchTurn();
      }
    } else if (currentCount === 0 && prevCount > 0) {
      clock.resetClock(sessionState.timeControl);
    }
  }, [
    sessionState.moveHistory.length,
    sessionState.isGameOver,
    sessionState.turn,
    sessionState.timeControl,
    clock,
  ]);

  // Automatically keep lastMove in sync with authoritative session move history
  useEffect(() => {
    const history = sessionState.moveHistory;
    const last = history[history.length - 1];
    if (last) {
      setLastMove({
        from: last.from,
        to: last.to,
        isCapture: Boolean(last.captured || last.isEnPassant),
        san: last.san,
      });
    } else {
      resetLastMove();
    }
  }, [sessionState.moveHistory, setLastMove, resetLastMove]);

  const {
    isRecoveryModalOpen,
    recoverableGame,
    continueGame,
    discardGame,
    dismissModal: dismissRecoveryModal,
  } = useGameRecovery({
    persistenceService: activePersistenceService,
    sessionController,
    sessionState,
    clock,
    orientation,
    setOrientation,
    onGameRestored: (restoredSnapshot) => {
      handlePromotionCancel();
      clearSelection(false);
      resetLastMove();
      setIsDrawOfferModalOpen(false);
      setHasDismissedResultModal(false);
      setAnnouncement(
        `Previous game resumed: ${restoredSnapshot.players.w.name} vs ${restoredSnapshot.players.b.name}.`
      );
    },
  });

  const position = sessionState.position;
  const isResultModalOpen = sessionState.isGameOver && !hasDismissedResultModal;

  const toggleOrientation = () => {
    setOrientation((prev) => {
      const next = prev === "w" ? "b" : "w";
      setAnnouncement(
        `Board flipped to ${next === "w" ? "White" : "Black"} perspective.`
      );
      return next;
    });
  };

  const handleOpenNewGame = () => {
    setIsNewGameModalOpen(true);
  };

  const handleCloseNewGame = () => {
    setIsNewGameModalOpen(false);
  };

  const handleStartNewGame = (resolved: ResolvedNewGameSession) => {
    void cancelThinking();
    resetGame(resolved.config);
    clock.resetClock(resolved.config.timeControl);
    handlePromotionCancel();
    clearSelection(false);
    resetLastMove();
    setIsDrawOfferModalOpen(false);
    setHasDismissedResultModal(false);
    setOrientation(resolved.userOrientation);
    setAnnouncement(
      `New game started: ${resolved.config.players?.w.name ?? "White"} vs ${
        resolved.config.players?.b.name ?? "Black"
      }.`
    );
  };

  const handleUndo = () => {
    if (sessionState.moveHistory.length === 0 || sessionState.isGameOver) {
      return;
    }

    if (isEngineThinking) {
      void cancelThinking();
      const res = undoMove();
      if (res.success) {
        handlePromotionCancel();
        clearSelection(false);
        setAnnouncement("Move undone. Position restored.");
      }
      return;
    }

    if (
      sessionState.mode === "human_vs_engine" &&
      sessionState.moveHistory.length >= 2
    ) {
      // Undo both the computer's response and the human's move
      undoMove();
      const res = undoMove();
      if (res.success) {
        handlePromotionCancel();
        clearSelection(false);
        setAnnouncement("Move undone. Position restored.");
      }
    } else {
      const res = undoMove();
      if (res.success) {
        handlePromotionCancel();
        clearSelection(false);
        setAnnouncement("Move undone. Position restored.");
      }
    }
  };

  const handleConfirmRestart = () => {
    void cancelThinking();
    resetGame({
      mode: sessionState.mode,
      players: sessionState.players,
      timeControl: sessionState.timeControl,
    });
    clock.resetClock(sessionState.timeControl);
    handlePromotionCancel();
    clearSelection(false);
    resetLastMove();
    setIsRestartModalOpen(false);
    setIsDrawOfferModalOpen(false);
    setHasDismissedResultModal(false);
    setAnnouncement("Game restarted to initial position.");
  };

  const handleConfirmResign = () => {
    if (sessionState.isGameOver) return;
    void cancelThinking();
    const resigningColor = sessionState.turn;
    const res = resign(resigningColor);
    if (res.success) {
      handlePromotionCancel();
      clearSelection(false);
      setIsResignModalOpen(false);
      const resigningName =
        resigningColor === "w"
          ? sessionState.players.w.name
          : sessionState.players.b.name;
      const winningName =
        resigningColor === "w"
          ? sessionState.players.b.name
          : sessionState.players.w.name;
      setAnnouncement(
        `${resigningName} resigned. ${winningName} wins the game.`
      );
    }
  };

  const handleOfferDraw = () => {
    if (sessionState.isGameOver) return;
    setIsDrawOfferModalOpen(true);
  };

  const handleAcceptDraw = () => {
    if (sessionState.isGameOver) return;
    const res = agreeDraw();
    if (res.success) {
      handlePromotionCancel();
      clearSelection(false);
      setIsDrawOfferModalOpen(false);
      setHasDismissedResultModal(false);
      setAnnouncement("Draw agreed by mutual consent.");
    }
  };

  const handleDeclineDraw = () => {
    setIsDrawOfferModalOpen(false);
    const opponentName =
      sessionState.turn === "w"
        ? sessionState.players.b.name
        : sessionState.players.w.name;
    setAnnouncement(`${opponentName} declined the draw offer.`);
  };

  const turnLabel = isEngineThinking
    ? `${sessionState.players[position.turn].name} is thinking...`
    : position.turn === "w"
      ? "White to move"
      : "Black to move";

  const topPlayer =
    orientation === "w" ? sessionState.players.b : sessionState.players.w;
  const bottomPlayer =
    orientation === "w" ? sessionState.players.w : sessionState.players.b;

  const topPlayerCaptures =
    orientation === "w"
      ? sessionState.capturedPieces.black
      : sessionState.capturedPieces.white;
  const bottomPlayerCaptures =
    orientation === "w"
      ? sessionState.capturedPieces.white
      : sessionState.capturedPieces.black;

  const materialBalance = calculateMaterialAdvantage(
    sessionState.capturedPieces
  );
  const topMaterialAdvantage =
    topPlayer.color === materialBalance.leader
      ? materialBalance.diff
      : undefined;
  const bottomMaterialAdvantage =
    bottomPlayer.color === materialBalance.leader
      ? materialBalance.diff
      : undefined;

  const activeResigningPlayer =
    sessionState.turn === "w"
      ? sessionState.players.w.name
      : sessionState.players.b.name;
  const activeWinningPlayer =
    sessionState.turn === "w"
      ? sessionState.players.b.name
      : sessionState.players.w.name;
  const resigningColorLabel = sessionState.turn === "w" ? "White" : "Black";

  const offeringPlayerName =
    sessionState.turn === "w"
      ? sessionState.players.w.name
      : sessionState.players.b.name;
  const targetPlayerName =
    sessionState.turn === "w"
      ? sessionState.players.b.name
      : sessionState.players.w.name;
  const offeringColorLabel = sessionState.turn === "w" ? "White" : "Black";

  return (
    <div className="app-container" data-testid="chessforge-app">
      <Header />
      <main className="main-content">
        <div className="board-section" data-testid="board-section">
          {engineError && (
            <EngineErrorBanner
              error={engineError}
              onRestart={restartEngine}
              onFallback2P={continueAsTwoPlayers}
              onDismiss={clearError}
            />
          )}

          <div className="board-status-bar" data-testid="board-status-bar">
            <div className="status-group">
              <span
                className="turn-badge"
                data-testid="turn-indicator"
                data-turn={position.turn}
              >
                {turnLabel}
              </span>
              {gameStatus.isCheck &&
                gameStatus.state !== "checkmate" &&
                !gameStatus.isOver && (
                  <span className="check-badge" data-testid="check-indicator">
                    Check!
                  </span>
                )}
              {gameStatus.state === "checkmate" && (
                <span className="check-badge" data-testid="checkmate-indicator">
                  Checkmate! {gameStatus.winner === "w" ? "White" : "Black"}{" "}
                  wins
                </span>
              )}
              {gameStatus.state === "resigned" && (
                <span
                  className="check-badge"
                  data-testid="resignation-indicator"
                >
                  {gameStatus.winner === "w"
                    ? sessionState.players.b.name
                    : sessionState.players.w.name}{" "}
                  Resigned ·{" "}
                  {gameStatus.winner === "w"
                    ? sessionState.players.w.name
                    : sessionState.players.b.name}{" "}
                  Wins
                </span>
              )}
              {gameStatus.inDraw && (
                <span className="check-badge" data-testid="draw-indicator">
                  Draw ({gameStatus.drawReason ?? "draw"})
                </span>
              )}
            </div>

            <div className="status-group">
              {lastMove && (
                <span
                  className="last-move-indicator"
                  data-testid="last-move-indicator"
                >
                  Last: {lastMove.from} → {lastMove.to}
                  {lastMove.san ? ` (${lastMove.san})` : ""}
                </span>
              )}

              {selectedSquare && (
                <span
                  className="selected-square-indicator"
                  data-testid="selected-square-indicator"
                >
                  Selected: {selectedSquare} ({legalDestinations.size} moves)
                </span>
              )}
            </div>
          </div>

          <PlayerPanel
            player={topPlayer}
            isTurn={
              sessionState.turn === topPlayer.color && !sessionState.isGameOver
            }
            isThinking={
              isEngineThinking &&
              sessionState.turn === topPlayer.color &&
              !sessionState.isGameOver
            }
            isCheck={
              sessionState.isCheck &&
              sessionState.turn === topPlayer.color &&
              !sessionState.isGameOver
            }
            capturedPieces={topPlayerCaptures}
            materialAdvantage={topMaterialAdvantage}
            position="top"
            timeRemainingMs={
              topPlayer.color === "w"
                ? clock.whiteRemainingMs
                : clock.blackRemainingMs
            }
            isClockActive={
              clock.isRunning &&
              sessionState.turn === topPlayer.color &&
              !sessionState.isGameOver
            }
            timeControl={clock.timeControl}
            isGameOver={sessionState.isGameOver}
          />

          <Board
            orientation={orientation}
            position={position}
            selectedSquare={selectedSquare}
            focusedSquare={focusedSquare}
            legalDestinations={legalDestinations}
            lastMove={lastMove}
            checkSquare={checkSquare}
            isCheckmate={isCheckmate}
            pendingPromotion={pendingPromotion}
            onPromotionSelect={handlePromotionSelect}
            onPromotionCancel={handlePromotionCancel}
            onClearSelection={clearSelection}
            announcement={announcement}
            reducedMotion={prefersReducedMotion}
            disabled={isGameOver || isInputDisabled}
            onSquareClick={handleSquareClick}
          />

          <PlayerPanel
            player={bottomPlayer}
            isTurn={
              sessionState.turn === bottomPlayer.color &&
              !sessionState.isGameOver
            }
            isThinking={
              isEngineThinking &&
              sessionState.turn === bottomPlayer.color &&
              !sessionState.isGameOver
            }
            isCheck={
              sessionState.isCheck &&
              sessionState.turn === bottomPlayer.color &&
              !sessionState.isGameOver
            }
            capturedPieces={bottomPlayerCaptures}
            materialAdvantage={bottomMaterialAdvantage}
            position="bottom"
            timeRemainingMs={
              bottomPlayer.color === "w"
                ? clock.whiteRemainingMs
                : clock.blackRemainingMs
            }
            isClockActive={
              clock.isRunning &&
              sessionState.turn === bottomPlayer.color &&
              !sessionState.isGameOver
            }
            timeControl={clock.timeControl}
            isGameOver={sessionState.isGameOver}
          />

          <div className="board-controls" data-testid="board-controls">
            <button
              type="button"
              className="btn-control"
              data-testid="btn-flip-board"
              onClick={toggleOrientation}
            >
              Flip Board ({orientation === "w" ? "White" : "Black"})
            </button>
            <button
              type="button"
              className="btn-control"
              data-testid="btn-toggle-motion"
              onClick={toggleReducedMotion}
              aria-pressed={prefersReducedMotion}
            >
              Motion: {prefersReducedMotion ? "Reduced" : "Standard"}
            </button>
            <button
              type="button"
              className="btn-control"
              data-testid="btn-undo-move"
              onClick={handleUndo}
              disabled={
                sessionState.moveHistory.length === 0 || sessionState.isGameOver
              }
              title={
                sessionState.isGameOver
                  ? "Cannot undo: game has concluded"
                  : "Undo last move"
              }
            >
              Undo
            </button>
            <button
              type="button"
              className="btn-control btn-control--warning"
              data-testid="btn-restart-game"
              onClick={() => setIsRestartModalOpen(true)}
              title="Restart game to initial position"
            >
              Restart
            </button>
            <button
              type="button"
              className="btn-control btn-control--danger"
              data-testid="btn-resign-game"
              onClick={() => setIsResignModalOpen(true)}
              disabled={sessionState.isGameOver}
              title={
                sessionState.isGameOver
                  ? "Game already concluded"
                  : `Resign as ${activeResigningPlayer}`
              }
            >
              Resign
            </button>
            <button
              type="button"
              className="btn-control"
              data-testid="btn-offer-draw"
              onClick={handleOfferDraw}
              disabled={sessionState.isGameOver}
              title={
                sessionState.isGameOver
                  ? "Game already concluded"
                  : `Offer draw to ${targetPlayerName}`
              }
            >
              Offer Draw
            </button>
            {sessionState.isGameOver && (
              <button
                type="button"
                className="btn-control btn-control--accent"
                data-testid="btn-view-result"
                onClick={() => setHasDismissedResultModal(false)}
                title="View game result summary"
              >
                View Result
              </button>
            )}
            <button
              type="button"
              className="btn-control"
              data-testid="btn-reset-game"
              onClick={handleOpenNewGame}
            >
              New Game
            </button>
          </div>
        </div>

        <div className="sidebar-section" data-testid="sidebar-section">
          <MoveHistoryPanel
            moveHistory={sessionState.moveHistory}
            capturedPieces={sessionState.capturedPieces}
            players={sessionState.players}
          />

          <div className="hero-card">
            <h1 className="hero-title" data-testid="app-title">
              ChessForge
            </h1>
            <p className="hero-subtitle" data-testid="hero-subtitle">
              A high-performance, local-first chess desktop application
              engineered with Tauri v2, React 19, and Stockfish WASM.
            </p>

            <div className="metrics-grid" data-testid="metrics-grid">
              <div className="metric-item" data-testid="metric-memory">
                <span className="metric-value">&lt; 150 MB</span>
                <span className="metric-label">Memory Footprint</span>
              </div>
              <div className="metric-item" data-testid="metric-fps">
                <span className="metric-value">60 FPS</span>
                <span className="metric-label">Render Budget</span>
              </div>
              <div className="metric-item" data-testid="metric-local">
                <span className="metric-value">100% Local</span>
                <span className="metric-label">Zero Telemetry</span>
              </div>
            </div>

            <div className="feature-list" data-testid="feature-list">
              <span className="feature-badge" data-testid="feature-tauri">
                Tauri v2 Desktop Shell
              </span>
              <span className="feature-badge" data-testid="feature-react">
                React 19 Frontend
              </span>
              <span className="feature-badge" data-testid="feature-domain">
                Decoupled Domain
              </span>
              <span className="feature-badge" data-testid="feature-stockfish">
                Stockfish Engine Bridge
              </span>
            </div>
          </div>
        </div>

        <NewGameModal
          isOpen={isNewGameModalOpen}
          onClose={handleCloseNewGame}
          onStartGame={handleStartNewGame}
          initialValues={{
            mode: sessionState.mode,
            player1Name: sessionState.players.w.name,
            player2Name: sessionState.players.b.name,
            player1Color: orientation,
          }}
        />

        <ConfirmationModal
          isOpen={isRestartModalOpen}
          title="Restart Game?"
          message="Are you sure you want to restart the current game? All move history and captured pieces will be reset to the starting position."
          confirmLabel="Restart Game"
          cancelLabel="Cancel"
          variant="warning"
          dialogTestId="restart-confirm-modal"
          confirmTestId="btn-confirm-restart"
          cancelTestId="btn-cancel-restart"
          onConfirm={handleConfirmRestart}
          onCancel={() => setIsRestartModalOpen(false)}
        />

        <ConfirmationModal
          isOpen={isResignModalOpen}
          title="Resign Game?"
          message={`Are you sure ${activeResigningPlayer} (${resigningColorLabel}) wants to resign? This will conclude the game immediately and declare ${activeWinningPlayer} the winner.`}
          confirmLabel="Resign"
          cancelLabel="Cancel"
          variant="danger"
          dialogTestId="resign-confirm-modal"
          confirmTestId="btn-confirm-resign"
          cancelTestId="btn-cancel-resign"
          onConfirm={handleConfirmResign}
          onCancel={() => setIsResignModalOpen(false)}
        />

        <ConfirmationModal
          isOpen={isDrawOfferModalOpen}
          title="Draw Offered?"
          message={`${offeringPlayerName}${
            offeringPlayerName !== offeringColorLabel
              ? ` (${offeringColorLabel})`
              : ""
          } has offered a draw. Does ${targetPlayerName} accept?`}
          confirmLabel="Accept Draw"
          cancelLabel="Decline Draw"
          variant="warning"
          dialogTestId="draw-offer-confirm-modal"
          confirmTestId="btn-accept-draw"
          cancelTestId="btn-decline-draw"
          onConfirm={handleAcceptDraw}
          onCancel={handleDeclineDraw}
        />

        <GameResultModal
          isOpen={isResultModalOpen}
          status={sessionState.status}
          players={sessionState.players}
          moveCount={sessionState.moveHistory.length}
          onRematch={handleConfirmRestart}
          onNewGame={() => {
            setHasDismissedResultModal(true);
            handleOpenNewGame();
          }}
          onClose={() => {
            setHasDismissedResultModal(true);
            setAnnouncement(
              "Game result dismissed. You may review the final board position."
            );
          }}
        />

        <GameRecoveryModal
          isOpen={isRecoveryModalOpen}
          activeGame={recoverableGame}
          onContinue={continueGame}
          onDiscard={discardGame}
          onClose={dismissRecoveryModal}
        />
      </main>
    </div>
  );
};

export default App;
