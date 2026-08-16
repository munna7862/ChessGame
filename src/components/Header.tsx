import React from "react";
import { StatusBadge } from "./StatusBadge";

export const Header: React.FC = () => {
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
          v0.1.0-alpha
        </span>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <StatusBadge label="Local Engine Ready" status="ready" />
      </div>
    </header>
  );
};
