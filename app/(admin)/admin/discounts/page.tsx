import type { Metadata } from "next";
import { DiscountsClient } from "./DiscountsClient";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Discounts" };
export const revalidate = 0;

export default async function AdminDiscountsPage() {
  const raw = await prisma.discountCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Serialize Date fields to strings for client component
  const discounts = raw.map((d) => ({
    ...d,
    expiresAt: (d.expiresAt ? d.expiresAt.toISOString() : null) as string | null,
    createdAt: d.createdAt.toISOString(),
  }));

  const totalRedemptions = discounts.reduce((sum, d) => sum + d.usageCount, 0);
  const activeCodes = discounts.filter((d) => d.active).length;

  return (
    <DiscountsClient
      initialDiscounts={discounts}
      stats={{
        total: discounts.length,
        active: activeCodes,
        redemptions: totalRedemptions,
      }}
    />
  );
}
