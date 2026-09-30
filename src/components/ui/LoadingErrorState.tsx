import React from "react";
import { Button } from "./Button";

export interface LoadingErrorStateProps {
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  loadingMessage?: string;
  errorTitle?: string;
  children: React.ReactNode;
}

const spinnerStyle: React.CSSProperties = {
  width: "2.5rem",
  height: "2.5rem",
  border: "3px solid var(--color-border-default)",
  borderTopColor: "var(--color-accent-primary)",
  borderRadius: "50%",
  animation: "ui-les-spin 0.8s linear infinite",
};

const LoadingErrorState: React.FC<LoadingErrorStateProps> = ({
  loading,
  error,
  onRetry,
  loadingMessage = "Loading...",
  errorTitle = "Something went wrong",
  children,
}) => {
  const wrapperStyle: React.CSSProperties = {
    width: "100%",
    fontFamily: "var(--font-family-sans)",
  };

  const centerWrap: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "var(--spacing-12) var(--spacing-6)",
    gap: "var(--spacing-4)",
  };

  const iconCircleStyle: React.CSSProperties = {
    width: "4rem",
    height: "4rem",
    borderRadius: "var(--radius-full)",
    backgroundColor: "var(--color-danger-bg)",
    color: "var(--color-danger-text)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "var(--font-size-2xl)",
    fontWeight: "var(--font-weight-bold)",
    marginBottom: "var(--spacing-1)",
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
    maxWidth: "28rem",
  };

  const loadingLabelStyle: React.CSSProperties = {
    color: "var(--color-text-secondary)",
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    lineHeight: "var(--line-height-normal)",
    marginTop: "var(--spacing-2)",
  };

  if (loading) {
    return (
      <div style={wrapperStyle} role="status" aria-live="polite">
        <div style={centerWrap}>
          <style>{`@keyframes ui-les-spin { to { transform: rotate(360deg); } }`}</style>
          <div
            style={spinnerStyle}
            aria-hidden="true"
            role="progressbar"
          />
          <span style={loadingLabelStyle}>{loadingMessage}</span>
        </div>
      </div>
    );
  }

  if (error !== null && error !== undefined && error !== "") {
    return (
      <div style={wrapperStyle} role="alert" aria-live="assertive">
        <div style={centerWrap}>
          <div style={iconCircleStyle} aria-hidden="true">
            !
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--spacing-2)",
              alignItems: "center",
            }}
          >
            <h3 style={titleStyle}>{errorTitle}</h3>
            <p style={descriptionStyle}>{error}</p>
          </div>
          <div style={{ marginTop: "var(--spacing-2)" }}>
            <Button variant="primary" onClick={onRetry} ariaLabel="Retry the failed action">
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export { LoadingErrorState };
