"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/contexts/cart-context";
import { formatPrice } from "@/lib/utils";
import type { Metadata } from "next";

// Mobile Money provider options for Ghana
const MOMO_PROVIDERS = [
  { id: "MTN", label: "MTN Mobile Money", color: "#FFCC00" },
  { id: "VODAFONE", label: "Telecel Cash", color: "#E60000" },
  { id: "AIRTELTIGO", label: "AirtelTigo Money", color: "#FF6600" },
] as const;

type Provider = typeof MOMO_PROVIDERS[number]["id"];

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  momoPhone: string;
  provider: Provider;
  address: string;
  city: string;
  country: string;
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    momoPhone: "",
    provider: "MTN",
    address: "",
    city: "",
    country: "Ghana",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "pending">("form");
  const [payRef, setPayRef] = useState<string | null>(null);

  // Redirect if cart empty
  useEffect(() => {
    if (items.length === 0 && step === "form") {
      router.push("/shop");
    }
  }, [items, step, router]);

  const set = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          phone: form.momoPhone,
          provider: form.provider,
          shippingAddress: {
            name: `${form.firstName} ${form.lastName}`,
            line1: form.address,
            city: form.city,
            country: form.country,
            phone: form.phone,
          },
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
            price: i.price,
            productName: i.productName,
            variantLabel: i.variantLabel,
            imageUrl: i.imageUrl,
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      setPayRef(data.reference);
      setStep("pending");
      clearCart();
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  if (step === "pending") {
    return (
      <main style={{
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "4rem 2rem",
        background: "var(--color-cream)",
      }}>
        <div style={{
          maxWidth: "480px",
          width: "100%",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
        }}>
          {/* Spinner */}
          <div style={{
            width: "64px",
            height: "64px",
            border: "2px solid var(--color-gray-200)",
            borderTopColor: "var(--color-primary)",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

          <h1 style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "2rem",
            fontWeight: 400,
            color: "var(--color-black)",
          }}>
            Awaiting Payment
          </h1>
          <p style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.875rem",
            lineHeight: 1.7,
            color: "var(--color-gray-600)",
          }}>
            A payment prompt has been sent to your phone (<strong>{form.momoPhone}</strong>).
            Please approve it on your device to complete your order.
          </p>
          {payRef && (
            <p style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.75rem",
              color: "var(--color-gray-400)",
              letterSpacing: "0.05em",
            }}>
              Reference: {payRef}
            </p>
          )}
          <p style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.75rem",
            color: "var(--color-gray-600)",
            lineHeight: 1.6,
          }}>
            You will receive a confirmation email at <strong>{form.email}</strong> once payment is confirmed.
          </p>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.6875rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "var(--color-primary)",
              textDecoration: "none",
              borderBottom: "1px solid var(--color-primary)",
            }}
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ background: "var(--color-white)", minHeight: "100vh" }}>
      <div style={{
        maxWidth: "1100px",
        margin: "0 auto",
        padding: "3rem 2rem 5rem",
        display: "grid",
        gridTemplateColumns: "1fr 400px",
        gap: "4rem",
        alignItems: "start",
      }}>
        {/* Left: form */}
        <div>
          <h1 style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "2.25rem",
            fontWeight: 400,
            color: "var(--color-black)",
            marginBottom: "2.5rem",
          }}>
            Checkout
          </h1>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
            {/* Contact */}
            <section>
              <SectionTitle>Contact Information</SectionTitle>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Field label="First Name" required>
                  <input
                    className="input"
                    type="text"
                    required
                    value={form.firstName}
                    onChange={(e) => set("firstName", e.target.value)}
                    placeholder="Ama"
                  />
                </Field>
                <Field label="Last Name" required>
                  <input
                    className="input"
                    type="text"
                    required
                    value={form.lastName}
                    onChange={(e) => set("lastName", e.target.value)}
                    placeholder="Mensah"
                  />
                </Field>
              </div>
              <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                <Field label="Email Address" required>
                  <input
                    className="input"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="ama@example.com"
                  />
                </Field>
                <Field label="Phone Number">
                  <input
                    className="input"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="+233 24 000 0000"
                  />
                </Field>
              </div>
            </section>

            {/* Shipping */}
            <section>
              <SectionTitle>Shipping Address</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <Field label="Street Address" required>
                  <input
                    className="input"
                    type="text"
                    required
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="123 Independence Avenue"
                  />
                </Field>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <Field label="City" required>
                    <input
                      className="input"
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => set("city", e.target.value)}
                      placeholder="Accra"
                    />
                  </Field>
                  <Field label="Country">
                    <select
                      className="input"
                      value={form.country}
                      onChange={(e) => set("country", e.target.value)}
                    >
                      <option>Ghana</option>
                      <option>Nigeria</option>
                      <option>Kenya</option>
                      <option>Côte d&apos;Ivoire</option>
                      <option>Other</option>
                    </select>
                  </Field>
                </div>
              </div>
            </section>

            {/* Payment — Mobile Money */}
            <section>
              <SectionTitle>Payment — Mobile Money</SectionTitle>
              <p style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.75rem",
                color: "var(--color-gray-600)",
                marginBottom: "1.25rem",
                lineHeight: 1.6,
              }}>
                Select your network and enter your Mobile Money number. You will receive a payment prompt on your phone.
              </p>

              {/* Provider selection */}
              <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
                {MOMO_PROVIDERS.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => set("provider", p.id)}
                    style={{
                      flex: 1,
                      minWidth: "140px",
                      padding: "0.875rem 1rem",
                      border: form.provider === p.id
                        ? `2px solid var(--color-primary)`
                        : "2px solid var(--color-gray-200)",
                      background: form.provider === p.id ? "rgba(184,134,11,0.06)" : "transparent",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      transition: "all 150ms ease",
                    }}
                  >
                    <span style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      background: p.color,
                      flexShrink: 0,
                    }} />
                    <span style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.6875rem",
                      letterSpacing: "0.05em",
                      color: "var(--color-black)",
                      fontWeight: form.provider === p.id ? 600 : 400,
                    }}>
                      {p.label}
                    </span>
                  </button>
                ))}
              </div>

              <Field label="Mobile Money Number" required>
                <input
                  className="input"
                  type="tel"
                  required
                  value={form.momoPhone}
                  onChange={(e) => set("momoPhone", e.target.value)}
                  placeholder="0241234567"
                />
              </Field>
            </section>

            {error && (
              <div style={{
                background: "#FEF2F2",
                border: "1px solid #FECACA",
                padding: "0.875rem 1rem",
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.8125rem",
                color: "#B91C1C",
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || items.length === 0}
              className="btn btn-primary"
              style={{
                width: "100%",
                padding: "1rem",
                fontSize: "0.75rem",
                letterSpacing: "0.12em",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Processing…" : `Pay ${formatPrice(subtotal)}`}
            </button>

            <p style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.6875rem",
              color: "var(--color-gray-600)",
              textAlign: "center",
              letterSpacing: "0.03em",
            }}>
              By placing your order you agree to our{" "}
              <a href="/terms" style={{ color: "var(--color-primary)", textDecoration: "none" }}>Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" style={{ color: "var(--color-primary)", textDecoration: "none" }}>Privacy Policy</a>.
            </p>
          </form>
        </div>

        {/* Right: order summary */}
        <div style={{
          position: "sticky",
          top: "calc(64px + 2rem)",
          background: "var(--color-cream)",
          padding: "2rem",
        }}>
          <h2 style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1.5rem",
            fontWeight: 400,
            color: "var(--color-black)",
            marginBottom: "1.5rem",
          }}>
            Order Summary
          </h2>

          <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "1rem" }}>
            {items.map((item) => (
              <li key={item.variantId} style={{ display: "flex", gap: "0.75rem", alignItems: "flex-start" }}>
                <div style={{
                  width: "52px",
                  height: "64px",
                  background: "var(--color-white)",
                  flexShrink: 0,
                  overflow: "hidden",
                  position: "relative",
                }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt={item.productName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                  <span style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    background: "var(--color-black)",
                    color: "var(--color-white)",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.625rem",
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontWeight: 600,
                  }}>
                    {item.quantity}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: "0.9375rem",
                    color: "var(--color-black)",
                    margin: 0,
                    lineHeight: 1.3,
                  }}>
                    {item.productName}
                  </p>
                  <p style={{
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.625rem",
                    color: "var(--color-gray-600)",
                    margin: "0.25rem 0 0",
                    letterSpacing: "0.05em",
                  }}>
                    {item.variantLabel}
                  </p>
                </div>
                <span style={{
                  fontFamily: "var(--font-cormorant), Georgia, serif",
                  fontSize: "0.9375rem",
                  color: "var(--color-black)",
                  flexShrink: 0,
                }}>
                  {formatPrice(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>

          <div style={{ borderTop: "1px solid var(--color-gray-200)", marginTop: "1.5rem", paddingTop: "1.25rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.625rem" }}>
              <span style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.6875rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-gray-600)",
              }}>
                Subtotal
              </span>
              <span style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.0625rem",
                color: "var(--color-black)",
              }}>
                {formatPrice(subtotal)}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1.25rem" }}>
              <span style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.6875rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-gray-600)",
              }}>
                Shipping
              </span>
              <span style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.6875rem",
                color: "var(--color-gray-600)",
              }}>
                Calculated at next step
              </span>
            </div>
            <div style={{ borderTop: "1px solid var(--color-gray-200)", paddingTop: "1rem", display: "flex", justifyContent: "space-between" }}>
              <span style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.6875rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "var(--color-black)",
                fontWeight: 600,
              }}>
                Total
              </span>
              <span style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.5rem",
                fontWeight: 300,
                color: "var(--color-black)",
              }}>
                {formatPrice(subtotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "var(--font-montserrat), sans-serif",
      fontSize: "0.6875rem",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: "var(--color-black)",
      fontWeight: 600,
      marginBottom: "1.25rem",
    }}>
      {children}
    </h2>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
      <label style={{
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: "0.625rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: "var(--color-gray-600)",
        fontWeight: 500,
      }}>
        {label}{required && <span style={{ color: "var(--color-primary)", marginLeft: "0.25rem" }}>*</span>}
      </label>
      {children}
    </div>
  );
}
