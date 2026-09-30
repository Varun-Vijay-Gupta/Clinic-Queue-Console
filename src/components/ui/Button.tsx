import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "warning";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  ariaLabel?: string;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  ariaLabel,
  fullWidth = false,
  className,
  style,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onMouseDown,
  onMouseUp,
  onFocus,
  onBlur,
  ...rest
}) => {
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);

  const variantBase: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: "var(--color-accent-primary)",
      borderColor: "var(--color-accent-primary)",
      color: "var(--color-text-inverse)",
    },
    secondary: {
      backgroundColor: "var(--color-bg-primary)",
      borderColor: "var(--color-border-default)",
      color: "var(--color-text-primary)",
    },
    danger: {
      backgroundColor: "var(--color-danger-bg)",
      borderColor: "var(--color-danger-border)",
      color: "var(--color-danger-text)",
    },
    ghost: {
      backgroundColor: "transparent",
      borderColor: "transparent",
      color: "var(--color-text-primary)",
    },
    warning: {
      backgroundColor: "var(--color-warning-bg)",
      borderColor: "var(--color-warning-border)",
      color: "var(--color-warning-text)",
    },
  };

  const variantHover: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: "var(--color-accent-primary-hover)",
      borderColor: "var(--color-accent-primary-hover)",
    },
    secondary: { backgroundColor: "var(--color-bg-secondary)" },
    danger: { backgroundColor: "rgba(254,226,226,0.85)" },
    ghost: { backgroundColor: "var(--color-bg-tertiary)" },
    warning: { backgroundColor: "rgba(254,243,199,0.9)" },
  };

  const variantActive: Record<ButtonVariant, React.CSSProperties> = {
    primary: {
      backgroundColor: "var(--color-accent-primary-pressed)",
      borderColor: "var(--color-accent-primary-pressed)",
    },
    secondary: { backgroundColor: "var(--color-bg-tertiary)" },
    danger: { backgroundColor: "rgba(254,226,226,1)" },
    ghost: { backgroundColor: "rgba(238,240,244,0.8)" },
    warning: { backgroundColor: "rgba(254,243,199,1)" },
  };

  const sizeBase: Record<ButtonSize, React.CSSProperties> = {
    sm: {
      padding: "var(--spacing-1-5) var(--spacing-3)",
      fontSize: "var(--font-size-sm)",
      borderRadius: "var(--radius-md)",
    },
    md: {
      padding: "var(--spacing-2-5) var(--spacing-4)",
      fontSize: "var(--font-size-base)",
      borderRadius: "var(--radius-md)",
    },
    lg: {
      padding: "var(--spacing-3) var(--spacing-5)",
      fontSize: "var(--font-size-lg)",
      borderRadius: "var(--radius-lg)",
    },
  };

  const merged: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "var(--spacing-2)",
    fontFamily: "var(--font-family-sans)",
    fontWeight: "var(--font-weight-medium)",
    lineHeight: "var(--line-height-normal)",
    borderWidth: "1px",
    borderStyle: "solid",
    cursor: disabled || loading ? "not-allowed" : "pointer",
    transition:
      "background-color var(--transition-normal), border-color var(--transition-normal), color var(--transition-normal), box-shadow var(--transition-normal)",
    outline: "none",
    userSelect: "none",
    opacity: disabled ? 0.55 : 1,
    width: fullWidth ? "100%" : undefined,
    boxSizing: "border-box",
    ...variantBase[variant],
    ...sizeBase[size],
    ...style,
  };

  const applyStyle = (patch: React.CSSProperties) => {
    const node = buttonRef.current;
    if (!node || disabled || loading) return;
    for (const [k, v] of Object.entries(patch)) {
      node.style.setProperty(k, v as string);
    }
  };

  const resetStyle = () => {
    const node = buttonRef.current;
    if (!node) return;
    for (const [k, v] of Object.entries(variantBase[variant])) {
      node.style.setProperty(k, v as string);
    }
  };

  const spinnerStyle: React.CSSProperties = {
    width: "1em",
    height: "1em",
    border: "2px solid currentColor",
    borderRightColor: "transparent",
    borderRadius: "50%",
    animation: "ui-btn-spin 0.6s linear infinite",
    display: "inline-block",
    flexShrink: 0,
  };

  return (
    <>
      <style>{`@keyframes ui-btn-spin { to { transform: rotate(360deg); } }`}</style>
      <button
        ref={buttonRef}
        {...rest}
        type={rest.type ?? "button"}
        disabled={disabled || loading}
        aria-label={ariaLabel ?? rest["aria-label"]}
        aria-busy={loading || undefined}
        aria-disabled={disabled || loading || undefined}
        style={merged}
        className={className}
        onClick={onClick}
        onMouseEnter={(e) => {
          applyStyle(variantHover[variant]);
          onMouseEnter?.(e);
        }}
        onMouseLeave={(e) => {
          resetStyle();
          onMouseLeave?.(e);
        }}
        onMouseDown={(e) => {
          applyStyle(variantActive[variant]);
          onMouseDown?.(e);
        }}
        onMouseUp={(e) => {
          applyStyle(variantHover[variant]);
          onMouseUp?.(e);
        }}
        onFocus={(e) => {
          e.currentTarget.style.boxShadow = `0 0 0 var(--focus-ring-width) var(--color-bg-primary), 0 0 0 calc(var(--focus-ring-width) + var(--focus-ring-offset)) var(--focus-ring-color)`;
          onFocus?.(e);
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = style?.boxShadow ?? "";
          onBlur?.(e);
        }}
      >
        {loading ? <span aria-hidden="true" style={spinnerStyle} /> : null}
        <span style={{ opacity: loading ? 0.85 : 1 }}>{children}</span>
      </button>
    </>
  );
};

export default Button;
