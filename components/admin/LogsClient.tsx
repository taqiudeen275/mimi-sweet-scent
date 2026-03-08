"use client";

import { useState, useCallback } from "react";
import type { AuditLog } from "@prisma/client";

const CATEGORIES = ["all", "admin", "security", "payment", "system"] as const;
type Category = (typeof CATEGORIES)[number];

const BADGE: Record<string, { bg: string; color: string }> = {
  admin:    { bg: "rgba(184,134,11,0.12)",  color: "#B8860B" },
  security: { bg: "rgba(239,68,68,0.12)",   color: "#EF4444" },
  payment:  { bg: "rgba(34,197,94,0.12)",   color: "#16A34A" },
  system:   { bg: "rgba(99,102,241,0.12)",  color: "#6366F1" },
};

function formatDate(d: Date | string) {
  return new Date(d).toLocaleString("en-GH", {
    month: "short", day: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  });
}

function summarise(details: unknown): string {
  if (!details) return "—";
  const str = JSON.stringify(details);
  return str.length > 60 ? str.slice(0, 57) + "…" : str;
}

interface Props {
  initialLogs: AuditLog[];
  initialTotal: number;
}

export function LogsClient({ initialLogs, initialTotal }: Props) {
  const [logs, setLogs]         = useState<AuditLog[]>(initialLogs);
  const [total, setTotal]       = useState(initialTotal);
  const [page, setPage]         = useState(1);
  const [pages, setPages]       = useState(Math.ceil(initialTotal / 50));
  const [category, setCategory] = useState<Category>("all");
  const [from, setFrom]         = useState("");
  const [to, setTo]             = useState("");
  const [loading, setLoading]   = useState(false);

  const fetch_ = useCallback(async (opts: {
    page?: number; category?: Category; from?: string; to?: string;
  }) => {
    setLoading(true);
    const p   = opts.page     ?? page;
    const cat = opts.category ?? category;
    const f   = opts.from     ?? from;
    const t   = opts.to       ?? to;

    const params = new URLSearchParams({ page: String(p) });
    if (cat !== "all") params.set("category", cat);
    if (f) params.set("from", f);
    if (t) params.set("to", t);

    const res  = await fetch(`/api/admin/logs?${params}`);
    const data = await res.json();
    setLogs(data.logs);
    setTotal(data.total);
    setPage(data.page);
    setPages(data.pages);
    setLoading(false);
  }, [page, category, from, to]);

  function onCategory(c: Category) {
    setCategory(c);
    setPage(1);
    fetch_({ page: 1, category: c });
  }

  function onDateChange(f: string, t: string) {
    setFrom(f); setTo(t);
    setPage(1);
    fetch_({ page: 1, from: f, to: t });
  }

  function clearFilters() {
    setCategory("all"); setFrom(""); setTo(""); setPage(1);
    fetch_({ page: 1, category: "all", from: "", to: "" });
  }

  // Stats derived from current visible page
  const counts = { admin: 0, security: 0, payment: 0, system: 0 };
  logs.forEach(l => { if (l.category in counts) counts[l.category as keyof typeof counts]++; });

  const th: React.CSSProperties = {
    padding: "0.75rem 1rem", textAlign: "left",
    fontFamily: "var(--font-montserrat), sans-serif",
    fontSize: "0.5625rem", letterSpacing: "0.12em",
    textTransform: "uppercase", color: "rgba(255,255,255,0.45)",
    fontWeight: 500, whiteSpace: "nowrap",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

      {/* ── Filter bar ── */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.75rem" }}>
        {/* Category pills */}
        <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => onCategory(c)}
              style={{
                padding: "0.35rem 0.875rem",
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.5625rem", letterSpacing: "0.1em",
                textTransform: "uppercase", fontWeight: 600,
                border: `1px solid ${category === c ? "var(--color-primary)" : "var(--color-gray-200)"}`,
                background: category === c ? "rgba(184,134,11,0.1)" : "transparent",
                color: category === c ? "var(--color-primary)" : "var(--color-gray-600)",
                cursor: "pointer", borderRadius: "2px",
              }}
            >{c}</button>
          ))}
        </div>

        {/* Date range */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginLeft: "auto" }}>
          <input type="date" value={from} onChange={e => onDateChange(e.target.value, to)}
            style={{ padding: "0.35rem 0.625rem", border: "1px solid var(--color-gray-200)", background: "var(--color-white)", color: "var(--color-black)", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem" }} />
          <span style={{ color: "var(--color-gray-400)", fontSize: "0.75rem" }}>→</span>
          <input type="date" value={to} onChange={e => onDateChange(from, e.target.value)}
            style={{ padding: "0.35rem 0.625rem", border: "1px solid var(--color-gray-200)", background: "var(--color-white)", color: "var(--color-black)", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem" }} />
          {(category !== "all" || from || to) && (
            <button onClick={clearFilters} style={{ padding: "0.35rem 0.75rem", background: "none", border: "1px solid var(--color-gray-200)", color: "var(--color-gray-600)", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>
              Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "1rem" }}>
        {[
          { label: "Total Logs",       value: total,            color: "var(--color-black)" },
          { label: "Admin Actions",    value: counts.admin,     color: BADGE.admin.color    },
          { label: "Security Events",  value: counts.security,  color: BADGE.security.color },
          { label: "Payments",         value: counts.payment,   color: BADGE.payment.color  },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "var(--color-white)", border: "1px solid var(--color-gray-200)", padding: "1.25rem 1.5rem" }}>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--color-gray-600)", margin: "0 0 0.5rem" }}>{label}</p>
            <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", fontWeight: 300, color, margin: 0, lineHeight: 1 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div style={{ background: "var(--color-white)", border: "1px solid var(--color-gray-200)", opacity: loading ? 0.6 : 1, transition: "opacity 150ms" }}>
        {logs.length === 0 ? (
          <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.25rem", fontWeight: 300, color: "var(--color-gray-600)", margin: "0 0 0.5rem" }}>No activity logged yet</p>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", color: "var(--color-gray-400)", margin: 0 }}>Logs appear here as actions are performed across the system.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "720px" }}>
              <thead>
                <tr style={{ background: "#111110" }}>
                  {["Timestamp", "Category", "Action", "Actor", "Entity", "Details"].map(h => (
                    <th key={h} style={th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => {
                  const badge = BADGE[log.category] ?? BADGE.system;
                  return (
                    <tr key={log.id} style={{ borderBottom: "1px solid var(--color-gray-200)", background: i % 2 === 1 ? "rgba(0,0,0,0.015)" : "transparent" }}>
                      <td style={{ padding: "0.75rem 1rem", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", color: "var(--color-gray-600)", whiteSpace: "nowrap" }}>
                        {formatDate(log.createdAt)}
                      </td>
                      <td style={{ padding: "0.75rem 1rem" }}>
                        <span style={{ display: "inline-block", padding: "0.2rem 0.625rem", background: badge.bg, color: badge.color, fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, borderRadius: "2px" }}>
                          {log.category}
                        </span>
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontFamily: "monospace", fontSize: "0.6875rem", color: "var(--color-black)", fontWeight: 500 }}>
                        {log.action}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", color: "var(--color-gray-600)" }}>
                        {log.actorEmail ?? <span style={{ opacity: 0.4 }}>system</span>}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", color: "var(--color-gray-600)" }}>
                        {log.entityType ? (
                          <span>{log.entityType}{log.entityId ? ` #${log.entityId.slice(-8)}` : ""}</span>
                        ) : <span style={{ opacity: 0.4 }}>—</span>}
                      </td>
                      <td style={{ padding: "0.75rem 1rem", fontFamily: "monospace", fontSize: "0.5625rem", color: "var(--color-gray-600)", maxWidth: "200px" }}>
                        {summarise(log.details)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ padding: "1rem 1.5rem", borderTop: "1px solid var(--color-gray-200)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", color: "var(--color-gray-600)", margin: 0 }}>
              Showing {(page - 1) * 50 + 1}–{Math.min(page * 50, total)} of {total}
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                disabled={page <= 1}
                onClick={() => { const p = page - 1; setPage(p); fetch_({ page: p }); }}
                style={{ padding: "0.35rem 0.875rem", border: "1px solid var(--color-gray-200)", background: "none", color: page <= 1 ? "var(--color-gray-400)" : "var(--color-black)", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: page <= 1 ? "not-allowed" : "pointer" }}
              >← Prev</button>
              <span style={{ padding: "0.35rem 0.75rem", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "var(--color-gray-600)" }}>{page} / {pages}</span>
              <button
                disabled={page >= pages}
                onClick={() => { const p = page + 1; setPage(p); fetch_({ page: p }); }}
                style={{ padding: "0.35rem 0.875rem", border: "1px solid var(--color-gray-200)", background: "none", color: page >= pages ? "var(--color-gray-400)" : "var(--color-black)", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase", cursor: page >= pages ? "not-allowed" : "pointer" }}
              >Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
