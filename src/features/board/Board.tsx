import React, { useMemo } from "react";
import clsx from "clsx";
import type { Square } from "../../domain/chess/types";
import {
  getGridSquares,
  getRanksForOrientation,
  getFilesForOrientation,
} from "./coordinates";
import { Square as SquareComponent } from "./Square";
import type { BoardProps, BoardSquareData } from "./types";
import "./Board.css";

export const Board: React.FC<BoardProps> = ({
  orientation = "w",
  showCoordinates = true,
  onSquareClick,
  renderSquare,
  className,
  ariaLabel = "Chessboard",
}) => {
  const gridSquares = useMemo(() => getGridSquares(orientation), [orientation]);
  const ranks = useMemo(
    () => getRanksForOrientation(orientation),
    [orientation]
  );
  const files = useMemo(
    () => getFilesForOrientation(orientation),
    [orientation]
  );

  return (
    <div
      className={clsx("chess-board-wrapper", className)}
      data-testid="chess-board-wrapper"
    >
      <div
        role="grid"
        aria-label={ariaLabel}
        data-testid="chess-board"
        data-orientation={orientation}
        className={clsx("chess-board-grid", `orientation-${orientation}`)}
      >
        {gridSquares.map((squareData: BoardSquareData) => {
          if (renderSquare) {
            return (
              <React.Fragment key={squareData.square}>
                {renderSquare(squareData)}
              </React.Fragment>
            );
          }

          return (
            <SquareComponent
              key={squareData.square}
              square={squareData.square}
              color={squareData.color}
              onClick={
                onSquareClick ? (sq: Square) => onSquareClick(sq) : undefined
              }
            />
          );
        })}

        {showCoordinates && (
          <>
            <div
              className="board-coordinates-ranks"
              data-testid="board-coordinates-ranks"
              aria-hidden="true"
            >
              {ranks.map((rank) => (
                <span
                  key={rank}
                  data-testid={`coordinate-rank-${rank}`}
                  className="coordinate-label coordinate-rank"
                >
                  {rank}
                </span>
              ))}
            </div>
            <div
              className="board-coordinates-files"
              data-testid="board-coordinates-files"
              aria-hidden="true"
            >
              {files.map((file) => (
                <span
                  key={file}
                  data-testid={`coordinate-file-${file}`}
                  className="coordinate-label coordinate-file"
                >
                  {file}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Board;
