"use client";

import { useCart } from "@/contexts/cart-context";

export function ToastContainer() {
  const { toasts, dismissToast } = useCart();

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: "1.5rem",
      right: "1.5rem",
      zIndex: 100,
      display: "flex",
      flexDirection: "column",
      gap: "0.625rem",
      pointerEvents: "none",
    }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="toast"
          style={{
            background: toast.type === "error"
              ? "var(--color-error)"
              : toast.type === "info"
                ? "var(--color-black)"
                : "var(--color-success)",
            color: "var(--color-white)",
            padding: "0.875rem 1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.875rem",
            boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
            pointerEvents: "auto",
            minWidth: "260px",
            maxWidth: "340px",
          }}
        >
          <span style={{ fontSize: "1rem", flexShrink: 0 }}>
            {toast.type === "error" ? "✕" : toast.type === "info" ? "ℹ" : "✓"}
          </span>
          <span style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.75rem",
            letterSpacing: "0.03em",
            flex: 1,
            lineHeight: 1.4,
          }}>
            {toast.message}
          </span>
          <button
            onClick={() => dismissToast(toast.id)}
            style={{
              background: "none", border: "none",
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              padding: "0.125rem",
              fontSize: "0.875rem",
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
