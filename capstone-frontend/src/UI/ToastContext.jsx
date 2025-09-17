import React, { createContext, useContext, useCallback, useState } from "react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback(
    (message, opts = {}) => {
      const id =
        (globalThis.crypto && crypto.randomUUID && crypto.randomUUID()) ||
        String(Date.now() + Math.random());
      const timeout = opts.timeout ?? 3000;
      setToasts((t) => [...t, { id, message }]);
      if (timeout) setTimeout(() => dismiss(id), timeout);
      return id;
    },
    [dismiss]
  );

  const value = { show, dismiss };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* simple toast UI */}
      <div
        style={{
          position: "fixed",
          right: 16,
          bottom: 16,
          display: "grid",
          gap: 8,
          zIndex: 50,
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            style={{
              background: "#111827",
              color: "white",
              padding: "10px 12px",
              borderRadius: 12,
              boxShadow: "0 4px 16px rgba(0,0,0,.25)",
              display: "flex",
              alignItems: "center",
            }}
          >
            <span>{t.message}</span>
            <button
              onClick={() => dismiss(t.id)}
              style={{
                marginLeft: 12,
                background: "transparent",
                border: "none",
                color: "white",
                cursor: "pointer",
                fontSize: 18,
                lineHeight: 1,
              }}
              aria-label="Dismiss"
              title="Dismiss"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
