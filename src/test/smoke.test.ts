import { describe, it, expect } from "vitest";
import { z } from "zod";

// Result error contract pattern
export type Result<T, E = Error> =
  { ok: true; value: T } | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Chess move coordinate boundary schema
export const SquareSchema = z
  .string()
  .regex(/^[a-h][1-8]$/, "Invalid square coordinate");
export const MovePayloadSchema = z.object({
  from: SquareSchema,
  to: SquareSchema,
  promotion: z.enum(["q", "r", "b", "n"]).optional(),
});

describe("Developer Tooling & Code Quality Smoke Suite (TC-TOOL-06)", () => {
  it("enforces Result<T, E> discriminated union type safety", () => {
    const successResult: Result<string, Error> = ok("e2e4");
    if (successResult.ok) {
      expect(successResult.value).toBe("e2e4");
    } else {
      throw new Error("Expected ok result");
    }

    const errorResult: Result<string, { code: string; message: string }> = err({
      code: "ILLEGAL_MOVE",
      message: "King is in check",
    });

    if (!errorResult.ok) {
      expect(errorResult.error.code).toBe("ILLEGAL_MOVE");
      expect(errorResult.error.message).toBe("King is in check");
    } else {
      throw new Error("Expected err result");
    }
  });

  it("validates boundary schemas using Zod runtime validation", () => {
    const validMove = {
      from: "e2",
      to: "e4",
    };

    const parsed = MovePayloadSchema.safeParse(validMove);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.from).toBe("e2");
      expect(parsed.data.to).toBe("e4");
      expect(parsed.data.promotion).toBeUndefined();
    }

    const invalidMove = {
      from: "z9",
      to: "e4",
    };

    const invalidParsed = MovePayloadSchema.safeParse(invalidMove);
    expect(invalidParsed.success).toBe(false);
  });

  it("validates pawn promotion move payload parsing", () => {
    const promotionMove = {
      from: "e7",
      to: "e8",
      promotion: "q" as const,
    };

    const parsed = MovePayloadSchema.safeParse(promotionMove);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.promotion).toBe("q");
    }
  });
});
