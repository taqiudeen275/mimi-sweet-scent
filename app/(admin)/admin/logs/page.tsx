import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { LogsClient } from "@/components/admin/LogsClient";

export const metadata = { title: "Activity Logs — Admin" };

export default async function LogsPage() {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role ?? "")) {
    redirect("/");
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.auditLog.count(),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div className="admin-page-header" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-primary)", marginBottom: "0.25rem", fontWeight: 600, margin: "0 0 0.25rem" }}>
            System
          </p>
          <h1 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", fontWeight: 400, color: "var(--color-black)", margin: 0 }}>
            Activity Logs
          </h1>
          <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", color: "var(--color-gray-600)", marginTop: "0.25rem", letterSpacing: "0.03em" }}>
            All admin actions, security events, and payment activity
          </p>
        </div>
      </div>

      <LogsClient initialLogs={JSON.parse(JSON.stringify(logs))} initialTotal={total} />
    </div>
  );
}
