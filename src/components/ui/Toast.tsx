import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ToastMessage } from "../../types";
import { Button } from "./Button";

type ToastType = ToastMessage["type"];

interface ToastContextValue {
  toasts: ToastMessage[];
  showToast: (
    message: Omit<ToastMessage, "id"> & { id?: string }
  ) => string;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const genToastId = () =>
  `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const variantStyles: Record<
  ToastType,
  { bg: string; border: string; text: string; accent: string; iconBg: string }
> = {
  success: {
    bg: "var(--color-success-bg)",
    border: "var(--color-success-border)",
    text: "var(--color-success-text)",
    accent: "var(--color-success-text)",
    iconBg: "var(--color-success-border)",
  },
  error: {
    bg: "var(--color-danger-bg)",
    border: "var(--color-danger-border)",
    text: "var(--color-danger-text)",
    accent: "var(--color-danger-text)",
    iconBg: "var(--color-danger-border)",
  },
  info: {
    bg: "var(--color-info-bg)",
    border: "var(--color-info-border)",
    text: "var(--color-info-text)",
    accent: "var(--color-info-text)",
    iconBg: "var(--color-info-border)",
  },
};

const typeIcons: Record<ToastType, string> = {
  success: "✓",
  error: "!",
  info: "i",
};

interface ToastProviderProps {
  children: React.ReactNode;
}

const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const clearTimer = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const hideToast = useCallback(
    (id: string) => {
      clearTimer(id);
      setToasts((prev) => prev.filter((t) => t.id !== id));
    },
    [clearTimer]
  );

  const scheduleDismiss = useCallback(
    (id: string, type: ToastType) => {
      clearTimer(id);
      if (type === "error") return;
      const duration = 5000;
      const timer = setTimeout(() => {
        hideToast(id);
      }, duration);
      timersRef.current.set(id, timer);
    },
    [clearTimer, hideToast]
  );

  const showToast = useCallback(
    (message: Omit<ToastMessage, "id"> & { id?: string }): string => {
      const id = message.id ?? genToastId();
      const toast: ToastMessage = {
        id,
        type: message.type,
        message: message.message,
        retryAction: message.retryAction,
        retryLabel: message.retryLabel,
      };
      setToasts((prev) => [...prev, toast]);
      scheduleDismiss(id, toast.type);
      return id;
    },
    [scheduleDismiss]
  );

  const contextValue = useMemo<ToastContextValue>(
    () => ({ toasts, showToast, hideToast }),
    [toasts, showToast, hideToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>{children}</ToastContext.Provider>
  );
};

const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
};

interface ToastItemProps {
  toast: ToastMessage;
  onClose: () => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onClose }) => {
  const { type, message, retryAction, retryLabel } = toast;
  const style = variantStyles[type];
  const [mounted, setMounted] = useState(false);
  const [leaving, setLeaving] = useState(false);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const handleClose = () => {
    setLeaving(true);
    setTimeout(onClose, 200);
  };

  const handleRetry = () => {
    if (retryAction) {
      retryAction();
    }
    handleClose();
  };

  const containerBase: React.CSSProperties = {
    width: "100%",
    maxWidth: "24rem",
    backgroundColor: style.bg,
    border: "1px solid",
    borderColor: style.border,
    borderRadius: "var(--radius-lg)",
    boxShadow: "var(--shadow-lg)",
    padding: "var(--spacing-4)",
    display: "flex",
    gap: "var(--spacing-3)",
    alignItems: "flex-start",
    fontFamily: "var(--font-family-sans)",
    position: "relative",
    overflow: "hidden",
    transform: mounted && !leaving ? "translateX(0)" : "translateX(120%)",
    opacity: mounted && !leaving ? 1 : 0,
    transition:
      "transform var(--transition-normal), opacity var(--transition-normal)",
  };

  const iconWrap: React.CSSProperties = {
    width: "1.75rem",
    height: "1.75rem",
    borderRadius: "var(--radius-full)",
    backgroundColor: style.iconBg,
    color: style.accent,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    fontWeight: "var(--font-weight-bold)",
    fontSize: "var(--font-size-sm)",
  };

  const contentWrap: React.CSSProperties = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "var(--spacing-2)",
    minWidth: 0,
  };

  const messageStyle: React.CSSProperties = {
    color: style.text,
    fontSize: "var(--font-size-sm)",
    fontWeight: "var(--font-weight-medium)",
    lineHeight: "var(--line-height-relaxed)",
    margin: 0,
    wordBreak: "break-word",
  };

  const closeBtnBase: React.CSSProperties = {
    background: "transparent",
    border: "none",
    cursor: "pointer",
    padding: "var(--spacing-1)",
    margin: "calc(var(--spacing-0-5) * -1)",
    color: style.text,
    borderRadius: "var(--radius-sm)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "var(--font-size-base)",
    lineHeight: 1,
    opacity: 0.7,
    transition: "opacity var(--transition-fast), background-color var(--transition-fast)",
    flexShrink: 0,
  };

  const closeFocus: React.CSSProperties = {
    outline: "none",
    boxShadow: `0 0 0 var(--focus-ring-width) var(--color-bg-primary), 0 0 0 calc(var(--focus-ring-width) + var(--focus-ring-offset)) var(--focus-ring-color)`,
  };

  return (
    <div
      role="alert"
      aria-live={type === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      style={containerBase}
    >
      <div style={iconWrap} aria-hidden="true">
        {typeIcons[type]}
      </div>
      <div style={contentWrap}>
        <p style={messageStyle}>{message}</p>
        {type === "error" && retryAction && (
          <div style={{ marginTop: "var(--spacing-1)" }}>
            <Button
              variant="danger"
              size="sm"
              onClick={handleRetry}
              ariaLabel={retryLabel ?? "Retry action"}
            >
              {retryLabel ?? "Retry"}
            </Button>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={handleClose}
        aria-label={`Close ${type} notification`}
        style={closeBtnBase}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
        onFocus={(e) => Object.assign(e.currentTarget.style, closeFocus)}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = "";
        }}
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
};

export { ToastProvider, useToast, ToastItem };
export type { ToastContextValue, ToastProviderProps, ToastItemProps };
