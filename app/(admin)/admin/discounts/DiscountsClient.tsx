"use client";

import { useState, useCallback } from "react";

type DiscountType = "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";

interface Discount {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minOrderValue: number | null;
  usageLimit: number | null;
  usageCount: number;
  expiresAt: string | null;
  active: boolean;
  createdAt: string;
}

interface Stats {
  total: number;
  active: number;
  redemptions: number;
}

interface FormState {
  code: string;
  type: DiscountType;
  value: string;
  minOrderValue: string;
  usageLimit: string;
  expiresAt: string;
  active: boolean;
}

const EMPTY_FORM: FormState = {
  code: "",
  type: "PERCENTAGE",
  value: "",
  minOrderValue: "",
  usageLimit: "",
  expiresAt: "",
  active: true,
};

function generateCode() {
  const words = ["MIMI", "SCENT", "LUXE", "BLOOM", "GOLD", "PEARL"];
  const word = words[Math.floor(Math.random() * words.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${word}${num}`;
}

function formatValue(type: DiscountType, value: number): string {
  if (type === "FREE_SHIPPING") return "Free Shipping";
  if (type === "PERCENTAGE") return `${value}%`;
  return `₵${(value / 100).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatGHS(pesewas: number | null): string {
  if (pesewas == null) return "—";
  return `₵${(pesewas / 100).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const TH_STYLE: React.CSSProperties = {
  padding: "0.875rem 1.25rem",
  textAlign: "left",
  fontFamily: "var(--font-montserrat), sans-serif",
  fontSize: "0.5625rem",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "var(--color-gray-600)",
  fontWeight: 500,
  whiteSpace: "nowrap",
};

const TD_STYLE: React.CSSProperties = {
  padding: "0.875rem 1.25rem",
  verticalAlign: "middle",
};

const LABEL_STYLE: React.CSSProperties = {
  fontFamily: "var(--font-montserrat), sans-serif",
  fontSize: "0.5625rem",
  letterSpacing: "0.1em",
  textTransform: "uppercase",
  color: "var(--color-gray-600)",
  fontWeight: 600,
  display: "block",
  marginBottom: "0.375rem",
};

const INPUT_STYLE: React.CSSProperties = {
  width: "100%",
  padding: "0.625rem 0.75rem",
  fontFamily: "var(--font-montserrat), sans-serif",
  fontSize: "0.8125rem",
  color: "var(--color-black)",
  background: "var(--color-white)",
  border: "1px solid var(--color-gray-200)",
  outline: "none",
  boxSizing: "border-box",
};

export function DiscountsClient({
  initialDiscounts,
  stats,
}: {
  initialDiscounts: Discount[];
  stats: Stats;
}) {
  const [discounts, setDiscounts] = useState<Discount[]>(initialDiscounts);
  const [currentStats, setCurrentStats] = useState<Stats>(stats);
  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const recomputeStats = useCallback((list: Discount[]) => {
    setCurrentStats({
      total: list.length,
      active: list.filter((d) => d.active).length,
      redemptions: list.reduce((s, d) => s + d.usageCount, 0),
    });
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setPanelOpen(true);
  }

  function openEdit(discount: Discount) {
    setEditingId(discount.id);
    setForm({
      code: discount.code,
      type: discount.type,
      value:
        discount.type === "FREE_SHIPPING"
          ? ""
          : discount.type === "FIXED"
          ? String(discount.value / 100)
          : String(discount.value),
      minOrderValue: discount.minOrderValue != null ? String(discount.minOrderValue / 100) : "",
      usageLimit: discount.usageLimit != null ? String(discount.usageLimit) : "",
      expiresAt: discount.expiresAt
        ? new Date(discount.expiresAt).toISOString().slice(0, 16)
        : "",
      active: discount.active,
    });
    setError(null);
    setPanelOpen(true);
  }

  function closePanel() {
    setPanelOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: form.type === "FREE_SHIPPING" ? 0 : parseFloat(form.value) || 0,
      minOrderValue: form.minOrderValue !== "" ? parseFloat(form.minOrderValue) : null,
      usageLimit: form.usageLimit !== "" ? parseInt(form.usageLimit, 10) : null,
      expiresAt: form.expiresAt !== "" ? form.expiresAt : null,
      active: form.active,
    };

    try {
      let res: Response;
      if (editingId) {
        res = await fetch(`/api/admin/discounts/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/admin/discounts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const data = (await res.json()) as Discount & { error?: string };

      if (!res.ok) {
        setError(data.error ?? "An error occurred");
        return;
      }

      if (editingId) {
        const updated = discounts.map((d) => (d.id === editingId ? data : d));
        setDiscounts(updated);
        recomputeStats(updated);
      } else {
        const updated = [data, ...discounts];
        setDiscounts(updated);
        recomputeStats(updated);
      }

      closePanel();
    } catch {
      setError("Network error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/discounts/${id}`, { method: "DELETE" });
      if (res.ok) {
        const updated = discounts.filter((d) => d.id !== id);
        setDiscounts(updated);
        recomputeStats(updated);
      }
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
    }
  }

  async function handleToggle(discount: Discount) {
    setTogglingId(discount.id);
    try {
      const res = await fetch(`/api/admin/discounts/${discount.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !discount.active }),
      });
      if (res.ok) {
        const updated = discounts.map((d) =>
          d.id === discount.id ? { ...d, active: !d.active } : d
        );
        setDiscounts(updated);
        recomputeStats(updated);
      }
    } finally {
      setTogglingId(null);
    }
  }

  const isExpired = (expiresAt: string | null) =>
    expiresAt ? new Date(expiresAt) < new Date() : false;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "2rem",
            fontWeight: 400,
            color: "var(--color-black)",
            margin: 0,
          }}>
            Discounts
          </h1>
          <p style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.6875rem",
            color: "var(--color-gray-600)",
            marginTop: "0.25rem",
            letterSpacing: "0.03em",
          }}>
            Manage promotional codes and offers
          </p>
        </div>
        <button
          onClick={openCreate}
          style={{
            background: "var(--color-black)",
            color: "var(--color-white)",
            border: "none",
            padding: "0.625rem 1.25rem",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.625rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          + Create New
        </button>
      </div>

      {/* Summary stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
        {[
          { label: "Total Codes", value: currentStats.total },
          { label: "Active Codes", value: currentStats.active },
          { label: "Total Redemptions", value: currentStats.redemptions },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: "var(--color-white)",
            padding: "1.25rem 1.5rem",
            border: "1px solid var(--color-gray-200)",
          }}>
            <p style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.5625rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--color-gray-600)",
              fontWeight: 500,
              marginBottom: "0.5rem",
            }}>
              {label}
            </p>
            <p style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "2rem",
              fontWeight: 300,
              color: "var(--color-black)",
              lineHeight: 1,
            }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "var(--color-white)", border: "1px solid var(--color-gray-200)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-gray-200)", background: "#FAFAFA" }}>
              {["Code", "Type", "Value", "Min Order", "Usage", "Expires", "Status", "Actions"].map((h) => (
                <th key={h} style={TH_STYLE}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {discounts.length === 0 ? (
              <tr>
                <td colSpan={8} style={{
                  padding: "3rem",
                  textAlign: "center",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.8125rem",
                  color: "var(--color-gray-400)",
                }}>
                  No discount codes yet. Create your first one.
                </td>
              </tr>
            ) : (
              discounts.map((discount, i) => {
                const expired = isExpired(discount.expiresAt);
                const isConfirmingDelete = confirmDeleteId === discount.id;

                return (
                  <tr
                    key={discount.id}
                    style={{
                      borderBottom: i < discounts.length - 1 ? "1px solid var(--color-gray-200)" : "none",
                      background: expired && discount.active ? "#FFFBEB" : "transparent",
                    }}
                  >
                    {/* Code */}
                    <td style={TD_STYLE}>
                      <button
                        onClick={() => openEdit(discount)}
                        style={{
                          background: "none",
                          border: "none",
                          padding: 0,
                          cursor: "pointer",
                          fontFamily: "var(--font-montserrat), sans-serif",
                          fontSize: "0.8125rem",
                          fontWeight: 600,
                          color: "var(--color-primary)",
                          letterSpacing: "0.05em",
                          textAlign: "left",
                        }}
                      >
                        {discount.code}
                      </button>
                    </td>

                    {/* Type */}
                    <td style={TD_STYLE}>
                      <span style={{
                        fontFamily: "var(--font-montserrat), sans-serif",
                        fontSize: "0.5625rem",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        padding: "0.2rem 0.5rem",
                        background:
                          discount.type === "PERCENTAGE" ? "#EDE9FE"
                          : discount.type === "FIXED" ? "#D1FAE5"
                          : "#FEF3C7",
                        color:
                          discount.type === "PERCENTAGE" ? "#7C3AED"
                          : discount.type === "FIXED" ? "#065F46"
                          : "#92400E",
                      }}>
                        {discount.type === "FREE_SHIPPING" ? "Free Ship" : discount.type}
                      </span>
                    </td>

                    {/* Value */}
                    <td style={TD_STYLE}>
                      <span style={{
                        fontFamily: "var(--font-cormorant), Georgia, serif",
                        fontSize: "1rem",
                        color: "var(--color-black)",
                      }}>
                        {formatValue(discount.type, discount.value)}
                      </span>
                    </td>

                    {/* Min Order */}
                    <td style={TD_STYLE}>
                      <span style={{
                        fontFamily: "var(--font-montserrat), sans-serif",
                        fontSize: "0.75rem",
                        color: "var(--color-gray-600)",
                      }}>
                        {formatGHS(discount.minOrderValue)}
                      </span>
                    </td>

                    {/* Usage */}
                    <td style={TD_STYLE}>
                      <span style={{
                        fontFamily: "var(--font-montserrat), sans-serif",
                        fontSize: "0.75rem",
                        color: "var(--color-gray-600)",
                      }}>
                        {discount.usageCount}
                        {discount.usageLimit != null ? ` / ${discount.usageLimit}` : " / ∞"}
                      </span>
                    </td>

                    {/* Expires */}
                    <td style={TD_STYLE}>
                      <span style={{
                        fontFamily: "var(--font-montserrat), sans-serif",
                        fontSize: "0.6875rem",
                        color: expired ? "#EF4444" : "var(--color-gray-600)",
                        fontWeight: expired ? 600 : 400,
                      }}>
                        {discount.expiresAt
                          ? new Date(discount.expiresAt).toLocaleDateString("en-GH", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Never"}
                        {expired && " (expired)"}
                      </span>
                    </td>

                    {/* Status toggle */}
                    <td style={TD_STYLE}>
                      <button
                        onClick={() => handleToggle(discount)}
                        disabled={togglingId === discount.id}
                        style={{
                          position: "relative",
                          display: "inline-block",
                          width: "40px",
                          height: "22px",
                          borderRadius: "11px",
                          background: discount.active ? "var(--color-primary)" : "#D1D5DB",
                          border: "none",
                          cursor: "pointer",
                          transition: "background 200ms ease",
                          flexShrink: 0,
                          opacity: togglingId === discount.id ? 0.6 : 1,
                        }}
                        title={discount.active ? "Deactivate" : "Activate"}
                      >
                        <span style={{
                          position: "absolute",
                          top: "3px",
                          left: discount.active ? "21px" : "3px",
                          width: "16px",
                          height: "16px",
                          borderRadius: "50%",
                          background: "white",
                          transition: "left 200ms ease",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                        }} />
                      </button>
                    </td>

                    {/* Actions */}
                    <td style={TD_STYLE}>
                      {isConfirmingDelete ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          <span style={{
                            fontFamily: "var(--font-montserrat), sans-serif",
                            fontSize: "0.625rem",
                            color: "var(--color-gray-600)",
                          }}>
                            Sure?
                          </span>
                          <button
                            onClick={() => handleDelete(discount.id)}
                            disabled={deletingId === discount.id}
                            style={{
                              background: "#EF4444",
                              color: "white",
                              border: "none",
                              padding: "0.2rem 0.5rem",
                              fontFamily: "var(--font-montserrat), sans-serif",
                              fontSize: "0.5625rem",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              cursor: "pointer",
                              fontWeight: 600,
                            }}
                          >
                            {deletingId === discount.id ? "..." : "Delete"}
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            style={{
                              background: "none",
                              border: "1px solid var(--color-gray-200)",
                              padding: "0.2rem 0.5rem",
                              fontFamily: "var(--font-montserrat), sans-serif",
                              fontSize: "0.5625rem",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              cursor: "pointer",
                              color: "var(--color-gray-600)",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button
                            onClick={() => openEdit(discount)}
                            style={{
                              background: "none",
                              border: "1px solid var(--color-gray-200)",
                              padding: "0.25rem 0.625rem",
                              fontFamily: "var(--font-montserrat), sans-serif",
                              fontSize: "0.5625rem",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              cursor: "pointer",
                              color: "var(--color-gray-600)",
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(discount.id)}
                            style={{
                              background: "none",
                              border: "1px solid #FECACA",
                              padding: "0.25rem 0.625rem",
                              fontFamily: "var(--font-montserrat), sans-serif",
                              fontSize: "0.5625rem",
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              cursor: "pointer",
                              color: "#EF4444",
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Slide-in panel */}
      {panelOpen && (
        <>
          {/* Overlay */}
          <div
            onClick={closePanel}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
              zIndex: 50,
            }}
          />

          {/* Panel */}
          <div style={{
            position: "fixed",
            top: 0,
            right: 0,
            height: "100vh",
            width: "420px",
            background: "var(--color-white)",
            zIndex: 51,
            display: "flex",
            flexDirection: "column",
            boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
            overflowY: "auto",
          }}>
            {/* Panel header */}
            <div style={{
              padding: "1.5rem",
              borderBottom: "1px solid var(--color-gray-200)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexShrink: 0,
            }}>
              <h2 style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1.375rem",
                fontWeight: 400,
                color: "var(--color-black)",
                margin: 0,
              }}>
                {editingId ? "Edit Discount" : "New Discount Code"}
              </h2>
              <button
                onClick={closePanel}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.25rem",
                  color: "var(--color-gray-600)",
                  lineHeight: 1,
                  padding: "0.25rem",
                }}
              >
                ×
              </button>
            </div>

            {/* Panel body */}
            <div style={{ flex: 1, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {error && (
                <div style={{
                  padding: "0.75rem 1rem",
                  background: "#FEF2F2",
                  border: "1px solid #FECACA",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.75rem",
                  color: "#EF4444",
                }}>
                  {error}
                </div>
              )}

              {/* Code */}
              <div>
                <label style={LABEL_STYLE}>Code *</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. MIMI2024"
                    style={{ ...INPUT_STYLE, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, code: generateCode() })}
                    style={{
                      background: "var(--color-cream)",
                      border: "1px solid var(--color-gray-200)",
                      padding: "0 0.875rem",
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.5625rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      cursor: "pointer",
                      color: "var(--color-gray-600)",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Generate
                  </button>
                </div>
              </div>

              {/* Type */}
              <div>
                <label style={LABEL_STYLE}>Discount Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as DiscountType })}
                  style={{ ...INPUT_STYLE }}
                >
                  <option value="PERCENTAGE">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (GHS)</option>
                  <option value="FREE_SHIPPING">Free Shipping</option>
                </select>
              </div>

              {/* Value */}
              {form.type !== "FREE_SHIPPING" && (
                <div>
                  <label style={LABEL_STYLE}>
                    {form.type === "PERCENTAGE" ? "Percentage (1–100)" : "Amount (GHS)"} *
                  </label>
                  <input
                    type="number"
                    value={form.value}
                    onChange={(e) => setForm({ ...form, value: e.target.value })}
                    min={1}
                    max={form.type === "PERCENTAGE" ? 100 : undefined}
                    step={form.type === "FIXED" ? "0.01" : "1"}
                    placeholder={form.type === "PERCENTAGE" ? "e.g. 20" : "e.g. 50.00"}
                    style={INPUT_STYLE}
                  />
                </div>
              )}

              {/* Min Order Value */}
              <div>
                <label style={LABEL_STYLE}>Min Order Value (GHS)</label>
                <input
                  type="number"
                  value={form.minOrderValue}
                  onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
                  min={0}
                  step="0.01"
                  placeholder="Optional — leave blank for no minimum"
                  style={INPUT_STYLE}
                />
              </div>

              {/* Usage Limit */}
              <div>
                <label style={LABEL_STYLE}>Usage Limit</label>
                <input
                  type="number"
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                  min={1}
                  step="1"
                  placeholder="Leave blank for unlimited"
                  style={INPUT_STYLE}
                />
              </div>

              {/* Expires At */}
              <div>
                <label style={LABEL_STYLE}>Expires At</label>
                <input
                  type="datetime-local"
                  value={form.expiresAt}
                  onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                  style={INPUT_STYLE}
                />
              </div>

              {/* Active toggle */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.5625rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "var(--color-gray-600)",
                  fontWeight: 600,
                }}>
                  Active
                </span>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, active: !form.active })}
                  style={{
                    position: "relative",
                    display: "inline-block",
                    width: "44px",
                    height: "24px",
                    borderRadius: "12px",
                    background: form.active ? "var(--color-primary)" : "#D1D5DB",
                    border: "none",
                    cursor: "pointer",
                    transition: "background 200ms ease",
                  }}
                >
                  <span style={{
                    position: "absolute",
                    top: "4px",
                    left: form.active ? "23px" : "4px",
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: "white",
                    transition: "left 200ms ease",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                  }} />
                </button>
              </div>
            </div>

            {/* Panel footer */}
            <div style={{
              flexShrink: 0,
              padding: "1.25rem 1.5rem",
              borderTop: "1px solid var(--color-gray-200)",
              display: "flex",
              gap: "0.75rem",
            }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  flex: 1,
                  background: saving ? "#999" : "var(--color-black)",
                  color: "var(--color-white)",
                  border: "none",
                  padding: "0.75rem",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.625rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontWeight: 600,
                }}
              >
                {saving ? "Saving..." : editingId ? "Update Code" : "Create Code"}
              </button>
              <button
                onClick={closePanel}
                style={{
                  background: "none",
                  border: "1px solid var(--color-gray-200)",
                  padding: "0.75rem 1.25rem",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.625rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  color: "var(--color-gray-600)",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
