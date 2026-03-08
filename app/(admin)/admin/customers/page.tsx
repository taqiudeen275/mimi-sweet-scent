import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Customers" };
export const revalidate = 60;

export default async function AdminCustomersPage() {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "MANAGER", "FULFILLMENT_STAFF"].includes(session.user.role ?? "")) {
    redirect("/");
  }

  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { orders: true } },
      orders: {
        where: { paymentStatus: "PAID" },
        select: { totalAmount: true },
      },
    },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{
          fontFamily: "var(--font-cormorant), Georgia, serif",
          fontSize: "2rem",
          fontWeight: 400,
          color: "var(--color-black)",
          margin: 0,
        }}>
          Customers
        </h1>
        <span style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "0.6875rem",
          color: "var(--color-gray-600)",
        }}>
          {customers.length} registered
        </span>
      </div>

      {/* Desktop Table */}
      <div className="admin-customers-table" style={{ background: "var(--color-white)", border: "1px solid var(--color-gray-200)" }}>
        <div className="admin-table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "560px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--color-gray-200)", background: "#FAFAFA" }}>
              {["Name", "Email", "Phone", "Orders", "Total Spent", "Joined"].map((h) => (
                <th key={h} style={{
                  padding: "0.875rem 1.25rem",
                  textAlign: "left",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.5625rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "var(--color-gray-600)",
                  fontWeight: 500,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {customers.map((customer: (typeof customers)[number], i: number) => {
              const totalSpent = customer.orders.reduce((s, o) => s + o.totalAmount, 0);
              return (
                <tr key={customer.id} style={{
                  borderBottom: i < customers.length - 1 ? "1px solid var(--color-gray-200)" : "none",
                }}>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "var(--color-primary)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <span style={{
                          fontFamily: "var(--font-montserrat), sans-serif",
                          fontSize: "0.6875rem",
                          color: "var(--color-white)",
                          fontWeight: 600,
                        }}>
                          {(customer.name ?? customer.email).charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <span style={{
                        fontFamily: "var(--font-cormorant), Georgia, serif",
                        fontSize: "1rem",
                        color: "var(--color-black)",
                      }}>
                        {customer.name ?? "—"}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.6875rem",
                      color: "var(--color-gray-600)",
                    }}>
                      {customer.email}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.6875rem",
                      color: "var(--color-gray-600)",
                    }}>
                      {customer.phone ?? "—"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.75rem",
                      color: "var(--color-black)",
                      fontWeight: customer._count.orders > 0 ? 600 : 400,
                    }}>
                      {customer._count.orders}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{
                      fontFamily: "var(--font-cormorant), Georgia, serif",
                      fontSize: "0.9375rem",
                      color: totalSpent > 0 ? "var(--color-primary)" : "var(--color-gray-400)",
                    }}>
                      {totalSpent > 0 ? formatPrice(totalSpent) : "—"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 1.25rem" }}>
                    <span style={{
                      fontFamily: "var(--font-montserrat), sans-serif",
                      fontSize: "0.6875rem",
                      color: "var(--color-gray-600)",
                    }}>
                      {customer.createdAt.toLocaleDateString("en-GH")}
                    </span>
                  </td>
                </tr>
              );
            })}
            {customers.length === 0 && (
              <tr>
                <td colSpan={6} style={{
                  padding: "3rem",
                  textAlign: "center",
                  fontFamily: "var(--font-montserrat), sans-serif",
                  fontSize: "0.8125rem",
                  color: "var(--color-gray-400)",
                }}>
                  No customers yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="admin-customers-cards" style={{ display: "none", flexDirection: "column", gap: 0, background: "var(--color-white)", border: "1px solid var(--color-gray-200)" }}>
        {customers.length === 0 ? (
          <p style={{ padding: "3rem", textAlign: "center", fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.8125rem", color: "var(--color-gray-400)" }}>No customers yet</p>
        ) : customers.map((customer, i) => {
          const totalSpent = customer.orders.reduce((s, o) => s + o.totalAmount, 0);
          return (
            <div key={customer.id} style={{ padding: "1rem 1.25rem", borderBottom: i < customers.length - 1 ? "1px solid var(--color-gray-200)" : "none", display: "flex", gap: "0.875rem", alignItems: "center" }}>
              {/* Avatar */}
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", color: "#fff", fontWeight: 600 }}>
                  {(customer.name ?? customer.email).charAt(0).toUpperCase()}
                </span>
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "1rem", color: "var(--color-black)" }}>
                    {customer.name ?? "—"}
                  </span>
                  <span style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "0.9375rem", color: totalSpent > 0 ? "var(--color-primary)" : "var(--color-gray-400)" }}>
                    {totalSpent > 0 ? formatPrice(totalSpent) : "—"}
                  </span>
                </div>
                <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", color: "var(--color-gray-600)", margin: "0.2rem 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {customer.email}
                </p>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.25rem" }}>
                  <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", color: "var(--color-gray-600)", letterSpacing: "0.04em" }}>
                    {customer._count.orders} order{customer._count.orders !== 1 ? "s" : ""}
                  </span>
                  <span style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5rem", color: "var(--color-gray-400)" }}>
                    {customer.createdAt.toLocaleDateString("en-GH")}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
