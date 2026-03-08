import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { FinanceClient } from "@/components/admin/FinanceClient";

export const metadata = { title: "Finance — Admin" };

export default async function FinancePage() {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role ?? "")) {
    redirect("/");
  }

  return (
    <div style={{ padding: "2rem 2.5rem", minHeight: "100vh", background: "var(--color-white)" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: "0.5rem", fontWeight: 600 }}>
          Financial Overview
        </p>
        <h1 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", fontWeight: 300, color: "var(--color-black)", margin: 0 }}>
          Finance
        </h1>
      </div>
      <FinanceClient />
    </div>
  );
}
