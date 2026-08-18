import React from "react";
import "./EngineErrorBanner.css";

export interface EngineErrorBannerProps {
  readonly error: Error | null;
  readonly onRestart: () => void | Promise<void>;
  readonly onFallback2P: () => void;
  readonly onDismiss: () => void;
  readonly className?: string | undefined;
}

export const EngineErrorBanner: React.FC<EngineErrorBannerProps> = ({
  error,
  onRestart,
  onFallback2P,
  onDismiss,
  className = "",
}) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`engine-error-banner ${className}`}
      data-testid="engine-error-banner"
    >
      <div className="engine-error-banner__header">
        <span className="engine-error-banner__icon" aria-hidden="true">
          ⚠️
        </span>
        <h3 className="engine-error-banner__title">Chess Engine Error</h3>
      </div>
      <p className="engine-error-banner__message">
        The chess engine encountered an unexpected error and stopped responding.
        Current game position and move history have been preserved.
      </p>
      {error?.message && (
        <div
          className="engine-error-banner__details"
          data-testid="engine-error-details"
        >
          <code>{error.message}</code>
        </div>
      )}
      <div className="engine-error-banner__actions">
        <button
          type="button"
          className="btn-engine-action btn-engine-action--primary"
          data-testid="btn-engine-restart"
          onClick={() => void onRestart()}
        >
          Restart Engine
        </button>
        <button
          type="button"
          className="btn-engine-action btn-engine-action--secondary"
          data-testid="btn-engine-fallback-2p"
          onClick={onFallback2P}
        >
          Continue as Two Players
        </button>
        <button
          type="button"
          className="btn-engine-action btn-engine-action--ghost"
          data-testid="btn-engine-dismiss-error"
          onClick={onDismiss}
          aria-label="Dismiss error notification"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};
