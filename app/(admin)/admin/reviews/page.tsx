import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ReviewsClient } from "@/components/admin/ReviewsClient";

export const metadata = { title: "Product Reviews — Admin" };

export default async function ReviewsPage() {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN", "MANAGER"].includes(session.user.role ?? "")) {
    redirect("/");
  }

  const [reviews, total, products] = await Promise.all([
    prisma.review.findMany({
      include: {
        product: { select: { id: true, name: true, slug: true } },
        user:    { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
    prisma.review.count(),
    prisma.product.findMany({
      select: { id: true, name: true },
      where:  { status: "ACTIVE" },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
        <div>
          <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.5625rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--color-primary)", margin: "0 0 0.25rem", fontWeight: 600 }}>
            Customers
          </p>
          <h1 style={{ fontFamily: "var(--font-cormorant), Georgia, serif", fontSize: "2rem", fontWeight: 400, color: "var(--color-black)", margin: 0 }}>
            Product Reviews
          </h1>
          <p style={{ fontFamily: "var(--font-montserrat), sans-serif", fontSize: "0.75rem", color: "var(--color-gray-600)", marginTop: "0.25rem", letterSpacing: "0.03em" }}>
            Moderate and manage customer reviews across all products
          </p>
        </div>
      </div>

      <ReviewsClient
        initialReviews={JSON.parse(JSON.stringify(reviews))}
        initialTotal={total}
        products={products}
      />
    </div>
  );
}
