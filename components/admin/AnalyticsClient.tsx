"use client";

import { useEffect, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnalyticsData {
  business: {
    ordersToday: number;
    revenueToday: number;
    ordersWeek: number;
    revenueWeek: number;
    ordersMonth: number;
    revenueMonth: number;
    ordersTrend: number | null;
    revenueTrend: number | null;
    newCustomersToday: number;
    newCustomersMonth: number;
    activeProducts: number;
  };
  traffic: {
    visitorsToday: number;
    visitorsWeek: number;
    visitorsMonth: number;
    visitorsTrend: number | null;
    pageViewsToday: number;
    pageViewsWeek: number;
    pageViewsMonth: number;
    pageViewsTrend: number | null;
    deviceSplit: { mobile: number; desktop: number };
  };
  topPages: { path: string; views: number }[];
  topReferrers: { referrer: string; views: number }[];
  daily: { date: string; views: number; uniqueVisitors: number }[];
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function Icon({ d, size = 18, color = "currentColor" }: { d: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <path d={d} />
    </svg>
  );
}

// Single-path icons
const ICONS = {
  briefcase:   "M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",
  globe:       "M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
  revenue:     "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  package:     "M16.5 9.4 7.55 4.24M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16zM3.27 6.96 12 12.01l8.73-5.05M12 22.08V12",
  eye:         "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  calDay:      "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z",
  calWeek:     "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM8 14h.01M12 14h.01M16 14h.01",
  calMonth:    "M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01",
  user:        "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z",
  users:       "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  phone:       "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.88 12 19.79 19.79 0 0 1 1.8 3.35a2 2 0 0 1 2-2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9a16 16 0 0 0 6.29 6.29l.83-.94a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z",
  monitor:     "M20 3H4a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM8 21h8M12 17v4",
  tag:         "M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82zM7 7h.01",
  arrowUp:     "M12 19V5M5 12l7-7 7 7",
  arrowDown:   "M12 5v14M19 12l-7 7-7-7",
  link:        "M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71",
  chart:       "M18 20V10M12 20V4M6 20v-6",
};

function Ico({ name, size = 16, color = "currentColor", style }: { name: keyof typeof ICONS; size?: number; color?: string; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>
      {ICONS[name].split("M").filter(Boolean).map((seg, i) => (
        <path key={i} d={`M${seg}`} />
      ))}
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ghs(pesewas: number) {
  return `GHS ${(pesewas / 100).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function friendlyPath(path: string): string {
  if (path === "/" || path === "") return "Home";
  const map: Record<string, string> = {
    "/shop": "Shop — All Products",
    "/fragrances": "Fragrances",
    "/jewelry": "Jewelry",
    "/cart": "Shopping Cart",
    "/about": "About Us",
    "/services": "Our Services",
    "/account": "My Account",
    "/account/orders": "Order History",
    "/account/profile": "My Profile",
    "/account/wishlist": "Wishlist",
  };
  if (map[path]) return map[path];
  if (path.startsWith("/product/")) return `Product: ${path.replace("/product/", "").replace(/-/g, " ")}`;
  if (path.startsWith("/admin")) return "Admin Area";
  return path.replace(/\//g, " › ").replace(/^›\s/, "").replace(/-/g, " ");
}

function friendlyReferrer(ref: string): string {
  if (!ref || ref === "direct") return "Typed the address directly";
  try {
    const host = new URL(ref.startsWith("http") ? ref : `https://${ref}`).hostname.replace("www.", "");
    const map: Record<string, string> = {
      "google.com": "Google Search",
      "google.com.gh": "Google Search (Ghana)",
      "instagram.com": "Instagram",
      "facebook.com": "Facebook",
      "tiktok.com": "TikTok",
      "twitter.com": "Twitter / X",
      "x.com": "Twitter / X",
      "pinterest.com": "Pinterest",
      "youtube.com": "YouTube",
      "whatsapp.com": "WhatsApp",
      "snapchat.com": "Snapchat",
    };
    return map[host] ?? host;
  } catch {
    return ref;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeading({ icon, title, subtitle }: { icon: keyof typeof ICONS; title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.625rem", marginBottom: "0.25rem" }}>
        <Ico name={icon} size={20} color="var(--color-primary)" />
        <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.5rem", fontWeight: 400, color: "var(--color-black)", margin: 0 }}>
          {title}
        </h2>
      </div>
      <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", color: "rgba(26,26,26,0.5)", margin: 0, paddingLeft: "1.625rem" }}>
        {subtitle}
      </p>
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem", margin: "2rem 0 1.5rem" }}>
      <div style={{ flex: 1, height: "1px", background: "#e8e4dc" }} />
      <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(26,26,26,0.35)", fontWeight: 600, whiteSpace: "nowrap" }}>
        {label}
      </span>
      <div style={{ flex: 1, height: "1px", background: "#e8e4dc" }} />
    </div>
  );
}

function BigStatCard({
  label, value, sub, accent, icon,
}: {
  label: string; value: string | number; sub?: React.ReactNode; accent?: string; icon?: keyof typeof ICONS;
}) {
  return (
    <div style={{
      background: "#fff",
      border: `1px solid ${accent ? accent + "33" : "#e8e4dc"}`,
      borderTop: `3px solid ${accent ?? "var(--color-primary)"}`,
      padding: "1.375rem 1.5rem",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: accent ?? "var(--color-primary)", fontWeight: 600, margin: 0 }}>
          {label}
        </p>
        {icon && <Ico name={icon} size={15} color={accent ?? "var(--color-primary)"} style={{ opacity: 0.5 }} />}
      </div>
      <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2.25rem", fontWeight: 300, color: "var(--color-black)", lineHeight: 1, margin: "0 0 0.375rem 0" }}>
        {value}
      </p>
      {sub && (
        <div style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "rgba(26,26,26,0.45)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function TrendBadge({ pct }: { pct: number | null }) {
  if (pct === null) return null;
  const up = pct >= 0;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "3px", color: up ? "#16a34a" : "#dc2626", fontWeight: 600 }}>
      <Ico name={up ? "arrowUp" : "arrowDown"} size={11} color={up ? "#16a34a" : "#dc2626"} />
      {Math.abs(pct)}% vs last month
    </span>
  );
}

function SmallRow({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.625rem 0", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
      <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", color: "var(--color-black)" }}>{label}</span>
      <div style={{ textAlign: "right" }}>
        <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1rem", color: "var(--color-black)", display: "block", lineHeight: 1.2 }}>{value}</span>
        {note && <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", color: "rgba(26,26,26,0.4)", letterSpacing: "0.05em" }}>{note}</span>}
      </div>
    </div>
  );
}

function BarRow({ label, value, max, subLabel }: { label: string; value: number; max: number; subLabel: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ marginBottom: "0.875rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", color: "var(--color-black)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "75%" }} title={label}>
          {label}
        </span>
        <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "rgba(26,26,26,0.5)", flexShrink: 0, marginLeft: "0.5rem" }}>
          {subLabel}
        </span>
      </div>
      <div style={{ height: "4px", background: "rgba(184,134,11,0.1)", borderRadius: "2px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "rgba(184,134,11,0.45)", borderRadius: "2px" }} />
      </div>
    </div>
  );
}

function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e8e4dc", padding: "1.5rem", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", ...style }}>
      {children}
    </div>
  );
}

function PanelTitle({ icon, children }: { icon?: keyof typeof ICONS; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
      {icon && <Ico name={icon} size={13} color="var(--color-primary)" />}
      <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-primary)", fontWeight: 600, margin: 0 }}>
        {children}
      </p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div style={{ background: "rgba(0,0,0,0.04)", border: "1px solid #e8e4dc", padding: "1.5rem", height: "120px", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <div style={{ background: "rgba(0,0,0,0.07)", height: "9px", width: "45%", borderRadius: "2px" }} />
      <div style={{ background: "rgba(0,0,0,0.07)", height: "34px", width: "60%", borderRadius: "2px" }} />
      <div style={{ background: "rgba(0,0,0,0.04)", height: "8px", width: "35%", borderRadius: "2px" }} />
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = "business" | "traffic";

// ─── Main component ───────────────────────────────────────────────────────────

export function AnalyticsClient() {
  const [data, setData]       = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const [tab, setTab]         = useState<Tab>("business");

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(d => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  // ── Tab bar ──
  const tabs: { id: Tab; icon: keyof typeof ICONS; label: string; desc: string }[] = [
    { id: "business", icon: "briefcase", label: "Business Overview", desc: "Sales, orders & customers" },
    { id: "traffic",  icon: "globe",     label: "Website Visitors",  desc: "Who visits your store" },
  ];

  const tabBar = (
    <div style={{ display: "flex", gap: 0, marginBottom: "2rem", borderBottom: "2px solid #e8e4dc" }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => setTab(t.id)} style={{
          display: "flex", alignItems: "center", gap: "0.625rem",
          padding: "0.875rem 1.5rem",
          background: "transparent", border: "none", cursor: "pointer",
          borderBottom: tab === t.id ? "2px solid var(--color-primary)" : "2px solid transparent",
          marginBottom: "-2px",
          transition: "all 150ms",
        }}>
          <Ico name={t.icon} size={16} color={tab === t.id ? "var(--color-primary)" : "rgba(26,26,26,0.35)"} />
          <div style={{ textAlign: "left" }}>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", fontWeight: tab === t.id ? 700 : 500, color: tab === t.id ? "var(--color-black)" : "rgba(26,26,26,0.5)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>
              {t.label}
            </p>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", color: "rgba(26,26,26,0.4)", letterSpacing: "0.05em", margin: 0 }}>
              {t.desc}
            </p>
          </div>
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div>
        {tabBar}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div style={{ background: "rgba(0,0,0,0.04)", height: "260px", marginBottom: "2rem" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div style={{ background: "rgba(0,0,0,0.04)", height: "280px" }} />
          <div style={{ background: "rgba(0,0,0,0.04)", height: "280px" }} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {tabBar}
        <div style={{ padding: "3rem", textAlign: "center", border: "1px dashed #e8e4dc" }}>
          <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", color: "#EF4444" }}>
            Could not load analytics right now. Please refresh the page.
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { business, traffic, topPages, topReferrers, daily } = data;
  const noTrafficData  = traffic.pageViewsMonth === 0;
  const noBusinessData = business.ordersMonth === 0 && business.revenueMonth === 0;

  // ── BUSINESS TAB ──────────────────────────────────────────────────────────

  const businessTab = (
    <div>
      <SectionHeading icon="revenue" title="Revenue" subtitle="Money collected from paid orders (in Ghana Cedis)" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "0.5rem" }}>
        <BigStatCard label="Today's Revenue"  value={ghs(business.revenueToday)} icon="calDay"
          sub={<span>{business.ordersToday} order{business.ordersToday !== 1 ? "s" : ""} today</span>} />
        <BigStatCard label="This Week"         value={ghs(business.revenueWeek)} icon="calWeek"
          sub={<span>{business.ordersWeek} order{business.ordersWeek !== 1 ? "s" : ""} this week</span>} />
        <BigStatCard label="This Month"        value={ghs(business.revenueMonth)} icon="calMonth"
          sub={<TrendBadge pct={business.revenueTrend} />} />
      </div>

      {noBusinessData && (
        <div style={{ padding: "1.25rem 1.5rem", background: "#FFFBEB", border: "1px solid #FDE68A", marginTop: "1rem" }}>
          <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", color: "#92400E", margin: 0 }}>
            No paid orders recorded yet. Revenue will appear here once customers complete purchases.
          </p>
        </div>
      )}

      <Divider label="Orders" />

      <SectionHeading icon="package" title="Orders" subtitle="Number of orders successfully paid for" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
        <BigStatCard label="Today"      value={business.ordersToday}  icon="calDay"   accent="#7C3AED" />
        <BigStatCard label="This Week"  value={business.ordersWeek}   icon="calWeek"  accent="#7C3AED" />
        <BigStatCard label="This Month" value={business.ordersMonth}  icon="calMonth" accent="#7C3AED"
          sub={<TrendBadge pct={business.ordersTrend} />} />
      </div>

      <Divider label="Customers & Products" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        <Panel>
          <PanelTitle icon="users">New Customers</PanelTitle>
          <SmallRow label="Signed up today"       value={business.newCustomersToday} />
          <SmallRow label="Signed up this month"  value={business.newCustomersMonth} />
          <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "rgba(26,26,26,0.4)", margin: "0.875rem 0 0", lineHeight: 1.6 }}>
            These are customers who created an account. Guests who checked out without signing up are not counted here.
          </p>
        </Panel>

        <Panel>
          <PanelTitle icon="tag">Your Product Catalogue</PanelTitle>
          <SmallRow label="Products live on the store" value={business.activeProducts} note="Active" />
          <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "rgba(26,26,26,0.4)", margin: "0.875rem 0 0", lineHeight: 1.6 }}>
            Only products set to <strong>Active</strong> are visible to shoppers. Draft and archived products are hidden.
          </p>
        </Panel>
      </div>
    </div>
  );

  // ── TRAFFIC TAB ───────────────────────────────────────────────────────────

  const deviceTotal = traffic.deviceSplit.mobile + traffic.deviceSplit.desktop || 1;
  const mobilePct   = Math.round((traffic.deviceSplit.mobile / deviceTotal) * 100);
  const desktopPct  = 100 - mobilePct;
  const topPageMax  = topPages[0]?.views ?? 1;
  const topRefMax   = topReferrers[0]?.views ?? 1;

  const trafficTab = (
    <div>
      <SectionHeading icon="eye" title="Visitors" subtitle="How many people visited your store (last 30 days)" />

      {noTrafficData ? (
        <div style={{ padding: "3rem 2rem", textAlign: "center", border: "1px dashed #e8e4dc" }}>
          <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.375rem", fontWeight: 300, color: "var(--color-black)", marginBottom: "0.5rem" }}>
            No visitor data yet.
          </p>
          <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", color: "rgba(26,26,26,0.5)", margin: 0 }}>
            Traffic data appears here as people browse your store.
          </p>
        </div>
      ) : (
        <>
          {/* Visitor summary cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
            <BigStatCard label="Visitors Today"      value={traffic.visitorsToday.toLocaleString()}  icon="calDay"
              sub={<span>{traffic.pageViewsToday.toLocaleString()} page{traffic.pageViewsToday !== 1 ? "s" : ""} viewed</span>} />
            <BigStatCard label="Visitors This Week"  value={traffic.visitorsWeek.toLocaleString()}   icon="calWeek"
              sub={<span>{traffic.pageViewsWeek.toLocaleString()} pages viewed</span>} />
            <BigStatCard label="Visitors This Month" value={traffic.visitorsMonth.toLocaleString()}  icon="calMonth"
              sub={<TrendBadge pct={traffic.visitorsTrend} />} />
          </div>

          {/* Chart */}
          <Panel style={{ marginBottom: "2rem" }}>
            <PanelTitle icon="chart">Daily Visitors & Page Views — Last 30 Days</PanelTitle>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "rgba(26,26,26,0.4)", margin: "0 0 1rem", lineHeight: 1.6 }}>
              The gold line shows how many different people visited each day. The teal line shows how many pages they looked at in total.
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={daily} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#B8860B" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#B8860B" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTeal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#0D9488" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0D9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 9, fill: "rgba(26,26,26,0.4)" }} tickLine={false} axisLine={false} tickFormatter={(v: string, i: number) => (i % 5 === 0 ? v.slice(5) : "")} />
                <YAxis tick={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: 9, fill: "rgba(26,26,26,0.4)" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", border: "1px solid #e8e4dc", borderRadius: "2px", background: "#fff" }} labelStyle={{ color: "var(--color-primary)", fontWeight: 600 }} />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", paddingTop: "0.5rem" }} />
                <Area type="monotone" dataKey="uniqueVisitors" name="Unique Visitors" stroke="#B8860B" strokeWidth={1.5} fill="url(#gGold)" dot={false} />
                <Area type="monotone" dataKey="views"          name="Pages Viewed"    stroke="#0D9488" strokeWidth={1.5} fill="url(#gTeal)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </Panel>

          <Divider label="Details" />

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>

            {/* Most visited pages */}
            <Panel>
              <PanelTitle icon="link">Most Visited Pages</PanelTitle>
              <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "rgba(26,26,26,0.4)", margin: "0 0 1rem", lineHeight: 1.6 }}>
                The pages your visitors looked at most in the last 30 days.
              </p>
              {topPages.length === 0
                ? <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", color: "rgba(26,26,26,0.35)" }}>No data yet.</p>
                : topPages.map(p => (
                  <BarRow key={p.path} label={friendlyPath(p.path)} value={p.views} max={topPageMax} subLabel={`${p.views.toLocaleString()} view${p.views !== 1 ? "s" : ""}`} />
                ))
              }
            </Panel>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* How people found you */}
              <Panel>
                <PanelTitle icon="globe">How People Found Your Store</PanelTitle>
                <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "rgba(26,26,26,0.4)", margin: "0 0 1rem", lineHeight: 1.6 }}>
                  Where your visitors came from before landing on your store.
                </p>
                {topReferrers.length === 0
                  ? <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", color: "rgba(26,26,26,0.35)" }}>No data yet.</p>
                  : topReferrers.map(r => (
                    <BarRow key={r.referrer} label={friendlyReferrer(r.referrer)} value={r.views} max={topRefMax} subLabel={`${r.views.toLocaleString()} visit${r.views !== 1 ? "s" : ""}`} />
                  ))
                }
              </Panel>

              {/* Device split */}
              <Panel>
                <PanelTitle icon="phone">Phone vs Computer</PanelTitle>
                <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "rgba(26,26,26,0.4)", margin: "0 0 1rem", lineHeight: 1.6 }}>
                  What device your visitors used to browse your store.
                </p>
                <div style={{ display: "flex", gap: "2rem", marginBottom: "1rem" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.25rem" }}>
                      <Ico name="phone" size={13} color="var(--color-primary)" />
                      <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(26,26,26,0.45)", margin: 0 }}>Phone / Tablet</p>
                    </div>
                    <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", fontWeight: 300, color: "var(--color-black)", margin: 0, lineHeight: 1 }}>{mobilePct}%</p>
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", marginBottom: "0.25rem" }}>
                      <Ico name="monitor" size={13} color="rgba(26,26,26,0.45)" />
                      <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(26,26,26,0.45)", margin: 0 }}>Computer</p>
                    </div>
                    <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", fontWeight: 300, color: "var(--color-black)", margin: 0, lineHeight: 1 }}>{desktopPct}%</p>
                  </div>
                </div>
                <div style={{ height: "8px", background: "rgba(0,0,0,0.06)", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${mobilePct}%`, background: "var(--color-primary)", borderRadius: "4px" }} />
                </div>
                <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", color: "rgba(26,26,26,0.35)", margin: "0.5rem 0 0", lineHeight: 1.6 }}>
                  Most of your customers shop on {mobilePct >= 50 ? "their phones" : "a computer"} — make sure your store looks great on {mobilePct >= 50 ? "mobile" : "desktop"}.
                </p>
              </Panel>

            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div>
      {tabBar}
      {tab === "business" ? businessTab : trafficTab}
    </div>
  );
}
