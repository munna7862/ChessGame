import { useEffect, useRef, type RefObject } from "react";

export interface UseFocusTrapOptions {
  readonly isOpen: boolean;
  readonly containerRef: RefObject<HTMLElement | null>;
  readonly initialFocusRef?: RefObject<HTMLElement | null> | undefined;
  readonly onEscape?: (() => void) | undefined;
  readonly restoreFocusOnClose?: boolean | undefined;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Custom hook to manage accessible focus trapping, keyboard cycling,
 * Escape dismissal, and focus restoration for modal dialogs.
 */
export function useFocusTrap({
  isOpen,
  containerRef,
  initialFocusRef,
  onEscape,
  restoreFocusOnClose = true,
}: UseFocusTrapOptions): void {
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Capture the element that had focus prior to opening the dialog
    previousActiveElementRef.current =
      document.activeElement as HTMLElement | null;

    // Synchronously or via microtask focus the initial target
    const setInitialFocus = () => {
      if (initialFocusRef?.current) {
        initialFocusRef.current.focus();
        return;
      }
      if (containerRef.current) {
        const focusableElements =
          containerRef.current.querySelectorAll<HTMLElement>(
            FOCUSABLE_SELECTOR
          );
        if (focusableElements.length > 0) {
          focusableElements[0]?.focus();
        } else {
          containerRef.current.focus();
        }
      }
    };

    // Use queueMicrotask for deterministic zero-sleep focus placement
    queueMicrotask(setInitialFocus);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onEscape) {
        e.preventDefault();
        e.stopPropagation();
        onEscape();
        return;
      }

      if (e.key === "Tab" && containerRef.current) {
        const focusableElements = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => {
          const style = window.getComputedStyle
            ? window.getComputedStyle(el)
            : null;
          return (
            !style ||
            (style.display !== "none" && style.visibility !== "hidden")
          );
        });

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (
            document.activeElement === firstElement ||
            !containerRef.current.contains(document.activeElement)
          ) {
            e.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (
            document.activeElement === lastElement ||
            !containerRef.current.contains(document.activeElement)
          ) {
            e.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
      if (restoreFocusOnClose && previousActiveElementRef.current) {
        const prev = previousActiveElementRef.current;
        // Restore focus if element is still in the document
        if (document.body.contains(prev)) {
          queueMicrotask(() => {
            prev.focus();
          });
        }
      }
    };
  }, [isOpen, containerRef, initialFocusRef, onEscape, restoreFocusOnClose]);
}

export default useFocusTrap;
