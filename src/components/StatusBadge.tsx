import React from "react";

export interface StatusBadgeProps {
  label: string;
  status?: "online" | "idle" | "evaluating" | "ready";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  status = "ready",
}) => {
  const getStatusColor = () => {
    switch (status) {
      case "online":
      case "ready":
        return "#34d399";
      case "evaluating":
        return "#38bdf8";
      case "idle":
      default:
        return "#fbbf24";
    }
  };

  return (
    <div
      data-testid="status-badge"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.25rem 0.75rem",
        borderRadius: "9999px",
        backgroundColor: "rgba(30, 41, 59, 0.8)",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        fontSize: "0.75rem",
        fontWeight: 500,
        color: "#f8fafc",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          backgroundColor: getStatusColor(),
          boxShadow: `0 0 8px ${getStatusColor()}`,
        }}
      />
      <span>{label}</span>
    </div>
  );
};
