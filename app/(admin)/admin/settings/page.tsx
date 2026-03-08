import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SettingsClient } from "@/components/admin/SettingsClient";
import { SETTING_DEFAULTS } from "@/app/api/admin/settings/route";

export const metadata = { title: "Site Settings — Admin" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN"].includes(session.user.role ?? "")) {
    redirect("/");
  }

  const rows = await prisma.siteSetting.findMany();
  const settings: Record<string, string> = {};

  // Start with defaults (as strings)
  for (const [k, v] of Object.entries(SETTING_DEFAULTS)) {
    settings[k] = String(v);
  }
  // Override with DB values
  for (const row of rows) {
    try { settings[row.key] = String(JSON.parse(row.value)); } catch { settings[row.key] = row.value; }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div>
        <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-primary)", margin: "0 0 0.25rem", fontWeight: 600 }}>
          Admin
        </p>
        <h1 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", fontWeight: 400, color: "var(--color-black)", margin: 0 }}>
          Site Settings
        </h1>
        <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", color: "var(--color-gray-600)", marginTop: "0.25rem", letterSpacing: "0.03em" }}>
          Configure your brand, theme, email, SEO, and other site-wide preferences
        </p>
      </div>

      <SettingsClient initialSettings={settings} />
    </div>
  );
}
