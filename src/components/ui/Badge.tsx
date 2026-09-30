import React from "react";

type BadgeVariant =
  | "waiting"
  | "called"
  | "served"
  | "no-show"
  | "routine"
  | "urgent"
  | "info"
  | "default";

export interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
}

const variantColorMap: Record<
  BadgeVariant,
  { bg: string; border: string; text: string }
> = {
  waiting: {
    bg: "var(--color-neutral-bg)",
    border: "var(--color-neutral-border)",
    text: "var(--color-neutral-text)",
  },
  called: {
    bg: "var(--color-info-bg)",
    border: "var(--color-info-border)",
    text: "var(--color-info-text)",
  },
  served: {
    bg: "var(--color-success-bg)",
    border: "var(--color-success-border)",
    text: "var(--color-success-text)",
  },
  "no-show": {
    bg: "var(--color-danger-bg)",
    border: "var(--color-danger-border)",
    text: "var(--color-danger-text)",
  },
  routine: {
    bg: "var(--color-neutral-bg)",
    border: "var(--color-neutral-border)",
    text: "var(--color-neutral-text)",
  },
  urgent: {
    bg: "var(--color-warning-bg)",
    border: "var(--color-warning-border)",
    text: "var(--color-warning-text)",
  },
  info: {
    bg: "var(--color-info-bg)",
    border: "var(--color-info-border)",
    text: "var(--color-info-text)",
  },
  default: {
    bg: "var(--color-neutral-bg)",
    border: "var(--color-neutral-border)",
    text: "var(--color-neutral-text)",
  },
};

const Badge: React.FC<BadgeProps> = ({ variant = "info", children }) => {
  const colors = variantColorMap[variant];

  const badgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "var(--spacing-1) var(--spacing-2-5)",
    borderRadius: "var(--radius-full)",
    backgroundColor: colors.bg,
    border: "1px solid",
    borderColor: colors.border,
    color: colors.text,
    fontFamily: "var(--font-family-sans)",
    fontSize: "var(--font-size-xs)",
    fontWeight: "var(--font-weight-semibold)",
    lineHeight: "var(--line-height-tight)",
    letterSpacing: "0.01em",
    whiteSpace: "nowrap",
  };

  return <span style={badgeStyle}>{children}</span>;
};

export { Badge };
