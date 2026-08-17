export interface PerftFixture {
  readonly id: string;
  readonly name: string;
  readonly fen: string;
  readonly expectedNodes: Readonly<Record<number, number>>;
  readonly tacticalThemes: readonly string[];
}

/**
 * Canonical FIDE / Chess Programming Wiki Perft test suite.
 */
export const PERFT_CORPUS: readonly PerftFixture[] = [
  {
    id: "POS-1",
    name: "Standard Initial Starting Position",
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    expectedNodes: {
      1: 20,
      2: 400,
      3: 8902,
      4: 197281,
    },
    tacticalThemes: ["Initial pawn pushes", "Knight jumps", "Standard board"],
  },
  {
    id: "POS-2",
    name: "Kiwipete Position (Peter McKenzie)",
    fen: "r3k2r/p1ppqpb1/bn2pnp1/3PN3/1p2P3/2N2Q1p/PPPBBPPP/R3K2R w KQkq - 0 1",
    expectedNodes: {
      1: 48,
      2: 2039,
      3: 97862,
    },
    tacticalThemes: [
      "Both-side castling",
      "En passant captures",
      "Double checks",
      "Pawn promotion potential",
    ],
  },
  {
    id: "POS-3",
    name: "Position 3 (Endgame Pins & Checks)",
    fen: "8/2p5/3p4/KP5r/1R3p1k/8/4P1P1/8 w - - 0 1",
    expectedNodes: {
      1: 14,
      2: 191,
      3: 2812,
    },
    tacticalThemes: [
      "Absolute pawn pin",
      "Discovered check",
      "Rook vs Pawn endgame",
    ],
  },
  {
    id: "POS-4",
    name: "Position 4 (Dual Promotions & Checks)",
    fen: "r3k2r/Pppp1ppp/1b3nbN/nP6/BBP1P3/q4N2/Pp1P2PP/R2Q1RK1 w kq - 0 1",
    expectedNodes: {
      1: 6,
      2: 264,
      3: 9467,
    },
    tacticalThemes: [
      "8th and 1st rank promotions",
      "Castling out of check denial",
      "Discovered checks",
    ],
  },
  {
    id: "POS-5",
    name: "Position 5 (Promotions & Sharp Pins)",
    fen: "rnbq1k1r/pp1Pbppp/2p5/8/2B5/8/PPP1NnPP/RNBQK2R w KQ - 1 8",
    expectedNodes: {
      1: 44,
      2: 1486,
      3: 62379,
    },
    tacticalThemes: [
      "Underpromotion to knight with check",
      "Bishop sacrifices",
      "Multiple pinned pieces",
    ],
  },
];
