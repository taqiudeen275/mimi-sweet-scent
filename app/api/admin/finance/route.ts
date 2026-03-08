import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["ADMIN", "MANAGER"];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now      = new Date();
  const today    = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd   = new Date(now.getFullYear(), now.getMonth(), 0);
  const yearStart      = new Date(now.getFullYear(), 0, 1);

  const paidWhere = { paymentStatus: "PAID" as const };

  const [
    allTimeRevenue,
    todayRevenue,
    thisMonthRevenue,
    lastMonthRevenue,
    yearRevenue,
    totalOrders,
    ordersByStatus,
    ordersByPayment,
    // Last 12 months — fetch all paid orders in 12 months
    last12MonthsOrders,
    // Top products by revenue
    topOrderItems,
    // Discount usage
    discounts,
    // Recent orders (last 20)
    recentOrders,
    avgOrderValue,
  ] = await Promise.all([
    prisma.order.aggregate({ where: paidWhere, _sum: { totalAmount: true } }),
    prisma.order.aggregate({ where: { ...paidWhere, createdAt: { gte: today } }, _sum: { totalAmount: true } }),
    prisma.order.aggregate({ where: { ...paidWhere, createdAt: { gte: thisMonthStart } }, _sum: { totalAmount: true } }),
    prisma.order.aggregate({ where: { ...paidWhere, createdAt: { gte: lastMonthStart, lte: lastMonthEnd } }, _sum: { totalAmount: true } }),
    prisma.order.aggregate({ where: { ...paidWhere, createdAt: { gte: yearStart } }, _sum: { totalAmount: true } }),
    prisma.order.count(),
    prisma.order.groupBy({ by: ["status"], _count: { status: true } }),
    prisma.order.groupBy({ by: ["paymentStatus"], _count: { paymentStatus: true } }),
    // Last 12 months orders for monthly chart
    prisma.order.findMany({
      where: { ...paidWhere, createdAt: { gte: new Date(now.getFullYear(), now.getMonth() - 11, 1) } },
      select: { totalAmount: true, createdAt: true },
    }),
    // Top order items by revenue
    prisma.orderItem.findMany({
      select: {
        quantity: true,
        unitPrice: true,
        productSnapshot: true,
      },
      take: 500, // reasonable limit — aggregate in JS
    }),
    // Discount codes with usage
    prisma.discountCode.findMany({
      select: { code: true, type: true, value: true, usageCount: true, usageLimit: true, active: true, createdAt: true },
      orderBy: { usageCount: "desc" },
    }),
    // Recent paid orders
    prisma.order.findMany({
      where: paidWhere,
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, email: true, totalAmount: true, status: true, discountCode: true, discountAmount: true, createdAt: true },
    }),
    prisma.order.aggregate({ where: paidWhere, _avg: { totalAmount: true } }),
  ]);

  // Build monthly revenue chart (last 12 months)
  const months: Record<string, number> = {};
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months[`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`] = 0;
  }
  for (const order of last12MonthsOrders) {
    const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (key in months) months[key] += order.totalAmount;
  }
  const monthlyRevenue = Object.entries(months).map(([month, revenue]) => ({
    month,
    revenue,
    label: new Date(month + "-01").toLocaleString("en", { month: "short", year: "2-digit" }),
  }));

  // Aggregate top products from order items
  const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  for (const item of topOrderItems) {
    const snap = item.productSnapshot as Record<string, unknown>;
    const name = typeof snap?.name === "string" ? snap.name : "Unknown";
    const key  = name;
    if (!productMap[key]) productMap[key] = { name, qty: 0, revenue: 0 };
    productMap[key].qty     += item.quantity;
    productMap[key].revenue += item.unitPrice * item.quantity;
  }
  const topProducts = Object.values(productMap)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Calculate total discount given
  const totalDiscountGiven = await prisma.order.aggregate({
    _sum: { discountAmount: true },
  });

  return NextResponse.json({
    revenue: {
      allTime:   allTimeRevenue._sum.totalAmount   ?? 0,
      today:     todayRevenue._sum.totalAmount     ?? 0,
      thisMonth: thisMonthRevenue._sum.totalAmount ?? 0,
      lastMonth: lastMonthRevenue._sum.totalAmount ?? 0,
      yearToDate: yearRevenue._sum.totalAmount     ?? 0,
      avgOrderValue: Math.round(avgOrderValue._avg.totalAmount ?? 0),
      totalDiscountGiven: totalDiscountGiven._sum.discountAmount ?? 0,
    },
    orders: {
      total: totalOrders,
      byStatus:  Object.fromEntries(ordersByStatus.map(r  => [r.status,        r._count.status])),
      byPayment: Object.fromEntries(ordersByPayment.map(r => [r.paymentStatus, r._count.paymentStatus])),
    },
    monthlyRevenue,
    topProducts,
    discounts,
    recentOrders,
  });
}
