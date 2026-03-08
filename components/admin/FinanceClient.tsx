"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonthlyRevenue {
  month: string;
  label: string;
  revenue: number;
}

interface TopProduct {
  name: string;
  qty: number;
  revenue: number;
}

interface DiscountRow {
  code: string;
  type: string;
  value: number;
  usageCount: number;
  usageLimit: number | null;
  active: boolean;
  createdAt: string;
}

interface RecentOrder {
  id: string;
  email: string;
  totalAmount: number;
  status: string;
  discountCode: string | null;
  discountAmount: number;
  createdAt: string;
}

interface FinanceData {
  revenue: {
    allTime: number;
    today: number;
    thisMonth: number;
    lastMonth: number;
    yearToDate: number;
    avgOrderValue: number;
    totalDiscountGiven: number;
  };
  orders: {
    total: number;
    byStatus: Record<string, number>;
    byPayment: Record<string, number>;
  };
  monthlyRevenue: MonthlyRevenue[];
  topProducts: TopProduct[];
  discounts: DiscountRow[];
  recentOrders: RecentOrder[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ghs(pesewas: number) {
  return `GHS ${(pesewas / 100).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function exportCSV(orders: RecentOrder[]) {
  const rows = [
    ["Order ID", "Email", "Amount (GHS)", "Status", "Discount Code", "Discount Amount", "Date"],
    ...orders.map((o) => [
      o.id,
      o.email,
      (o.totalAmount / 100).toFixed(2),
      o.status,
      o.discountCode ?? "",
      (o.discountAmount / 100).toFixed(2),
      new Date(o.createdAt).toISOString().slice(0, 10),
    ]),
  ];
  const csv  = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `mss-orders-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Status colour map ────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  PENDING:     "#F59E0B",
  PROCESSING:  "#3B82F6",
  SHIPPED:     "#6366F1",
  DELIVERED:   "#10B981",
  CANCELLED:   "#EF4444",
  REFUNDED:    "#9CA3AF",
};

const PAYMENT_COLORS: Record<string, string> = {
  PAID:          "#10B981",
  UNPAID:        "#F59E0B",
  REFUNDED:      "#9CA3AF",
  PARTIAL_REFUND: "#F97316",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  note,
  noteColor,
}: {
  label: string;
  value: string;
  note?: string;
  noteColor?: string;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "4px",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.375rem",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "0.5625rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "var(--color-primary)",
          fontWeight: 600,
          margin: 0,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.75rem",
          fontWeight: 400,
          color: "#1A1A1A",
          margin: 0,
          lineHeight: 1.1,
        }}
      >
        {value}
      </p>
      {note && (
        <p
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.625rem",
            color: noteColor ?? "#6B7280",
            margin: 0,
            letterSpacing: "0.04em",
          }}
        >
          {note}
        </p>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "4px",
        padding: "1.5rem",
        opacity: 0.4,
      }}
    >
      <div style={{ height: "10px", width: "40%", background: "#D1D5DB", borderRadius: "2px", marginBottom: "0.75rem" }} />
      <div style={{ height: "28px", width: "65%", background: "#D1D5DB", borderRadius: "2px" }} />
    </div>
  );
}

