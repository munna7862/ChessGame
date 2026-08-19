import { Component, type ErrorInfo, type ReactNode } from "react";
import "./ErrorBoundary.css";

export interface ErrorBoundaryProps {
  readonly children: ReactNode;
  readonly fallback?:
    ((error: Error, reset: () => void) => ReactNode) | undefined;
  readonly onError?: ((error: Error, errorInfo: ErrorInfo) => void) | undefined;
  readonly onReset?: (() => void) | undefined;
}

interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
  readonly errorInfo: ErrorInfo | null;
  readonly copiedDiagnostics: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
    errorInfo: null,
    copiedDiagnostics: false,
  };

  private copyTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private primaryActionRef: HTMLButtonElement | null = null;

  public static getDerivedStateFromError(
    error: Error
  ): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    console.error(
      "[ChessForge] Uncaught component rendering error:",
      error,
      errorInfo
    );
    this.props.onError?.(error, errorInfo);
  }

  public override componentDidUpdate(
    _prevProps: ErrorBoundaryProps,
    prevState: ErrorBoundaryState
  ): void {
    if (!prevState.hasError && this.state.hasError && this.primaryActionRef) {
      this.primaryActionRef.focus();
    }
  }

  public override componentWillUnmount(): void {
    if (this.copyTimeoutId !== null) {
      clearTimeout(this.copyTimeoutId);
    }
  }

  public handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      copiedDiagnostics: false,
    });
    this.props.onReset?.();
  };

  public handleRestartSession = (): void => {
    try {
      window.sessionStorage?.clear();
    } catch {
      // Ignore storage access errors
    }
    this.handleReset();
  };

  public handleFullResetAndReload = (): void => {
    try {
      window.localStorage?.removeItem("chessforge_active_game");
      window.localStorage?.removeItem("chessforge_settings");
      window.sessionStorage?.clear();
    } catch {
      // Ignore storage access errors
    }
    window.location?.reload();
  };

  public handleCopyDiagnostics = async (): Promise<void> => {
    const { error, errorInfo } = this.state;
    const diagnosticReport = {
      app: "ChessForge Desktop",
      timestamp: new Date().toISOString(),
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      errorName: error?.name ?? "UnknownError",
      errorMessage: error?.message ?? "No error message",
      stack: error?.stack ?? "No stack trace available",
      componentStack: errorInfo?.componentStack ?? "No component stack",
    };

    const text = JSON.stringify(diagnosticReport, null, 2);

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      this.setState({ copiedDiagnostics: true });
      if (this.copyTimeoutId !== null) {
        clearTimeout(this.copyTimeoutId);
      }
      this.copyTimeoutId = setTimeout(() => {
        this.setState({ copiedDiagnostics: false });
      }, 2500);
    } catch (err) {
      console.warn("Failed to copy diagnostic report to clipboard:", err);
    }
  };

  public override render(): ReactNode {
    const { hasError, error, errorInfo, copiedDiagnostics } = this.state;
    const { children, fallback } = this.props;

    if (!hasError) {
      return children;
    }

    if (fallback && error) {
      return fallback(error, this.handleReset);
    }

    return (
      <main
        className="error-boundary-screen"
        data-testid="error-boundary-fallback"
        role="alert"
        aria-live="assertive"
      >
        <div className="error-boundary-card">
          <div className="error-boundary-header">
            <div className="error-boundary-icon" aria-hidden="true">
              ⚠️
            </div>
            <div className="error-boundary-title-group">
              <h1 className="error-boundary-title">Something Went Wrong</h1>
              <p className="error-boundary-subtitle">
                ChessForge encountered an unexpected interface error. Your game
                position may still be recoverable.
              </p>
            </div>
          </div>

          <div className="error-boundary-body">
            <div className="error-boundary-summary">
              <span className="error-boundary-summary__label">Error:</span>
              <span
                className="error-boundary-summary__msg"
                data-testid="error-boundary-message"
              >
                {error?.message || "An unknown rendering error occurred."}
              </span>
            </div>

            <div className="error-boundary-actions">
              <button
                type="button"
                ref={(el) => {
                  this.primaryActionRef = el;
                }}
                className="btn-error-action btn-error-action--primary"
                data-testid="btn-error-try-again"
                onClick={this.handleReset}
              >
                Try Again
              </button>
              <button
                type="button"
                className="btn-error-action btn-error-action--secondary"
                data-testid="btn-error-restart-game"
                onClick={this.handleRestartSession}
              >
                Restart Game
              </button>
              <button
                type="button"
                className="btn-error-action btn-error-action--ghost"
                data-testid="btn-error-copy-diagnostics"
                onClick={() => void this.handleCopyDiagnostics()}
              >
                {copiedDiagnostics
                  ? "✓ Diagnostic Log Copied!"
                  : "📋 Copy Diagnostics"}
              </button>
              <button
                type="button"
                className="btn-error-action btn-error-action--danger"
                data-testid="btn-error-reset-reload"
                onClick={this.handleFullResetAndReload}
              >
                Reset State &amp; Reload
              </button>
            </div>

            <details
              className="error-boundary-details"
              data-testid="error-boundary-details"
            >
              <summary className="error-boundary-details__summary">
                Technical Diagnostics (Click to Expand)
              </summary>
              <div className="error-boundary-details__content">
                {error?.stack && (
                  <pre
                    className="error-boundary-stack"
                    data-testid="error-stack-trace"
                  >
                    {error.stack}
                  </pre>
                )}
                {errorInfo?.componentStack && (
                  <pre className="error-boundary-stack error-boundary-stack--component">
                    {errorInfo.componentStack}
                  </pre>
                )}
              </div>
            </details>
          </div>
        </div>
      </main>
    );
  }
}

export default ErrorBoundary;
