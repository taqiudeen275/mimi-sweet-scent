import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WishlistsClient } from "@/components/admin/WishlistsClient";

export const metadata = { title: "Wishlist Analytics — Admin" };

export default async function WishlistsPage() {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role ?? "")) {
    redirect("/");
  }

  const [grouped, totalGroups, totalWishlists, totalItems] = await Promise.all([
    prisma.wishlistItem.groupBy({
      by: ["productId"],
      _count: { productId: true },
      orderBy: { _count: { productId: "desc" } },
      take: 20,
    }),
    prisma.wishlistItem.groupBy({ by: ["productId"] }),
    prisma.wishlist.count(),
    prisma.wishlistItem.count(),
  ]);

  const productIds = grouped.map((g: (typeof grouped)[number]) => g.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: {
      id: true, name: true, slug: true, productType: true,
      images:   { take: 1, select: { url: true }, orderBy: { position: "asc" } },
      variants: { take: 1, select: { price: true }, orderBy: { price: "asc" } },
    },
  });

  const items = grouped.map((g: (typeof grouped)[number]) => ({
    productId: g.productId,
    count: g._count.productId,
    product: products.find(p => p.id === g.productId) ?? null,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div>
        <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-primary)", margin: "0 0 0.25rem", fontWeight: 600 }}>
          Customers
        </p>
        <h1 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", fontWeight: 400, color: "var(--color-black)", margin: 0 }}>
          Wishlist Analytics
        </h1>
        <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", color: "var(--color-gray-600)", marginTop: "0.25rem", letterSpacing: "0.03em" }}>
          Most-saved products ranked by customer wishlist activity
        </p>
      </div>

      <WishlistsClient
        initialItems={JSON.parse(JSON.stringify(items))}
        initialTotal={totalGroups.length}
        initialStats={{ totalWishlists, totalItems, topProductName: items[0]?.product?.name ?? null }}
      />
    </div>
  );
}
