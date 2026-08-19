export interface FenPreset {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly fen: string;
}

export const STANDARD_FEN_PRESETS: readonly FenPreset[] = [
  {
    id: "start",
    name: "Starting Position",
    description: "Standard FIDE initial array",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  },
  {
    id: "kp_endgame",
    name: "King & Pawn Endgame",
    description: "Elementary pawn promotion endgame",
    fen: "8/8/8/4k3/8/8/4P3/4K3 w - - 0 1",
  },
  {
    id: "lucena",
    name: "Lucena Position",
    description: "Classic winning rook endgame technique",
    fen: "1K6/1P1k4/8/8/8/8/r7/2R5 w - - 0 1",
  },
  {
    id: "opposite_bishops",
    name: "Opposite-Colored Bishops",
    description: "Endgame with opposing bishop colors",
    fen: "8/2b5/8/4k3/8/8/2B1K3/8 w - - 0 1",
  },
  {
    id: "knight_vs_bishop",
    name: "Knight vs Bishop",
    description: "Minor piece balance endgame",
    fen: "8/2n5/8/4k3/8/8/2B1K3/8 w - - 0 1",
  },
  {
    id: "bare_kings",
    name: "Bare Kings",
    description: "Immediate insufficient material draw",
    fen: "8/8/8/4k3/8/8/8/4K3 w - - 0 1",
  },
];
