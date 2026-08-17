import { useState, useEffect, useCallback } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export interface UseReducedMotionResult {
  /**
   * Whether reduced motion is active (considering system preference and explicit override).
   */
  readonly prefersReducedMotion: boolean;
  /**
   * Explicit user override (true: force reduced motion, false: force motion enabled, null: follow system).
   */
  readonly reducedMotionOverride: boolean | null;
  /**
   * Set or clear the explicit user override.
   */
  readonly setReducedMotionOverride: (override: boolean | null) => void;
  /**
   * Toggle between forced reduced motion and motion enabled.
   */
  readonly toggleReducedMotion: () => void;
}

/**
 * Custom hook to detect system reduced-motion preference with optional user override.
 *
 * Adheres to accessibility best practices and 100% deterministic SSR/test compatibility.
 */
export function useReducedMotion(
  initialOverride: boolean | null = null
): UseReducedMotionResult {
  const [systemReducedMotion, setSystemReducedMotion] = useState<boolean>(
    () => {
      if (typeof window === "undefined" || !window.matchMedia) {
        return false;
      }
      try {
        return window.matchMedia(REDUCED_MOTION_QUERY).matches;
      } catch {
        return false;
      }
    }
  );

  const [reducedMotionOverride, setReducedMotionOverride] = useState<
    boolean | null
  >(initialOverride);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    let mediaQueryList: MediaQueryList;
    try {
      mediaQueryList = window.matchMedia(REDUCED_MOTION_QUERY);
    } catch {
      return;
    }

    const listener = (event: MediaQueryListEvent) => {
      setSystemReducedMotion(event.matches);
    };

    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener("change", listener);
    } else if ("addListener" in mediaQueryList) {
      // Legacy fallback for older test environments
      (
        mediaQueryList as unknown as {
          addListener: (cb: (e: MediaQueryListEvent) => void) => void;
        }
      ).addListener(listener);
    }

    return () => {
      if (mediaQueryList.removeEventListener) {
        mediaQueryList.removeEventListener("change", listener);
      } else if ("removeListener" in mediaQueryList) {
        (
          mediaQueryList as unknown as {
            removeListener: (cb: (e: MediaQueryListEvent) => void) => void;
          }
        ).removeListener(listener);
      }
    };
  }, []);

  const prefersReducedMotion =
    reducedMotionOverride !== null
      ? reducedMotionOverride
      : systemReducedMotion;

  const toggleReducedMotion = useCallback(() => {
    setReducedMotionOverride((current) => {
      const active = current !== null ? current : systemReducedMotion;
      return !active;
    });
  }, [systemReducedMotion]);

  return {
    prefersReducedMotion,
    reducedMotionOverride,
    setReducedMotionOverride,
    toggleReducedMotion,
  };
}

export default useReducedMotion;
