import { Fragment } from "react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "My Profile" };

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/account/login?callbackUrl=/account/profile");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      _count: { select: { orders: true } },
      orders: {
        where: { paymentStatus: "PAID" },
        select: { totalAmount: true },
      },
    },
  });

  if (!user) redirect("/account/login");

  const totalSpent = user.orders.reduce((s, o) => s + o.totalAmount, 0) / 100;

  return (
    <main style={{
      maxWidth: "760px",
      margin: "0 auto",
      padding: "3rem 2rem 5rem",
    }}>
      <h1 style={{
        fontFamily: "var(--font-cormorant), Georgia, serif",
        fontSize: "2.25rem",
        fontWeight: 400,
        color: "var(--color-black)",
        marginBottom: "2.5rem",
      }}>
        My Account
      </h1>

      {/* Profile card */}
      <div style={{
        background: "var(--color-cream)",
        padding: "2rem",
        marginBottom: "2rem",
        display: "flex",
        alignItems: "center",
        gap: "1.5rem",
      }}>
        <div style={{
          width: "64px",
          height: "64px",
          borderRadius: "50%",
          background: "var(--color-primary)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1.75rem",
            color: "var(--color-white)",
            fontWeight: 300,
          }}>
            {(user.name ?? user.email).charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h2 style={{
            fontFamily: "var(--font-cormorant), Georgia, serif",
            fontSize: "1.5rem",
            fontWeight: 400,
            color: "var(--color-black)",
            margin: 0,
          }}>
            {user.name ?? "My Account"}
          </h2>
          <p style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.75rem",
            color: "var(--color-gray-600)",
            marginTop: "0.25rem",
            letterSpacing: "0.03em",
          }}>
            {user.email}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "1rem",
        marginBottom: "2.5rem",
      }}>
        {[
          { label: "Total Orders", value: user._count.orders.toString() },
          { label: "Amount Spent", value: `₵${totalSpent.toLocaleString("en-GH", { minimumFractionDigits: 2 })}` },
          { label: "Member Since", value: user.createdAt.toLocaleDateString("en-GH", { month: "long", year: "numeric" }) },
        ].map(({ label, value }) => (
          <div key={label} style={{
            border: "1px solid var(--color-gray-200)",
            padding: "1.25rem",
            background: "var(--color-white)",
            textAlign: "center",
          }}>
            <p style={{
              fontFamily: "var(--font-cormorant), Georgia, serif",
              fontSize: "1.5rem",
              fontWeight: 300,
              color: "var(--color-black)",
              margin: 0,
            }}>
              {value}
            </p>
            <p style={{
              fontFamily: "var(--font-montserrat), sans-serif",
              fontSize: "0.5625rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--color-gray-600)",
              marginTop: "0.375rem",
            }}>
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Account details */}
      <div style={{
        border: "1px solid var(--color-gray-200)",
        background: "var(--color-white)",
        padding: "2rem",
        marginBottom: "1rem",
      }}>
        <h3 style={{
          fontFamily: "var(--font-montserrat), sans-serif",
          fontSize: "0.6875rem",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: "var(--color-black)",
          fontWeight: 600,
          marginBottom: "1.25rem",
        }}>
          Account Details
        </h3>
        <dl style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.75rem 2rem" }}>
          {[
            { label: "Name", value: user.name ?? "—" },
            { label: "Email", value: user.email },
            { label: "Phone", value: user.phone ?? "—" },
            { label: "Role", value: user.role },
          ].map(({ label, value }) => (
            <Fragment key={label}>
              <dt key={`${label}-dt`} style={{
                fontFamily: "var(--font-montserrat), sans-serif",
                fontSize: "0.625rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "var(--color-gray-600)",
                fontWeight: 500,
                alignSelf: "center",
              }}>
                {label}
              </dt>
              <dd key={`${label}-dd`} style={{
                fontFamily: "var(--font-cormorant), Georgia, serif",
                fontSize: "1rem",
                color: "var(--color-black)",
                margin: 0,
              }}>
                {value}
              </dd>
            </Fragment>
          ))}
        </dl>
      </div>

      {/* Quick links */}
      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <Link href="/account/orders" className="btn btn-secondary">
          View My Orders
        </Link>
        <Link href="/shop" className="btn btn-secondary">
          Continue Shopping
        </Link>
        <form action="/api/auth/signout" method="POST">
          <button type="submit" style={{
            fontFamily: "var(--font-montserrat), sans-serif",
            fontSize: "0.6875rem",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--color-gray-600)",
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "0.625rem 0",
            textDecoration: "underline",
          }}>
            Sign Out
          </button>
        </form>
      </div>
    </main>
  );
}
