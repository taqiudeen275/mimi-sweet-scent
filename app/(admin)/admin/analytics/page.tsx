import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AnalyticsClient } from "@/components/admin/AnalyticsClient";

export const metadata = { title: "Analytics — Admin" };

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role ?? "")) {
    redirect("/");
  }

  return (
    <div style={{ padding: "2rem 2.5rem", minHeight: "100vh", background: "var(--color-white)" }}>
      <div style={{ marginBottom: "2rem" }}>
        <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: "0.5rem", fontWeight: 600 }}>
          Insights
        </p>
        <h1 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", fontWeight: 300, color: "var(--color-black)", margin: "0 0 0.375rem" }}>
          Analytics
        </h1>
        <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.6875rem", color: "rgba(26,26,26,0.5)", margin: 0 }}>
          Switch between tabs to see your sales performance or how visitors are finding your store.
        </p>
      </div>
      <AnalyticsClient />
    </div>
  );
}
