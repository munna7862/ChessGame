import React, { useEffect, useRef } from "react";
import type { Move } from "../../domain/chess/types";
import type { CapturedPieces, PlayerConfig } from "./types";
import {
  groupMovesIntoPairs,
  calculateMaterialAdvantage,
} from "./moveHistoryUtils";
import { CapturedPiecesView } from "./CapturedPiecesView";
import "./MoveHistoryPanel.css";

export interface MoveHistoryPanelProps {
  readonly moveHistory: readonly Move[];
  readonly capturedPieces?: CapturedPieces | undefined;
  readonly players?:
    | {
        readonly w: PlayerConfig;
        readonly b: PlayerConfig;
      }
    | undefined;
  readonly activePlyIndex?: number | undefined;
  readonly onSelectMove?: ((plyIndex: number) => void) | undefined;
  readonly className?: string | undefined;
}

export const MoveHistoryPanel: React.FC<MoveHistoryPanelProps> = ({
  moveHistory,
  capturedPieces,
  players,
  activePlyIndex,
  onSelectMove,
  className = "",
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeRowRef = useRef<HTMLDivElement>(null);

  const movePairs = groupMovesIntoPairs(moveHistory);
  const totalMoves = moveHistory.length;
  const currentPly = activePlyIndex ?? (totalMoves > 0 ? totalMoves - 1 : -1);

  const materialBalance = capturedPieces
    ? calculateMaterialAdvantage(capturedPieces)
    : null;

  // Auto-scroll to the latest move row whenever new moves are added
  useEffect(() => {
    if (
      activeRowRef.current &&
      typeof activeRowRef.current.scrollIntoView === "function"
    ) {
      activeRowRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    } else if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [totalMoves, currentPly]);

  const whiteName = players?.w.name ?? "White";
  const blackName = players?.b.name ?? "Black";

  return (
    <section
      className={`move-history-panel ${className}`}
      data-testid="move-history-panel"
      role="region"
      aria-label="Move history and game review"
    >
      <div className="move-history-panel__header">
        <div className="move-history-panel__title-row">
          <h2 className="move-history-panel__title">Move History</h2>
          <span
            className="move-history-panel__count-badge"
            data-testid="move-count-badge"
          >
            {totalMoves} {totalMoves === 1 ? "ply" : "plies"}
          </span>
        </div>

        {capturedPieces && (
          <div
            className="move-history-panel__captures-summary"
            data-testid="captures-summary"
          >
            <div className="move-history-panel__capture-row">
              <span className="move-history-panel__player-label">
                {whiteName}:
              </span>
              <CapturedPiecesView
                capturedPieces={capturedPieces.white}
                capturingColor="w"
                materialAdvantage={
                  materialBalance?.leader === "w"
                    ? materialBalance.diff
                    : undefined
                }
                testId="history-captured-w"
              />
            </div>
            <div className="move-history-panel__capture-row">
              <span className="move-history-panel__player-label">
                {blackName}:
              </span>
              <CapturedPiecesView
                capturedPieces={capturedPieces.black}
                capturingColor="b"
                materialAdvantage={
                  materialBalance?.leader === "b"
                    ? materialBalance.diff
                    : undefined
                }
                testId="history-captured-b"
              />
            </div>
          </div>
        )}
      </div>

      <div
        ref={scrollContainerRef}
        className="move-history-panel__scroll-area"
        data-testid="move-history-scroll-area"
        tabIndex={0}
        role="region"
        aria-label="Move record list"
      >
        {movePairs.length === 0 ? (
          <div
            className="move-history-panel__empty"
            data-testid="move-history-empty"
          >
            No moves played yet.
          </div>
        ) : (
          <div className="move-history-panel__table" role="table">
            <div className="move-history-panel__table-header" role="row">
              <span
                className="move-history-panel__col-header move-history-panel__col-header--num"
                role="columnheader"
              >
                #
              </span>
              <span
                className="move-history-panel__col-header"
                role="columnheader"
              >
                White
              </span>
              <span
                className="move-history-panel__col-header"
                role="columnheader"
              >
                Black
              </span>
            </div>

            <div className="move-history-panel__table-body" role="rowgroup">
              {movePairs.map((pair) => {
                const isWhiteActive = currentPly === pair.whitePlyIndex;
                const isBlackActive =
                  pair.blackPlyIndex !== undefined &&
                  currentPly === pair.blackPlyIndex;
                const isRowActive = isWhiteActive || isBlackActive;

                return (
                  <div
                    key={`move-pair-${pair.moveNumber}`}
                    ref={isRowActive ? activeRowRef : undefined}
                    className={`move-row ${isRowActive ? "move-row--active" : ""}`}
                    data-testid={`move-row-${pair.moveNumber}`}
                    role="row"
                  >
                    <span className="move-row__num" role="cell">
                      {pair.moveNumber}.
                    </span>

                    <button
                      type="button"
                      className={`move-cell ${
                        isWhiteActive ? "move-cell--active" : ""
                      }`}
                      data-testid={`move-cell-${pair.whitePlyIndex}`}
                      data-ply={pair.whitePlyIndex}
                      data-active={isWhiteActive}
                      onClick={() => onSelectMove?.(pair.whitePlyIndex)}
                      aria-label={`Move ${pair.moveNumber}, White, ${pair.white.san}`}
                    >
                      {pair.white.san}
                    </button>

                    {pair.black ? (
                      <button
                        type="button"
                        className={`move-cell ${
                          isBlackActive ? "move-cell--active" : ""
                        }`}
                        data-testid={`move-cell-${pair.blackPlyIndex}`}
                        data-ply={pair.blackPlyIndex}
                        data-active={isBlackActive}
                        onClick={() =>
                          pair.blackPlyIndex !== undefined &&
                          onSelectMove?.(pair.blackPlyIndex)
                        }
                        aria-label={`Move ${pair.moveNumber}, Black, ${pair.black.san}`}
                      >
                        {pair.black.san}
                      </button>
                    ) : (
                      <span
                        className="move-cell move-cell--empty"
                        data-testid={`move-cell-empty-${pair.moveNumber}`}
                        role="cell"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
