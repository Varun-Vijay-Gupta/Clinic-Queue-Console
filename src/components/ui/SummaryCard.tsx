import React from "react";

type TrendDirection = "up" | "down" | "none";

export interface SummaryCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: TrendDirection;
  trendValue?: string;
  accentColor: string;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  label,
  value,
  icon,
  trend = "none",
  trendValue,
  accentColor,
}) => {
  const cardStyle: React.CSSProperties = {
    backgroundColor: "var(--color-bg-elevated)",
    borderRadius: "var(--radius-xl)",
    padding: "var(--spacing-5)",
    boxShadow: "var(--shadow-md)",
    border: "1px solid var(--color-border-subtle)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-3)",
    fontFamily: "var(--font-family-sans)",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "var(--spacing-4)",
  };

  const textBlockStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-1)",
    minWidth: 0,
    flex: 1,
  };

  const labelStyle: React.CSSProperties = {
    color: "var(--color-text-tertiary)",
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    lineHeight: "var(--line-height-normal)",
    margin: 0,
  };

  const valueStyle: React.CSSProperties = {
    color: "var(--color-text-primary)",
    fontSize: "var(--font-size-3xl)",
    fontWeight: "var(--font-weight-bold)",
    lineHeight: "var(--line-height-tight)",
    margin: 0,
    letterSpacing: "-0.02em",
  };

  const iconCircleStyle: React.CSSProperties = {
    width: "2.75rem",
    height: "2.75rem",
    borderRadius: "var(--radius-lg)",
    backgroundColor: accentColor,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    opacity: 0.12,
    position: "relative",
  };

  const iconInnerWrapStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: accentColor,
  };

  const trendRowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "var(--spacing-1-5)",
    marginTop: "var(--spacing-0-5)",
  };

  const getTrendColor = () => {
    if (trend === "up") return "var(--color-success-text)";
    if (trend === "down") return "var(--color-danger-text)";
    return "var(--color-text-tertiary)";
  };

  const trendIndicatorStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1rem",
    height: "1rem",
    color: getTrendColor(),
  };

  const trendTextStyle: React.CSSProperties = {
    color: getTrendColor(),
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-semibold)",
    lineHeight: "var(--line-height-normal)",
  };

  return (
    <div style={cardStyle} role="group" aria-label={`${label}: ${value}`}>
      <div style={headerStyle}>
        <div style={textBlockStyle}>
          <p style={labelStyle}>{label}</p>
          <p style={valueStyle}>{value}</p>
        </div>
        {icon !== undefined && icon !== null && (
          <div style={iconCircleStyle} aria-hidden="true">
            <div style={iconInnerWrapStyle}>{icon}</div>
          </div>
        )}
      </div>
      {trend !== "none" && trendValue && (
        <div style={trendRowStyle}>
          <span style={trendIndicatorStyle} aria-hidden="true">
            {trend === "up" ? "▲" : trend === "down" ? "▼" : "—"}
          </span>
          <span style={trendTextStyle}>{trendValue}</span>
        </div>
      )}
    </div>
  );
};

export { SummaryCard };
