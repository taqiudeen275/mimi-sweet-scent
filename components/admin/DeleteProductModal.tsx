"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

interface DeleteProductModalProps {
  productId: string;
  productName: string;
}

export function DeleteProductButton({ productId, productName }: DeleteProductModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const res = await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "Failed to delete product");
      }
    });
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Delete product"
        style={{
          background: "none",
          border: "1px solid transparent",
          cursor: "pointer",
          padding: "0.375rem",
          color: "#9CA3AF",
          borderRadius: "2px",
          lineHeight: 1,
          transition: "all 150ms ease",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = "#EF4444";
          e.currentTarget.style.borderColor = "#FCA5A5";
          e.currentTarget.style.background = "#FEF2F2";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = "#9CA3AF";
          e.currentTarget.style.borderColor = "transparent";
          e.currentTarget.style.background = "none";
        }}
      >
        {/* Trash icon */}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6l-1 14H6L5 6" />
          <path d="M10 11v6M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.45)",
          }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div style={{
            background: "var(--color-white)",
            padding: "2rem",
            width: "420px",
            maxWidth: "calc(100vw - 2rem)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
          }}>
            <h2 style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1.5rem",
              fontWeight: 400,
              color: "var(--color-black)",
              margin: "0 0 0.75rem",
            }}>
              Delete Product?
            </h2>
            <p style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.8125rem",
              color: "var(--color-gray-600)",
              margin: "0 0 1.5rem",
              lineHeight: 1.6,
            }}>
              Are you sure you want to delete <strong style={{ color: "var(--color-black)" }}>{productName}</strong>?
              This will permanently remove the product along with all its variants, images, and reviews. This action cannot be undone.
            </p>
            {error && (
              <p style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.75rem",
                color: "#EF4444",
                margin: "0 0 1rem",
              }}>
                {error}
              </p>
            )}
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setOpen(false)}
                disabled={isPending}
                style={{
                  padding: "0.5rem 1.25rem",
                  border: "1px solid var(--color-gray-200)",
                  background: "var(--color-white)",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  color: "var(--color-gray-600)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                style={{
                  padding: "0.5rem 1.25rem",
                  border: "none",
                  background: "#EF4444",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.6875rem",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: isPending ? "not-allowed" : "pointer",
                  color: "#fff",
                  opacity: isPending ? 0.7 : 1,
                }}
              >
                {isPending ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
