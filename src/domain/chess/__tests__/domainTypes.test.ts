import { describe, expect, it } from "vitest";
import { createDomainError, err, isErr, isOk, ok } from "../errors";
import {
  ColorSchema,
  fileRankToSquare,
  isValidSquare,
  MoveInputSchema,
  oppositeColor,
  PieceSchema,
  PieceTypeSchema,
  SquareSchema,
  squareToFileRank,
  SQUARES,
} from "../types";

describe("Chess Domain: Types & Coordinate Helpers (TC-DOM-01, TC-DOM-02)", () => {
  it("contains exactly 64 valid algebraic squares", () => {
    expect(SQUARES).toHaveLength(64);
    expect(SQUARES[0]).toBe("a8");
    expect(SQUARES[63]).toBe("h1");
  });

  it("validates squares via SquareSchema and isValidSquare", () => {
    expect(SquareSchema.safeParse("e4").success).toBe(true);
    expect(SquareSchema.safeParse("a1").success).toBe(true);
    expect(SquareSchema.safeParse("h8").success).toBe(true);
    expect(SquareSchema.safeParse("i9").success).toBe(false);
    expect(SquareSchema.safeParse("e0").success).toBe(false);
    expect(SquareSchema.safeParse("").success).toBe(false);

    expect(isValidSquare("e4")).toBe(true);
    expect(isValidSquare("z9")).toBe(false);
    expect(isValidSquare(123)).toBe(false);
    expect(isValidSquare(null)).toBe(false);
  });

  it("converts file/rank indices to algebraic squares bidirectionally", () => {
    expect(fileRankToSquare(0, 0)).toBe("a1");
    expect(fileRankToSquare(4, 3)).toBe("e4");
    expect(fileRankToSquare(7, 7)).toBe("h8");
    expect(fileRankToSquare(-1, 0)).toBeNull();
    expect(fileRankToSquare(8, 0)).toBeNull();
    expect(fileRankToSquare(0, 8)).toBeNull();

    expect(squareToFileRank("a1")).toEqual({ file: 0, rank: 0 });
    expect(squareToFileRank("e4")).toEqual({ file: 4, rank: 3 });
    expect(squareToFileRank("h8")).toEqual({ file: 7, rank: 7 });
  });

  it("validates color schemas and color toggle", () => {
    expect(ColorSchema.safeParse("w").success).toBe(true);
    expect(ColorSchema.safeParse("b").success).toBe(true);
    expect(ColorSchema.safeParse("x").success).toBe(false);

    expect(oppositeColor("w")).toBe("b");
    expect(oppositeColor("b")).toBe("w");
  });

  it("validates piece types and pieces", () => {
    expect(PieceTypeSchema.safeParse("k").success).toBe(true);
    expect(PieceTypeSchema.safeParse("q").success).toBe(true);
    expect(PieceTypeSchema.safeParse("r").success).toBe(true);
    expect(PieceTypeSchema.safeParse("b").success).toBe(true);
    expect(PieceTypeSchema.safeParse("n").success).toBe(true);
    expect(PieceTypeSchema.safeParse("p").success).toBe(true);
    expect(PieceTypeSchema.safeParse("z").success).toBe(false);

    expect(PieceSchema.safeParse({ type: "p", color: "w" }).success).toBe(true);
    expect(PieceSchema.safeParse({ type: "k", color: "b" }).success).toBe(true);
    expect(PieceSchema.safeParse({ type: "p", color: "red" }).success).toBe(
      false
    );
  });

  it("validates move input schemas", () => {
    expect(MoveInputSchema.safeParse({ from: "e2", to: "e4" }).success).toBe(
      true
    );
    expect(
      MoveInputSchema.safeParse({ from: "e7", to: "e8", promotion: "q" })
        .success
    ).toBe(true);
    expect(
      MoveInputSchema.safeParse({ from: "e7", to: "e8", promotion: "k" })
        .success
    ).toBe(false);
    expect(
      MoveInputSchema.safeParse({ from: "e2", to: "invalid" }).success
    ).toBe(false);
  });
});

describe("Chess Domain: Unified Error Contract & Result Primitives (TC-DOM-03)", () => {
  it("creates typed ok and err results", () => {
    const successResult = ok({ moveCount: 10 });
    expect(successResult.success).toBe(true);
    if (isOk(successResult)) {
      expect(successResult.data.moveCount).toBe(10);
    }

    const domainError = createDomainError("ILLEGAL_MOVE", "King in check", {
      square: "e1",
    });
    const failureResult = err(domainError);
    expect(failureResult.success).toBe(false);
    if (isErr(failureResult)) {
      expect(failureResult.error.code).toBe("ILLEGAL_MOVE");
      expect(failureResult.error.message).toBe("King in check");
      expect(failureResult.error.details).toEqual({ square: "e1" });
    }
  });
});