// ─── Custom Tooltip for chart ─────────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "#1A1A1A",
        border: "1px solid #2a2a2a",
        borderRadius: "4px",
        padding: "0.625rem 0.875rem",
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: "0.6875rem",
      }}
    >
      <p style={{ color: "rgba(255,255,255,0.6)", margin: "0 0 0.25rem", letterSpacing: "0.08em" }}>{label}</p>
      <p style={{ color: "var(--color-primary)", margin: 0, fontWeight: 600 }}>{ghs(payload[0].value)}</p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FinanceClient() {
  const [data, setData]     = useState<FinanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/finance")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load finance data.");
        setLoading(false);
      });
  }, []);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
            marginBottom: "2rem",
          }}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div
          style={{
            background: "#fff",
            border: "1px solid #E5E7EB",
            borderRadius: "4px",
            padding: "1.5rem",
            height: "260px",
            opacity: 0.4,
          }}
        />
      </div>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (error || !data) {
    return (
      <div
        style={{
          padding: "3rem",
          textAlign: "center",
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "0.75rem",
          color: "#EF4444",
          letterSpacing: "0.06em",
        }}
      >
        {error ?? "No data available."}
      </div>
    );
  }

  // ── Empty state ───────────────────────────────────────────────────────────
  if (data.revenue.allTime === 0) {
    return (
      <div
        style={{
          padding: "4rem 2rem",
          textAlign: "center",
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "1.375rem",
          fontWeight: 300,
          color: "#6B7280",
        }}
      >
        No financial data yet. Revenue appears here as orders are placed and paid.
      </div>
    );
  }

  // ── Month-over-month comparison ───────────────────────────────────────────
  const thisMonth = data.revenue.thisMonth;
  const lastMonth = data.revenue.lastMonth;
  let monthNote: string | undefined;
  let monthNoteColor: string | undefined;
  if (lastMonth > 0) {
    const pct = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
    monthNote      = pct >= 0 ? `+${pct}% vs last month` : `${pct}% vs last month`;
    monthNoteColor = pct >= 0 ? "#10B981" : "#EF4444";
  } else if (thisMonth > 0) {
    monthNote      = "New revenue this month";
    monthNoteColor = "#10B981";
  }

  const totalOrderCount = data.orders.total;

  // ── Section label style helper ────────────────────────────────────────────
  const sectionLabel: React.CSSProperties = {
    fontFamily: "var(--font-cormorant), Georgia, serif",
    fontSize: "1.25rem",
    fontWeight: 400,
    color: "#1A1A1A",
    margin: "0 0 1rem",
  };

  const sectionWrap: React.CSSProperties = {
    marginBottom: "2.5rem",
  };

  const card: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #E5E7EB",
    borderRadius: "4px",
    padding: "1.5rem",
  };

  const tableHeader: React.CSSProperties = {
    fontFamily: "var(--font-montserrat), sans-serif",
    fontSize: "0.5625rem",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    color: "#9CA3AF",
    fontWeight: 600,
    padding: "0.5rem 0.75rem",
    textAlign: "left",
    borderBottom: "1px solid #F3F4F6",
  };

  const tableCell: React.CSSProperties = {
    fontFamily: "var(--font-montserrat), sans-serif",
    fontSize: "0.6875rem",
    color: "#374151",
    padding: "0.75rem",
    borderBottom: "1px solid #F9FAFB",
    letterSpacing: "0.02em",
  };

  return (
    <div>
      {/* ── Export CSV button ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1.5rem" }}>
        <button
          onClick={() => exportCSV(data.recentOrders)}
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.625rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            fontWeight: 600,
            color: "var(--color-primary)",
            background: "transparent",
            border: "1px solid var(--color-primary)",
            borderRadius: "2px",
            padding: "0.5rem 1.25rem",
            cursor: "pointer",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--color-primary)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--color-primary)";
          }}
        >
          Export CSV
        </button>
      </div>

      {/* ── Section 1: Revenue summary cards ──────────────────────────────── */}
      <div style={sectionWrap}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "1rem",
          }}
          className="admin-stats-grid"
        >
          <StatCard label="All-Time Revenue"  value={ghs(data.revenue.allTime)} />
          <StatCard label="Today's Revenue"   value={ghs(data.revenue.today)} />
          <StatCard
            label="This Month"
            value={ghs(data.revenue.thisMonth)}
            note={monthNote}
            noteColor={monthNoteColor}
          />
          <StatCard label="Last Month"        value={ghs(data.revenue.lastMonth)} />
          <StatCard label="Year to Date"      value={ghs(data.revenue.yearToDate)} />
          <StatCard label="Avg Order Value"   value={ghs(data.revenue.avgOrderValue)} />
        </div>
      </div>

      {/* ── Section 2: Monthly Revenue Bar Chart ──────────────────────────── */}
      <div style={{ ...sectionWrap, ...card }}>
        <h2 style={{ ...sectionLabel, marginBottom: "1.5rem" }}>
          Monthly Revenue — Last 12 Months
        </h2>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={data.monthlyRevenue}
            margin={{ top: 4, right: 8, left: 8, bottom: 0 }}
          >
            <CartesianGrid vertical={false} stroke="#F3F4F6" />
            <XAxis
              dataKey="label"
              tick={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: 10,
                fill: "#9CA3AF",
                letterSpacing: "0.04em",
              }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v: number) => `GHS ${(v / 100).toFixed(0)}`}
              tick={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: 10,
                fill: "#9CA3AF",
              }}
              axisLine={false}
              tickLine={false}
              width={80}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(184,134,11,0.06)" }} />
            <Bar dataKey="revenue" fill="#B8860B" radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Section 3: Order status breakdown ─────────────────────────────── */}
      <div style={{ ...sectionWrap, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>

        {/* Orders by Status */}
        <div style={card}>
          <h2 style={sectionLabel}>Orders by Status</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"] as const).map((status) => {
              const count = data.orders.byStatus[status] ?? 0;
              const pct   = totalOrderCount > 0 ? Math.round((count / totalOrderCount) * 100) : 0;
              return (
                <div
                  key={status}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: "0.375rem 0",
                    borderBottom: "1px solid #F9FAFB",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: STATUS_COLORS[status] ?? "#9CA3AF",
                    }}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.6875rem",
                      color: "#374151",
                      letterSpacing: "0.04em",
                      textTransform: "capitalize",
                    }}
                  >
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#1A1A1A",
                      minWidth: "28px",
                      textAlign: "right",
                    }}
                  >
                    {count}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.5625rem",
                      color: "#9CA3AF",
                      minWidth: "36px",
                      textAlign: "right",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Payment Status */}
        <div style={card}>
          <h2 style={sectionLabel}>Payment Status</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {(["PAID", "UNPAID", "REFUNDED", "PARTIAL_REFUND"] as const).map((status) => {
              const count = data.orders.byPayment[status] ?? 0;
              const pct   = totalOrderCount > 0 ? Math.round((count / totalOrderCount) * 100) : 0;
              const label = status === "PARTIAL_REFUND" ? "Partial Refund" : status.charAt(0) + status.slice(1).toLowerCase();
              return (
                <div
                  key={status}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.625rem",
                    padding: "0.375rem 0",
                    borderBottom: "1px solid #F9FAFB",
                  }}
                >
                  <span
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      flexShrink: 0,
                      background: PAYMENT_COLORS[status] ?? "#9CA3AF",
                    }}
                  />
                  <span
                    style={{
                      flex: 1,
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.6875rem",
                      color: "#374151",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "#1A1A1A",
                      minWidth: "28px",
                      textAlign: "right",
                    }}
                  >
                    {count}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.5625rem",
                      color: "#9CA3AF",
                      minWidth: "36px",
                      textAlign: "right",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Section 4: Top Products ────────────────────────────────────────── */}
      <div style={{ ...sectionWrap, ...card }}>
        <h2 style={sectionLabel}>Top Products by Revenue</h2>
        <div className="admin-table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ ...tableHeader, width: "48px" }}>Rank</th>
                <th style={tableHeader}>Product Name</th>
                <th style={{ ...tableHeader, textAlign: "right" }}>Units Sold</th>
                <th style={{ ...tableHeader, textAlign: "right" }}>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {data.topProducts.map((p, i) => (
                <tr key={p.name} style={{ transition: "background 120ms" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAF9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <td style={{ ...tableCell, color: i < 3 ? "var(--color-primary)" : "#9CA3AF", fontWeight: i < 3 ? 600 : 400 }}>
                    {i < 3 ? `#${i + 1}` : i + 1}
                  </td>
                  <td style={{ ...tableCell, color: "#1A1A1A", fontWeight: 500 }}>{p.name}</td>
                  <td style={{ ...tableCell, textAlign: "right" }}>{p.qty.toLocaleString()}</td>
                  <td style={{ ...tableCell, textAlign: "right", fontWeight: 600, color: "#1A1A1A" }}>{ghs(p.revenue)}</td>
                </tr>
              ))}
              {data.topProducts.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ ...tableCell, textAlign: "center", color: "#9CA3AF", padding: "2rem" }}>
                    No product data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 5: Discount Codes ──────────────────────────────────────── */}
      <div style={{ ...sectionWrap, ...card }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <h2 style={{ ...sectionLabel, margin: 0 }}>Discount Codes</h2>
          <span
            style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.625rem",
              letterSpacing: "0.08em",
              color: "#6B7280",
            }}
          >
            Total discount given:{" "}
            <strong style={{ color: "#EF4444" }}>{ghs(data.revenue.totalDiscountGiven)}</strong>
          </span>
        </div>
        <div className="admin-table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={tableHeader}>Code</th>
                <th style={tableHeader}>Type</th>
                <th style={{ ...tableHeader, textAlign: "right" }}>Value</th>
                <th style={{ ...tableHeader, textAlign: "right" }}>Usage</th>
                <th style={tableHeader}>Status</th>
                <th style={tableHeader}>Created</th>
              </tr>
            </thead>
            <tbody>
              {data.discounts.map((d) => {
                const valueDisplay =
                  d.type === "PERCENTAGE"
                    ? `${d.value}%`
                    : d.type === "FIXED"
                    ? ghs(d.value)
                    : "Free Shipping";
                const usageDisplay = d.usageLimit ? `${d.usageCount} / ${d.usageLimit}` : `${d.usageCount}`;
                return (
                  <tr key={d.code}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAF9")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                    style={{ transition: "background 120ms" }}
                  >
                    <td style={{ ...tableCell, fontFamily: "monospace", fontSize: "0.75rem", color: "#1A1A1A", fontWeight: 600, letterSpacing: "0.06em" }}>
                      {d.code}
                    </td>
                    <td style={{ ...tableCell, textTransform: "capitalize" }}>
                      {d.type.charAt(0) + d.type.slice(1).toLowerCase().replace("_", " ")}
                    </td>
                    <td style={{ ...tableCell, textAlign: "right" }}>{valueDisplay}</td>
                    <td style={{ ...tableCell, textAlign: "right" }}>{usageDisplay}</td>
                    <td style={tableCell}>
                      <span
                        style={{
                          display: "inline-block",
                          padding: "0.2rem 0.625rem",
                          borderRadius: "2px",
                          fontSize: "0.5625rem",
                          fontFamily: "var(--font-montserrat), sans-serif",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          fontWeight: 600,
                          background: d.active ? "rgba(16,185,129,0.1)" : "rgba(156,163,175,0.15)",
                          color: d.active ? "#059669" : "#9CA3AF",
                        }}
                      >
                        {d.active ? "Active" : "Paused"}
                      </span>
                    </td>
                    <td style={{ ...tableCell, color: "#9CA3AF" }}>
                      {new Date(d.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                  </tr>
                );
              })}
              {data.discounts.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ ...tableCell, textAlign: "center", color: "#9CA3AF", padding: "2rem" }}>
                    No discount codes yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 6: Recent Orders ───────────────────────────────────────── */}
      <div style={{ ...sectionWrap, ...card }}>
        <h2 style={sectionLabel}>Recent Paid Orders</h2>
        <div className="admin-table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={tableHeader}>Order ID</th>
                <th style={tableHeader}>Customer</th>
                <th style={{ ...tableHeader, textAlign: "right" }}>Amount</th>
                <th style={tableHeader}>Status</th>
                <th style={tableHeader}>Discount</th>
                <th style={tableHeader}>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((o) => (
                <tr key={o.id}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAF9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  style={{ transition: "background 120ms" }}
                >
                  <td style={{ ...tableCell, fontFamily: "monospace", fontSize: "0.6875rem", color: "#6B7280" }}>
                    {o.id.slice(0, 8)}…
                  </td>
                  <td style={{ ...tableCell, maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {o.email}
                  </td>
                  <td style={{ ...tableCell, textAlign: "right", fontWeight: 600, color: "#1A1A1A" }}>
                    {ghs(o.totalAmount)}
                  </td>
                  <td style={tableCell}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.2rem 0.5rem",
                        borderRadius: "2px",
                        fontSize: "0.5rem",
                        fontFamily: "var(--font-montserrat), sans-serif",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        fontWeight: 600,
                        background: `${STATUS_COLORS[o.status] ?? "#9CA3AF"}18`,
                        color: STATUS_COLORS[o.status] ?? "#9CA3AF",
                      }}
                    >
                      {o.status}
                    </span>
                  </td>
                  <td style={{ ...tableCell, fontFamily: "monospace", fontSize: "0.625rem", color: "#9CA3AF" }}>
                    {o.discountCode
                      ? `${o.discountCode} (−${ghs(o.discountAmount)})`
                      : "—"}
                  </td>
                  <td style={{ ...tableCell, color: "#9CA3AF", whiteSpace: "nowrap" }}>
                    {new Date(o.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                </tr>
              ))}
              {data.recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ ...tableCell, textAlign: "center", color: "#9CA3AF", padding: "2rem" }}>
                    No paid orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
