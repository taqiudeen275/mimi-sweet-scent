import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Dashboard" };
export const revalidate = 60;

const STATUS_COLORS: Record<string, string> = {
  PENDING:    "#F59E0B",
  PROCESSING: "#3B82F6",
  SHIPPED:    "#8B5CF6",
  DELIVERED:  "#10B981",
  CANCELLED:  "#EF4444",
  REFUNDED:   "#6B7280",
};

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "MANAGER", "FULFILLMENT_STAFF", "CONTENT_EDITOR"].includes(session.user.role ?? "")) {
    redirect("/");
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalOrdersCount,
    totalRevenue,
    todayRevenue,
    activeProducts,
    totalCustomers,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ _sum: { totalAmount: true }, where: { paymentStatus: "PAID" } }),
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: { paymentStatus: "PAID", createdAt: { gte: today } },
    }),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true, email: true, status: true, paymentStatus: true,
        totalAmount: true, createdAt: true, _count: { select: { items: true } },
      },
    }),
  ]);

  const stats = [
    { label: "Today's Revenue", value: formatPrice(todayRevenue._sum.totalAmount ?? 0),   sub: "paid orders today",       icon: "₵" },
    { label: "Total Revenue",   value: formatPrice(totalRevenue._sum.totalAmount ?? 0),    sub: "all time",                icon: "📈" },
    { label: "Total Orders",    value: totalOrdersCount.toLocaleString(),                  sub: "all time",                icon: "◇" },
    { label: "Active Products", value: activeProducts.toLocaleString(),                    sub: `${totalCustomers} customers`, icon: "◈" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div className="admin-page-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", fontWeight: 400, color: "var(--color-black)", margin: 0 }}>
            Dashboard
          </h1>
          <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", color: "var(--color-gray-600)", marginTop: "0.25rem", letterSpacing: "0.03em" }}>
            {new Date().toLocaleDateString("en-GH", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <a href="/admin/products/new" style={{
          display: "inline-flex", alignItems: "center", gap: "0.375rem",
          padding: "0.5rem 1rem", background: "var(--color-primary)", color: "#fff",
          textDecoration: "none", fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "0.625rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600,
        }}>
          + New Product
        </a>
      </div>

      {/* Stat cards */}
      <div className="admin-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem" }}>
        {stats.map(({ label, value, sub, icon }) => (
          <div key={label} style={{ background: "var(--color-white)", padding: "1.25rem 1.5rem", border: "1px solid var(--color-gray-200)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-gray-600)", fontWeight: 500, margin: 0 }}>
                {label}
              </p>
              <span style={{ fontSize: "0.875rem", opacity: 0.4 }}>{icon}</span>
            </div>
            <p style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.875rem", fontWeight: 300, color: "var(--color-black)", lineHeight: 1, marginBottom: "0.375rem" }}>
              {value}
            </p>
            <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "var(--color-gray-400)", letterSpacing: "0.05em" }}>
              {sub}
            </p>
          </div>
        ))}
      </div>

      {/* Quick actions — mobile friendly */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
        {[
          { href: "/admin/products", label: "Manage Products", icon: "◈" },
          { href: "/admin/orders",   label: "View Orders",     icon: "◇" },
          { href: "/admin/discounts",label: "Discounts",       icon: "%" },
          { href: "/admin/content",  label: "Edit Content",    icon: "☰" },
        ].map(({ href, label, icon }) => (
          <a key={href} href={href} style={{
            display: "flex", alignItems: "center", gap: "0.625rem",
            padding: "0.875rem 1rem", background: "var(--color-white)",
            border: "1px solid var(--color-gray-200)", textDecoration: "none",
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.625rem", letterSpacing: "0.08em", textTransform: "uppercase",
            color: "var(--color-black)", fontWeight: 500, transition: "border-color 150ms",
          }}>
            <span style={{ opacity: 0.5 }}>{icon}</span>
            {label}
          </a>
        ))}
      </div>

      {/* Recent orders */}
      <div style={{ background: "var(--color-white)", border: "1px solid var(--color-gray-200)" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--color-gray-200)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1.25rem", fontWeight: 400, color: "var(--color-black)", margin: 0 }}>
            Recent Orders
          </h2>
          <a href="/admin/orders" style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-primary)", textDecoration: "none" }}>
            View All →
          </a>
        </div>

        {/* Desktop table */}
        <div className="admin-table-wrap admin-orders-table">
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "560px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-gray-200)" }}>
                {["Order", "Customer", "Items", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-gray-600)", fontWeight: 500 }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: "2rem 1.5rem", textAlign: "center", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.8125rem", color: "var(--color-gray-400)" }}>No orders yet</td></tr>
              ) : recentOrders.map((order, i) => (
                <tr key={order.id} style={{ borderBottom: i < recentOrders.length - 1 ? "1px solid var(--color-gray-200)" : "none" }}>
                  <td style={{ padding: "0.875rem 1.5rem" }}>
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", color: "var(--color-black)", fontWeight: 500 }}>#{order.id.slice(-8).toUpperCase()}</span>
                  </td>
                  <td style={{ padding: "0.875rem 1.5rem" }}>
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", color: "var(--color-gray-600)" }}>{order.email}</span>
                  </td>
                  <td style={{ padding: "0.875rem 1.5rem" }}>
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", color: "var(--color-gray-600)" }}>{order._count.items} item{order._count.items !== 1 ? "s" : ""}</span>
                  </td>
                  <td style={{ padding: "0.875rem 1.5rem" }}>
                    <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "0.9375rem", color: "var(--color-black)" }}>{formatPrice(order.totalAmount)}</span>
                  </td>
                  <td style={{ padding: "0.875rem 1.5rem" }}>
                    <span style={{ display: "inline-block", padding: "0.2rem 0.625rem", background: `${STATUS_COLORS[order.status]}18`, color: STATUS_COLORS[order.status], fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: "0.875rem 1.5rem" }}>
                    <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", color: "var(--color-gray-600)" }}>{order.createdAt.toLocaleDateString("en-GH")}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="admin-orders-cards" style={{ display: "none", flexDirection: "column", gap: 0 }}>
          {recentOrders.length === 0 ? (
            <p style={{ padding: "2rem", textAlign: "center", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.8125rem", color: "var(--color-gray-400)" }}>No orders yet</p>
          ) : recentOrders.map((order, i) => (
            <div key={order.id} style={{
              padding: "1rem 1.25rem",
              borderBottom: i < recentOrders.length - 1 ? "1px solid var(--color-gray-200)" : "none",
              display: "flex", flexDirection: "column", gap: "0.5rem",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", fontWeight: 700, color: "var(--color-black)" }}>
                  #{order.id.slice(-8).toUpperCase()}
                </span>
                <span style={{ display: "inline-block", padding: "0.2rem 0.5rem", background: `${STATUS_COLORS[order.status]}18`, color: STATUS_COLORS[order.status], fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600 }}>
                  {order.status}
                </span>
              </div>
              <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.625rem", color: "var(--color-gray-600)", margin: 0 }}>{order.email}</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "var(--color-gray-600)" }}>
                  {order._count.items} item{order._count.items !== 1 ? "s" : ""} · {order.createdAt.toLocaleDateString("en-GH")}
                </span>
                <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1rem", color: "var(--color-black)", fontWeight: 600 }}>
                  {formatPrice(order.totalAmount)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
