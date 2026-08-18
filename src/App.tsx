import React, { useState } from "react";
import { Header } from "./components/Header";
import { Board } from "./features/board/Board";
import type { BoardOrientation } from "./features/board/types";
import { useBoardInteraction } from "./features/board/useBoardInteraction";
import { useReducedMotion } from "./features/board/useReducedMotion";
import {
  useGameSession,
  PlayerPanel,
  NewGameModal,
  MoveHistoryPanel,
  calculateMaterialAdvantage,
  type ResolvedNewGameSession,
} from "./features/game";
import "./App.css";

export const App: React.FC = () => {
  const { sessionState, chessGame, resetGame } = useGameSession();

  const [orientation, setOrientation] = useState<BoardOrientation>("w");
  const [isNewGameModalOpen, setIsNewGameModalOpen] = useState<boolean>(false);
  const { prefersReducedMotion, toggleReducedMotion } = useReducedMotion();

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
    resetLastMove,
  } = useBoardInteraction({
    game: chessGame,
  });

  const position = sessionState.position;

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
    resetGame(resolved.config);
    handlePromotionCancel();
    resetLastMove();
    setOrientation(resolved.userOrientation);
    setAnnouncement(
      `New game started: ${resolved.config.players?.w.name ?? "White"} vs ${
        resolved.config.players?.b.name ?? "Black"
      }.`
    );
  };

  const turnLabel = position.turn === "w" ? "White to move" : "Black to move";

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

  return (
    <div className="app-container" data-testid="chessforge-app">
      <Header />
      <main className="main-content">
        <div className="board-section" data-testid="board-section">
          <div className="board-status-bar" data-testid="board-status-bar">
            <div className="status-group">
              <span
                className="turn-badge"
                data-testid="turn-indicator"
                data-turn={position.turn}
              >
                {turnLabel}
              </span>
              {gameStatus.isCheck && gameStatus.state !== "checkmate" && (
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
            isCheck={
              sessionState.isCheck && sessionState.turn === topPlayer.color
            }
            capturedPieces={topPlayerCaptures}
            materialAdvantage={topMaterialAdvantage}
            position="top"
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
            disabled={isGameOver}
            onSquareClick={handleSquareClick}
          />

          <PlayerPanel
            player={bottomPlayer}
            isTurn={
              sessionState.turn === bottomPlayer.color &&
              !sessionState.isGameOver
            }
            isCheck={
              sessionState.isCheck && sessionState.turn === bottomPlayer.color
            }
            capturedPieces={bottomPlayerCaptures}
            materialAdvantage={bottomMaterialAdvantage}
            position="bottom"
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
      </main>
    </div>
  );
};

export default App;
