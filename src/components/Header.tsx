import React from "react";
import { StatusBadge } from "./StatusBadge";

export interface HeaderProps {
  readonly onOpenSettings?: (() => void) | undefined;
  readonly onOpenShortcuts?: (() => void) | undefined;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenShortcuts,
}) => {
  return (
    <header
      data-testid="app-header"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 1.5rem",
        backgroundColor: "rgba(15, 23, 42, 0.8)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span
          data-testid="app-brand"
          style={{
            fontSize: "1.25rem",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            color: "#f8fafc",
          }}
        >
          Chess<span style={{ color: "#38bdf8" }}>Forge</span>
        </span>
        <span
          data-testid="app-version"
          style={{
            fontSize: "0.7rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            backgroundColor: "rgba(56, 189, 248, 0.15)",
            color: "#38bdf8",
            padding: "0.15rem 0.4rem",
            borderRadius: "4px",
          }}
        >
          v1.0.0
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <StatusBadge
          data-testid="engine-status-badge"
          label="Local Engine Ready"
          status="ready"
        />
        {onOpenShortcuts && (
          <button
            type="button"
            className="btn-control"
            data-testid="btn-open-shortcuts"
            onClick={onOpenShortcuts}
            aria-label="Keyboard Shortcuts (Press ? or F1)"
            title="Keyboard Shortcuts (? or F1)"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.35rem 0.75rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              backgroundColor: "rgba(30, 41, 59, 0.7)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: "6px",
              color: "#f8fafc",
              cursor: "pointer",
            }}
          >
            <span aria-hidden="true">⌨️</span>
            <span>Shortcuts</span>
          </button>
        )}
        {onOpenSettings && (
          <button
            type="button"
            className="btn-control"
            data-testid="btn-open-settings"
            onClick={onOpenSettings}
            aria-label="Open Settings"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.35rem 0.75rem",
              fontSize: "0.85rem",
              fontWeight: 600,
              backgroundColor: "rgba(30, 41, 59, 0.7)",
              border: "1px solid rgba(148, 163, 184, 0.2)",
              borderRadius: "6px",
              color: "#f8fafc",
              cursor: "pointer",
            }}
          >
            <span aria-hidden="true">⚙️</span>
            <span>Settings</span>
          </button>
        )}
      </div>
    </header>
  );
};
