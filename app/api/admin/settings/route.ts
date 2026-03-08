import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** All settings with their default values */
export const SETTING_DEFAULTS: Record<string, unknown> = {
  // Brand
  siteName:        "Mimi's Sweet Scent",
  tagline:         "Luxury perfumes and fine jewelry — crafted with artistry, worn with elegance.",
  logoUrl:         "",
  faviconUrl:      "",
  copyrightText:   "© {year} Mimi's Sweet Scent. All rights reserved.",
  // Contact
  contactEmail:    "",
  contactPhone:    "",
  contactAddress:  "",
  whatsappNumber:  "",
  instagramUrl:    "",
  facebookUrl:     "",
  tiktokUrl:       "",
  twitterUrl:      "",
  pinterestUrl:    "",
  // Theme
  primaryColor:    "#B8860B",
  bgColor:         "#FFFFFF",
  textColor:       "#1A1A1A",
  creamColor:      "#FAF7F0",
  accentColor:     "#B8860B",
  borderRadius:    "0px",
  headingFont:     "Cormorant Garamond",
  bodyFont:        "Montserrat",
  // Email (SMTP) — values mirror env vars but DB overrides
  smtpHost:        "",
  smtpPort:        "587",
  smtpSecure:      "false",
  smtpUser:        "",
  smtpPass:        "",
  fromName:        "Mimi's Sweet Scent",
  fromEmail:       "",
  // Checkout
  currency:        "GHS",
  currencySymbol:  "₵",
  enableGuest:     "true",
  freeShipping:    "0",
  minOrder:        "0",
  // SEO
  defaultMetaTitle: "Mimi's Sweet Scent — Luxury Perfumes & Fine Jewelry",
  defaultMetaDesc:  "Luxury perfumes and fine jewelry — crafted with artistry, worn with elegance.",
  defaultOgImage:   "",
  gaId:             "",
  fbPixelId:        "",
  // Notifications
  adminEmail:      "",
  lowStockQty:     "5",
  notifyOnOrder:   "true",
  notifyOnLow:     "true",
  maintenanceMode: "false",
};

/** GET all settings (admin only) */
export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const rows = await prisma.siteSetting.findMany();
  const map: Record<string, unknown> = { ...SETTING_DEFAULTS };
  for (const row of rows) {
    try { map[row.key] = JSON.parse(row.value); } catch { map[row.key] = row.value; }
  }
  return NextResponse.json(map);
}

/** PATCH — upsert one or many settings */
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json() as Record<string, unknown>;
  const ops = Object.entries(body).map(([key, val]) =>
    prisma.siteSetting.upsert({
      where:  { key },
      update: { value: JSON.stringify(val) },
      create: { key, value: JSON.stringify(val) },
    })
  );
  await Promise.all(ops);
  return NextResponse.json({ saved: true });
}
