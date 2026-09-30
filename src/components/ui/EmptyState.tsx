import React from "react";

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => {
  const wrapperStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "var(--spacing-12) var(--spacing-6)",
    fontFamily: "var(--font-family-sans)",
    gap: "var(--spacing-4)",
    width: "100%",
  };

  const iconCircleStyle: React.CSSProperties = {
    width: "4rem",
    height: "4rem",
    borderRadius: "var(--radius-full)",
    backgroundColor: "var(--color-bg-tertiary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--color-text-tertiary)",
    marginBottom: "var(--spacing-2)",
  };

  const contentStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-2)",
    alignItems: "center",
    maxWidth: "28rem",
  };

  const titleStyle: React.CSSProperties = {
    color: "var(--color-text-primary)",
    fontSize: "var(--font-size-lg)",
    fontWeight: "var(--font-weight-semibold)",
    lineHeight: "var(--line-height-tight)",
    margin: 0,
  };

  const descriptionStyle: React.CSSProperties = {
    color: "var(--color-text-tertiary)",
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-regular)",
    lineHeight: "var(--line-height-relaxed)",
    margin: 0,
  };

  const actionWrapStyle: React.CSSProperties = {
    marginTop: "var(--spacing-2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div style={wrapperStyle} role="status" aria-live="polite">
      <div style={iconCircleStyle} aria-hidden="true">
        {icon ?? (
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="9" y1="9" x2="15" y2="9" />
            <line x1="9" y1="13" x2="15" y2="13" />
            <line x1="9" y1="17" x2="13" y2="17" />
          </svg>
        )}
      </div>
      <div style={contentStyle}>
        <h3 style={titleStyle}>{title}</h3>
        {description && <p style={descriptionStyle}>{description}</p>}
      </div>
      {action && <div style={actionWrapStyle}>{action}</div>}
    </div>
  );
};

export { EmptyState };
