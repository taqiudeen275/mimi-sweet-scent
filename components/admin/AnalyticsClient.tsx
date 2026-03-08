"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  summary: {
    totalToday: number;
    totalWeek: number;
    totalMonth: number;
    totalPrevMonth: number;
    trendPercent: number | null;
    uniqueToday: number;
    uniqueWeek: number;
    uniqueMonth: number;
    uniquePrevMonth: number;
    uniqueTrendPercent: number | null;
    ordersToday: number;
    revenueToday: number;
  };
  topPages: { path: string; views: number }[];
  topReferrers: { referrer: string; views: number }[];
  deviceSplit: { mobile: number; desktop: number };
  daily: { date: string; views: number; uniqueVisitors: number }[];
}

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e8e4dc",
        borderRadius: "2px",
        padding: "1.5rem",
        boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "0.5rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--color-primary)",
          fontWeight: 600,
          marginBottom: "0.625rem",
          margin: "0 0 0.625rem 0",
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "2.25rem",
          fontWeight: 300,
          color: "var(--color-black)",
          lineHeight: 1,
          margin: "0 0 0.375rem 0",
        }}
      >
        {value}
      </p>
      {sub && (
        <div
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.625rem",
            color: "rgba(26,26,26,0.45)",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: "rgba(0,0,0,0.05)",
        border: "1px solid #e8e4dc",
        borderRadius: "2px",
        padding: "1.5rem",
        height: "110px",
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
      }}
    >
      <div style={{ background: "rgba(0,0,0,0.07)", height: "10px", width: "40%", borderRadius: "2px" }} />
      <div style={{ background: "rgba(0,0,0,0.07)", height: "32px", width: "55%", borderRadius: "2px" }} />
      <div style={{ background: "rgba(0,0,0,0.05)", height: "9px", width: "30%", borderRadius: "2px" }} />
    </div>
  );
}

