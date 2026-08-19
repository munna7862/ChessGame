import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ErrorBoundary } from "../ErrorBoundary";

// Component that conditionally throws an error
const ProblematicChild: React.FC<{
  shouldThrow?: boolean;
  message?: string;
}> = ({ shouldThrow = false, message = "Test Component Explosion" }) => {
  if (shouldThrow) {
    throw new Error(message);
  }
  return <div data-testid="child-healthy">ChessForge Running Normally</div>;
};

describe("ErrorBoundary Component (TC-ERR-01 to TC-ERR-03)", () => {
  // Silence console.error logs for expected boundary catches during tests
  const originalConsoleError = console.error;
  beforeEach(() => {
    console.error = vi.fn();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    vi.restoreAllMocks();
  });

  it("TC-ERR-01: renders children normally when no error occurs", () => {
    render(
      <ErrorBoundary>
        <ProblematicChild shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByTestId("child-healthy")).toBeInTheDocument();
    expect(screen.queryByTestId("error-boundary-fallback")).toBeNull();
  });

  it("TC-ERR-01: catches rendering error, renders accessible fallback, and invokes onError callback", () => {
    const onErrorMock = vi.fn();

    render(
      <ErrorBoundary onError={onErrorMock}>
        <ProblematicChild shouldThrow={true} message="Simulation of UI Crash" />
      </ErrorBoundary>
    );

    expect(screen.getByTestId("error-boundary-fallback")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByTestId("error-boundary-message")).toHaveTextContent(
      "Simulation of UI Crash"
    );
    expect(onErrorMock).toHaveBeenCalledTimes(1);
    expect(onErrorMock.mock.calls[0]![0]).toBeInstanceOf(Error);
  });

  it("TC-ERR-02: recovers when Try Again is clicked after error condition resolves", () => {
    let shouldThrow = true;
    const DynamicChild: React.FC = () => {
      if (shouldThrow) {
        throw new Error("Transient glitch");
      }
      return <div data-testid="child-healthy">ChessForge Running Normally</div>;
    };

    render(
      <ErrorBoundary>
        <DynamicChild />
      </ErrorBoundary>
    );

    expect(screen.getByTestId("error-boundary-fallback")).toBeInTheDocument();

    // Resolve the condition prior to triggering reset
    shouldThrow = false;
    const tryAgainBtn = screen.getByTestId("btn-error-try-again");
    fireEvent.click(tryAgainBtn);

    expect(screen.getByTestId("child-healthy")).toBeInTheDocument();
    expect(screen.queryByTestId("error-boundary-fallback")).toBeNull();
  });

  it("TC-ERR-03: copies structured diagnostic information to clipboard", async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <ErrorBoundary>
        <ProblematicChild shouldThrow={true} message="Diagnostic Test Error" />
      </ErrorBoundary>
    );

    const copyBtn = screen.getByTestId("btn-error-copy-diagnostics");
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledTimes(1);
    });

    const copiedPayload = JSON.parse(writeTextMock.mock.calls[0]![0]);
    expect(copiedPayload.app).toBe("ChessForge Desktop");
    expect(copiedPayload.errorMessage).toBe("Diagnostic Test Error");
    expect(screen.getByText("✓ Diagnostic Log Copied!")).toBeInTheDocument();
  });

  it("TC-ERR-01: renders custom fallback prop if provided", () => {
    const customFallback = (err: Error, reset: () => void) => (
      <div data-testid="custom-fallback">
        <p>Custom: {err.message}</p>
        <button onClick={reset}>Reset Custom</button>
      </div>
    );

    render(
      <ErrorBoundary fallback={customFallback}>
        <ProblematicChild shouldThrow={true} message="Custom Handler Error" />
      </ErrorBoundary>
    );

    expect(screen.getByTestId("custom-fallback")).toBeInTheDocument();
    expect(
      screen.getByText("Custom: Custom Handler Error")
    ).toBeInTheDocument();
  });
});
