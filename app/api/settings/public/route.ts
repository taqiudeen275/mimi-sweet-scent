import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** Public settings exposed to the storefront (no auth required) */
const PUBLIC_KEYS = [
  "siteName", "tagline", "logoUrl", "faviconUrl", "copyrightText",
  "contactEmail", "contactPhone", "contactAddress", "whatsappNumber",
  "instagramUrl", "facebookUrl", "tiktokUrl", "twitterUrl", "pinterestUrl",
  "primaryColor", "bgColor", "textColor", "creamColor", "accentColor",
  "borderRadius", "headingFont", "bodyFont",
  "currency", "currencySymbol", "enableGuest", "freeShipping", "minOrder",
  "defaultMetaTitle", "defaultMetaDesc", "defaultOgImage", "gaId", "fbPixelId",
  "maintenanceMode",
] as const;

const DEFAULTS: Record<string, unknown> = {
  siteName:        "Mimi's Sweet Scent",
  tagline:         "Luxury perfumes and fine jewelry — crafted with artistry, worn with elegance.",
  logoUrl:         "", faviconUrl: "", copyrightText: "© {year} Mimi's Sweet Scent. All rights reserved.",
  contactEmail:    "", contactPhone: "", contactAddress: "", whatsappNumber: "",
  instagramUrl:    "", facebookUrl: "", tiktokUrl: "", twitterUrl: "", pinterestUrl: "",
  primaryColor:    "#B8860B", bgColor: "#FFFFFF", textColor: "#1A1A1A",
  creamColor:      "#FAF7F0", accentColor: "#B8860B", borderRadius: "0px",
  headingFont:     "Cormorant Garamond", bodyFont: "Montserrat",
  currency:        "GHS", currencySymbol: "₵", enableGuest: "true",
  freeShipping:    "0", minOrder: "0",
  defaultMetaTitle: "Mimi's Sweet Scent — Luxury Perfumes & Fine Jewelry",
  defaultMetaDesc:  "Luxury perfumes and fine jewelry — crafted with artistry, worn with elegance.",
  defaultOgImage:   "", gaId: "", fbPixelId: "", maintenanceMode: "false",
};

export const dynamic = "force-dynamic";

export async function GET() {
  const map: Record<string, unknown> = { ...DEFAULTS };
  try {
    const rows = await prisma.siteSetting.findMany({
      where: { key: { in: PUBLIC_KEYS as unknown as string[] } },
    });
    for (const row of rows) {
      try { map[row.key] = JSON.parse(row.value); } catch { map[row.key] = row.value; }
    }
  } catch {
    // DB not yet migrated — return defaults
  }
  return NextResponse.json(map);
}
