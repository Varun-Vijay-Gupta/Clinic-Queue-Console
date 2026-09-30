import React from "react";
import { useToast, ToastItem } from "./Toast";

const ToastContainer: React.FC = () => {
  const { toasts, hideToast } = useToast();

  const containerStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "var(--spacing-6)",
    right: "var(--spacing-6)",
    zIndex: "var(--z-toast)",
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-3)",
    pointerEvents: "none",
    width: "100%",
    maxWidth: "24rem",
  };

  const itemWrapStyle: React.CSSProperties = {
    pointerEvents: "auto",
  };

  if (toasts.length === 0) return null;

  return (
    <div
      style={containerStyle}
      aria-label="Notifications"
      role="region"
    >
      {toasts.map((toast) => (
        <div key={toast.id} style={itemWrapStyle}>
          <ToastItem toast={toast} onClose={() => hideToast(toast.id)} />
        </div>
      ))}
    </div>
  );
};

export { ToastContainer };
