"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { formatPrice } from "@/lib/utils";

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

  const [discountCode, setDiscountCode]       = useState("");
  const [discountApplied, setDiscountApplied] = useState<{ code: string; discountAmount: number; finalTotal: number; type: string } | null>(null);
  const [discountError, setDiscountError]     = useState<string | null>(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);

  // Redirect if cart empty
  useEffect(() => {
    if (items.length === 0) {
      router.push("/shop");
    }
  }, [items, router]);

  const set = (key: keyof FormState, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const applyDiscount = async () => {
    if (!discountCode.trim()) return;
    setApplyingDiscount(true);
    setDiscountError(null);
    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: discountCode, orderTotal: subtotal }),
      });
      const data = await res.json();
      if (!res.ok) {
        setDiscountError(data.error ?? "Invalid code");
        setDiscountApplied(null);
      } else {
        setDiscountApplied(data);
        setDiscountError(null);
      }
    } catch {
      setDiscountError("Could not apply code. Please try again.");
    } finally {
      setApplyingDiscount(false);
    }
  };

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
          discountCode: discountApplied?.code ?? undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }

      clearCart();
      router.push(`/checkout/success?ref=${encodeURIComponent(data.reference)}`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setSubmitting(false);
    }
  };


  return (
    <main style={{ background: "var(--color-white)", minHeight: "100vh" }}>
      <style>{`
        @media (max-width: 860px) {
          .checkout-grid { grid-template-columns: 1fr !important; }
          .checkout-summary { position: static !important; }
        }
        @media (max-width: 560px) {
          .checkout-name-row, .checkout-contact-row, .checkout-city-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <div className="checkout-grid" style={{
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
              <div className="checkout-name-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
              <div className="checkout-contact-row" style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
                <div className="checkout-city-row" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
                background: "var(--error-bg)",
                border: "1px solid var(--error-border)",
                padding: "0.875rem 1rem",
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.8125rem",
                color: "var(--error-text)",
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
              {submitting ? "Processing…" : `Pay ${formatPrice(discountApplied?.finalTotal ?? subtotal)}`}
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
        <div className="checkout-summary" style={{
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

            {/* Discount code */}
            <div style={{ marginBottom: "1rem" }}>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <input
                  type="text"
                  placeholder="Discount code"
                  value={discountCode}
                  onChange={e => { setDiscountCode(e.target.value.toUpperCase()); setDiscountApplied(null); setDiscountError(null); }}
                  style={{
                    flex: 1, padding: "0.625rem 0.875rem",
                    border: `1px solid ${discountApplied ? "#16A34A" : "var(--color-gray-200)"}`,
                    background: "var(--color-white)", color: "var(--color-black)",
                    fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem",
                    letterSpacing: "0.08em", textTransform: "uppercase",
                  }}
                />
                <button
                  type="button"
                  onClick={applyDiscount}
                  disabled={applyingDiscount || !discountCode.trim()}
                  style={{
                    padding: "0.625rem 1.25rem", background: "var(--color-primary)", color: "#fff",
                    border: "none", cursor: "pointer", fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.5625rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600,
                    opacity: applyingDiscount || !discountCode.trim() ? 0.5 : 1,
                  }}
                >{applyingDiscount ? "..." : "Apply"}</button>
              </div>
              {discountError && (
                <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", color: "var(--color-error, #EF4444)", marginTop: "0.375rem" }}>
                  {discountError}
                </p>
              )}
              {discountApplied && (
                <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", color: "#16A34A", marginTop: "0.375rem" }}>
                  ✓ {discountApplied.code} applied — saving {formatPrice(discountApplied.discountAmount)}
                </p>
              )}
            </div>
            {/* Show discount line in summary if applied */}
            {discountApplied && (
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", color: "#16A34A" }}>Discount ({discountApplied.code})</span>
                <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", color: "#16A34A" }}>−{formatPrice(discountApplied.discountAmount)}</span>
              </div>
            )}

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
                {formatPrice(discountApplied?.finalTotal ?? subtotal)}
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
