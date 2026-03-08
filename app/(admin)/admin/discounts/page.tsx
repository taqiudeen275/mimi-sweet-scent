import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DiscountsClient } from "./DiscountsClient";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = { title: "Discounts" };
export const revalidate = 0;

export default async function AdminDiscountsPage() {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role ?? "")) {
    redirect("/");
  }

  const raw = await prisma.discountCode.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Serialize Date fields to strings for client component
  const discounts = raw.map((d: (typeof raw)[number]) => ({
    ...d,
    expiresAt: (d.expiresAt ? d.expiresAt.toISOString() : null) as string | null,
    createdAt: d.createdAt.toISOString(),
  }));

  const totalRedemptions = discounts.reduce((sum: number, d: (typeof discounts)[number]) => sum + d.usageCount, 0);
  const activeCodes = discounts.filter((d: (typeof discounts)[number]) => d.active).length;

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
