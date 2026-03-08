import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order Confirmed — Mimi's Sweet Scent" };

interface Props {
  searchParams: Promise<{ ref?: string }>;
}

export default async function CheckoutSuccessPage({ searchParams }: Props) {
  const { ref } = await searchParams;

  return (
    <main style={{
      minHeight: "80vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "4rem 2rem",
      background: "var(--color-cream)",
    }}>
      <style>{`
        @keyframes checkDraw {
          from { stroke-dashoffset: 100; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes circlePop {
          0%   { transform: scale(0.7); opacity: 0; }
          60%  { transform: scale(1.08); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .success-circle { animation: circlePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
        .success-check  { stroke-dasharray: 100; animation: checkDraw 0.45s ease 0.35s both; }
        .success-body > * { animation: fadeUp 0.5s ease both; }
        .success-body > *:nth-child(1) { animation-delay: 0.55s; }
        .success-body > *:nth-child(2) { animation-delay: 0.68s; }
        .success-body > *:nth-child(3) { animation-delay: 0.78s; }
        .success-body > *:nth-child(4) { animation-delay: 0.88s; }
        .success-body > *:nth-child(5) { animation-delay: 0.98s; }
      `}</style>

      <div style={{
        maxWidth: "480px",
        width: "100%",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "1.5rem",
      }}>
        {/* Animated checkmark */}
        <div className="success-circle" style={{
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: "rgba(184,134,11,0.1)",
          border: "2px solid var(--color-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <polyline
              className="success-check"
              points="7,18 15,26 29,10"
              stroke="var(--color-primary)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="success-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
          <h1 style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "2.25rem",
            fontWeight: 400,
            color: "var(--color-black)",
            margin: 0,
            lineHeight: 1.2,
          }}>
            Order Placed
          </h1>

          <p style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.875rem",
            lineHeight: 1.7,
            color: "var(--color-gray-600)",
            margin: 0,
            maxWidth: "360px",
          }}>
            Thank you for your order. A payment prompt has been sent to your phone — please approve it to complete your purchase.
            You will receive a confirmation email once payment is verified.
          </p>

          {ref && (
            <div style={{
              background: "var(--color-white)",
              border: "1px solid var(--color-gray-200)",
              padding: "0.875rem 1.5rem",
              width: "100%",
            }}>
              <p style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.5625rem",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "var(--color-gray-600)",
                margin: "0 0 0.375rem",
              }}>
                Payment Reference
              </p>
              <p style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.125rem",
                color: "var(--color-black)",
                margin: 0,
                letterSpacing: "0.05em",
              }}>
                {ref}
              </p>
            </div>
          )}

          <div style={{
            background: "rgba(184,134,11,0.06)",
            border: "1px solid rgba(184,134,11,0.2)",
            padding: "1rem 1.25rem",
            width: "100%",
            textAlign: "left",
          }}>
            <p style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.6875rem",
              color: "var(--color-black)",
              lineHeight: 1.7,
              margin: 0,
            }}>
              <strong style={{ color: "var(--color-primary)" }}>What happens next?</strong><br />
              Your phone will receive a Mobile Money prompt. Approve it within 2 minutes to secure your order.
              Orders pending payment for more than 30 minutes are automatically cancelled.
            </p>
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
            <Link
              href="/account/orders"
              style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.6875rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                background: "var(--color-black)",
                color: "var(--color-white)",
                padding: "0.875rem 1.75rem",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              View My Orders
            </Link>
            <Link
              href="/shop"
              style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.6875rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                border: "1px solid var(--color-gray-200)",
                color: "var(--color-black)",
                padding: "0.875rem 1.75rem",
                textDecoration: "none",
                fontWeight: 500,
              }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
