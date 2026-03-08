import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat } from "next/font/google";
import { Providers } from "@/components/Providers";
import { prisma } from "@/lib/prisma";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Mimi's Sweet Scent",
    template: "%s | Mimi's Sweet Scent",
  },
  description:
    "Luxury perfumes and fine jewelry — crafted with artistry, worn with elegance.",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Mimi's Sweet Scent",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch theme settings — fail gracefully so a DB issue never breaks the site
  let themeCSS = "";
  try {
    const themeKeys = ["primaryColor", "bgColor", "textColor", "creamColor", "borderRadius"];
    const rows = await prisma.siteSetting.findMany({ where: { key: { in: themeKeys } } });
    const theme: Record<string, string> = {};
    for (const row of rows) {
      try { theme[row.key] = String(JSON.parse(row.value)); } catch { theme[row.key] = row.value; }
    }
    // Only apply valid hex colors to prevent CSS injection
    const safeHex = (v: string) => /^#[0-9A-Fa-f]{3,8}$/.test(v) ? v : null;
    const safeRadius = (v: string) => /^[0-9]+px$/.test(v) ? v : null;
    const overrides = [
      safeHex(theme.primaryColor ?? "") ? `  --color-primary: ${safeHex(theme.primaryColor ?? "")};` : "",
      safeHex(theme.bgColor      ?? "") ? `  --color-white:   ${safeHex(theme.bgColor ?? "")};`      : "",
      safeHex(theme.textColor    ?? "") ? `  --color-black:   ${safeHex(theme.textColor ?? "")};`    : "",
      safeHex(theme.creamColor   ?? "") ? `  --color-cream:   ${safeHex(theme.creamColor ?? "")};`   : "",
      safeRadius(theme.borderRadius ?? "") ? `  --border-radius: ${safeRadius(theme.borderRadius ?? "")};` : "",
    ].filter(Boolean).join("\n");
    if (overrides) themeCSS = `:root {\n${overrides}\n}`;
  } catch {
    // DB unavailable — use default CSS variables from globals.css
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${cormorant.variable} ${montserrat.variable} antialiased`}>
        {themeCSS && <style dangerouslySetInnerHTML={{ __html: themeCSS }} />}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