export function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => {
        if (!r.ok) throw new Error("Failed");
        return r.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
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
            background: "rgba(0,0,0,0.05)",
            height: "260px",
            borderRadius: "2px",
            marginBottom: "2rem",
          }}
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div style={{ background: "rgba(0,0,0,0.05)", height: "320px", borderRadius: "2px" }} />
          <div style={{ background: "rgba(0,0,0,0.05)", height: "320px", borderRadius: "2px" }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", color: "#EF4444" }}>
        Failed to load analytics data.
      </p>
    );
  }

  if (!data) return null;

  const { summary, topPages, topReferrers, deviceSplit, daily } = data;

  if (summary.totalMonth === 0) {
    return (
      <div
        style={{
          padding: "4rem 2rem",
          textAlign: "center",
          border: "1px dashed #e8e4dc",
          borderRadius: "2px",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1.375rem",
            fontWeight: 300,
            color: "var(--color-black)",
            marginBottom: "0.5rem",
          }}
        >
          No traffic data yet.
        </p>
        <p
          style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.6875rem",
            color: "rgba(26,26,26,0.5)",
          }}
        >
          Data appears here as visitors browse your store.
        </p>
      </div>
    );
  }

  const trendBadge = (pct: number | null) =>
    pct !== null ? (
      <span style={{ color: pct >= 0 ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
        {pct >= 0 ? "↑" : "↓"} {Math.abs(pct)}% vs prev 30d
      </span>
    ) : null;

  const topPageMax = topPages[0]?.views ?? 1;
  const topRefMax = topReferrers[0]?.views ?? 1;
  const deviceTotal = deviceSplit.mobile + deviceSplit.desktop || 1;

  const sectionTitle = (text: string) => (
    <p
      style={{
        fontFamily: "var(--font-montserrat), sans-serif",
        fontSize: "0.5625rem",
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: "var(--color-primary)",
        fontWeight: 600,
        marginBottom: "1rem",
        margin: "0 0 1rem 0",
      }}
    >
      {text}
    </p>
  );

  return (
    <div>
      {/* ── Row 1: Summary cards ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard
          label="Page Views Today"
          value={summary.totalToday.toLocaleString()}
          sub={<span style={{ color: "rgba(26,26,26,0.45)" }}>{summary.uniqueToday.toLocaleString()} unique</span>}
        />
        <StatCard
          label="Views This Week"
          value={summary.totalWeek.toLocaleString()}
          sub={<span style={{ color: "rgba(26,26,26,0.45)" }}>{summary.uniqueWeek.toLocaleString()} unique</span>}
        />
        <StatCard
          label="Views This Month"
          value={summary.totalMonth.toLocaleString()}
          sub={trendBadge(summary.trendPercent)}
        />
        <StatCard
          label="Unique Visitors"
          value={summary.uniqueMonth.toLocaleString()}
          sub={trendBadge(summary.uniqueTrendPercent)}
        />
        <StatCard label="Orders Today" value={summary.ordersToday.toLocaleString()} />
        <StatCard
          label="Revenue Today"
          value={`GHS ${(summary.revenueToday / 100).toFixed(2)}`}
        />
      </div>

      {/* ── Row 2: Traffic chart ── */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e8e4dc",
          borderRadius: "2px",
          padding: "1.5rem",
          marginBottom: "2rem",
          boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        {sectionTitle("Page Views & Unique Visitors — Last 30 Days")}
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={daily} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#B8860B" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#B8860B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tick={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 9, fill: "rgba(26,26,26,0.4)" }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: string, i: number) => (i % 5 === 0 ? v.slice(5) : "")}
            />
            <YAxis
              tick={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 9, fill: "rgba(26,26,26,0.4)" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", border: "1px solid #e8e4dc", borderRadius: "2px", background: "#fff" }}
              labelStyle={{ color: "var(--color-primary)", fontWeight: 600 }}
            />
            <Legend
              iconType="circle"
              iconSize={7}
              wrapperStyle={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", paddingTop: "0.5rem" }}
            />
            <Area type="monotone" dataKey="views" name="Page Views" stroke="#B8860B" strokeWidth={1.5} fill="url(#goldGradient)" dot={false} />
            <Area type="monotone" dataKey="uniqueVisitors" name="Unique Visitors" stroke="#0D9488" strokeWidth={1.5} fill="url(#tealGradient)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* ── Row 3: Two columns ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Left: Top Pages */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e8e4dc",
            borderRadius: "2px",
            padding: "1.5rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
          }}
        >
          {sectionTitle("Top Pages — Last 30 Days")}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {topPages.map((p) => (
              <div key={p.path}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.25rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.6875rem",
                      color: "var(--color-black)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "75%",
                    }}
                    title={p.path}
                  >
                    {p.path}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.6875rem",
                      color: "rgba(26,26,26,0.5)",
                      flexShrink: 0,
                    }}
                  >
                    {p.views.toLocaleString()}
                  </span>
                </div>
                <div
                  style={{
                    height: "4px",
                    background: "rgba(184,134,11,0.1)",
                    borderRadius: "2px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.round((p.views / topPageMax) * 100)}%`,
                      background: "rgba(184,134,11,0.3)",
                      borderRadius: "2px",
                    }}
                  />
                </div>
              </div>
            ))}
            {topPages.length === 0 && (
              <p
                style={{
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.6875rem",
                  color: "rgba(26,26,26,0.35)",
                }}
              >
                No page data yet.
              </p>
            )}
          </div>
        </div>

        {/* Right: Device split + Referrers */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Device Split */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e8e4dc",
              borderRadius: "2px",
              padding: "1.5rem",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            {sectionTitle("Device Split — Last 30 Days")}
            <div style={{ display: "flex", gap: "2rem", marginBottom: "1rem" }}>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: "1.75rem",
                    fontWeight: 300,
                    color: "var(--color-black)",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {deviceSplit.mobile.toLocaleString()}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.5rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(26,26,26,0.45)",
                    margin: "0.25rem 0 0 0",
                  }}
                >
                  Mobile
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-cormorant), Georgia, serif",
                    fontSize: "1.75rem",
                    fontWeight: 300,
                    color: "var(--color-black)",
                    margin: 0,
                    lineHeight: 1,
                  }}
                >
                  {deviceSplit.desktop.toLocaleString()}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.5rem",
                    letterSpacing: "0.15em",
                    textTransform: "uppercase",
                    color: "rgba(26,26,26,0.45)",
                    margin: "0.25rem 0 0 0",
                  }}
                >
                  Desktop
                </p>
              </div>
            </div>
            {/* Split bar */}
            <div
              style={{
                height: "6px",
                background: "rgba(0,0,0,0.06)",
                borderRadius: "3px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${Math.round((deviceSplit.mobile / deviceTotal) * 100)}%`,
                  background: "var(--color-primary)",
                  borderRadius: "3px",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "0.375rem",
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.5625rem",
                color: "rgba(26,26,26,0.4)",
              }}
            >
              <span>Mobile {Math.round((deviceSplit.mobile / deviceTotal) * 100)}%</span>
              <span>Desktop {Math.round((deviceSplit.desktop / deviceTotal) * 100)}%</span>
            </div>
          </div>

          {/* Top Referrers */}
          <div
            style={{
              background: "#fff",
              border: "1px solid #e8e4dc",
              borderRadius: "2px",
              padding: "1.5rem",
              boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
            }}
          >
            {sectionTitle("Top Referrers — Last 30 Days")}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {topReferrers.map((r) => (
                <div
                  key={r.referrer}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.375rem 0",
                    borderBottom: "1px solid rgba(0,0,0,0.04)",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.6875rem",
                      color: "var(--color-black)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "78%",
                    }}
                    title={r.referrer}
                  >
                    {r.referrer === "direct" ? "(direct)" : r.referrer}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.6875rem",
                      color: "rgba(26,26,26,0.5)",
                      flexShrink: 0,
                    }}
                  >
                    {r.views.toLocaleString()}
                  </span>
                </div>
              ))}
              {topReferrers.length === 0 && (
                <p
                  style={{
                    fontFamily: "var(--font-montserrat), sans-serif",
                    fontSize: "0.6875rem",
                    color: "rgba(26,26,26,0.35)",
                  }}
                >
                  No referrer data yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
