import React from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  ariaLabel?: string;
  id?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  options,
  value,
  onChange,
  disabled = false,
  ariaLabel,
  id,
}) => {
  const selectId =
    id ??
    (label ? `select-${label.replace(/\s+/g, "-").toLowerCase()}` : undefined);

  const wrapperStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-1-5)",
    fontFamily: "var(--font-family-sans)",
    width: "100%",
  };

  const labelStyle: React.CSSProperties = {
    color: "var(--color-text-secondary)",
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    lineHeight: "var(--line-height-normal)",
  };

  const selectWrapStyle: React.CSSProperties = {
    position: "relative",
    width: "100%",
  };

  const selectBaseStyle: React.CSSProperties = {
    width: "100%",
    padding: "var(--spacing-2-5) var(--spacing-10) var(--spacing-2-5) var(--spacing-3-5)",
    fontSize: "var(--font-size-base)",
    fontWeight: "var(--font-weight-regular)",
    lineHeight: "var(--line-height-normal)",
    color: "var(--color-text-primary)",
    backgroundColor: disabled ? "var(--color-bg-secondary)" : "var(--color-bg-primary)",
    border: "1px solid var(--color-border-default)",
    borderRadius: "var(--radius-md)",
    fontFamily: "var(--font-family-sans)",
    cursor: disabled ? "not-allowed" : "pointer",
    appearance: "none",
    WebkitAppearance: "none",
    MozAppearance: "none",
    transition:
      "border-color var(--transition-normal), box-shadow var(--transition-normal), background-color var(--transition-normal)",
    opacity: disabled ? 0.6 : 1,
  };

  const caretStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    right: "var(--spacing-3)",
    transform: "translateY(-50%)",
    pointerEvents: "none",
    color: "var(--color-text-tertiary)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "var(--color-accent-primary)";
    e.currentTarget.style.boxShadow = `0 0 0 var(--focus-ring-width) var(--color-bg-primary), 0 0 0 calc(var(--focus-ring-width) + var(--focus-ring-offset)) var(--focus-ring-color)`;
    e.currentTarget.style.outline = "none";
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "var(--color-border-default)";
    e.currentTarget.style.boxShadow = "";
  };

  return (
    <div style={wrapperStyle}>
      {label && selectId && (
        <label htmlFor={selectId} style={labelStyle}>
          {label}
        </label>
      )}
      <div style={selectWrapStyle}>
        <select
          id={selectId}
          value={value}
          onChange={handleChange}
          disabled={disabled}
          aria-label={ariaLabel}
          style={selectBaseStyle}
          onFocus={handleFocus}
          onBlur={handleBlur}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span style={caretStyle} aria-hidden="true">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </div>
    </div>
  );
};

export { Select };
export type { SelectOption, SelectProps };
