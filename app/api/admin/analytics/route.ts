import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["ADMIN", "MANAGER"];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now       = new Date();
  const today     = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const week      = new Date(today); week.setDate(week.getDate() - 7);
  const month     = new Date(today); month.setDate(month.getDate() - 30);
  const prevMonth = new Date(today); prevMonth.setDate(prevMonth.getDate() - 60);

  const [
    totalToday,
    totalWeek,
    totalMonth,
    totalPrevMonth,
    topPages,
    topReferrers,
    mobileCount,
    desktopCount,
    dailyViews,
    ordersToday,
    revenueToday,
    ordersWeek,
    revenueWeek,
    ordersMonth,
    revenueMonth,
    ordersPrevMonth,
    revenuePrevMonth,
    newCustomersToday,
    newCustomersMonth,
    activeProducts,
    // Unique visitors — distinct visitorIds in each window
    uniqueToday,
    uniqueWeek,
    uniqueMonth,
    uniquePrevMonth,
  ] = await Promise.all([
    prisma.pageView.count({ where: { createdAt: { gte: today } } }),
    prisma.pageView.count({ where: { createdAt: { gte: week } } }),
    prisma.pageView.count({ where: { createdAt: { gte: month } } }),
    prisma.pageView.count({ where: { createdAt: { gte: prevMonth, lt: month } } }),
    // Top pages last 30 days
    prisma.pageView.groupBy({
      by: ["path"],
      where: { createdAt: { gte: month } },
      _count: { path: true },
      orderBy: { _count: { path: "desc" } },
      take: 10,
    }),
    // Top referrers last 30 days
    prisma.pageView.groupBy({
      by: ["referrer"],
      where: { createdAt: { gte: month }, referrer: { not: null } },
      _count: { referrer: true },
      orderBy: { _count: { referrer: "desc" } },
      take: 8,
    }),
    prisma.pageView.count({ where: { createdAt: { gte: month }, isMobile: true } }),
    prisma.pageView.count({ where: { createdAt: { gte: month }, isMobile: false } }),
    // Last 30 days daily views (for chart)
    prisma.pageView.findMany({
      where: { createdAt: { gte: month } },
      select: { createdAt: true, visitorId: true },
    }),
    // Business: orders & revenue
    prisma.order.count({ where: { createdAt: { gte: today }, paymentStatus: "PAID" } }),
    prisma.order.aggregate({ where: { createdAt: { gte: today }, paymentStatus: "PAID" }, _sum: { totalAmount: true } }),
    prisma.order.count({ where: { createdAt: { gte: week }, paymentStatus: "PAID" } }),
    prisma.order.aggregate({ where: { createdAt: { gte: week }, paymentStatus: "PAID" }, _sum: { totalAmount: true } }),
    prisma.order.count({ where: { createdAt: { gte: month }, paymentStatus: "PAID" } }),
    prisma.order.aggregate({ where: { createdAt: { gte: month }, paymentStatus: "PAID" }, _sum: { totalAmount: true } }),
    prisma.order.count({ where: { createdAt: { gte: prevMonth, lt: month }, paymentStatus: "PAID" } }),
    prisma.order.aggregate({ where: { createdAt: { gte: prevMonth, lt: month }, paymentStatus: "PAID" }, _sum: { totalAmount: true } }),
    // New customers
    prisma.user.count({ where: { createdAt: { gte: today }, role: "CUSTOMER" } }),
    prisma.user.count({ where: { createdAt: { gte: month }, role: "CUSTOMER" } }),
    // Active products
    prisma.product.count({ where: { status: "ACTIVE" } }),
    // Unique visitors — groupBy visitorId then count distinct rows
    prisma.pageView.groupBy({ by: ["visitorId"], where: { createdAt: { gte: today }, visitorId: { not: null } } }),
    prisma.pageView.groupBy({ by: ["visitorId"], where: { createdAt: { gte: week }, visitorId: { not: null } } }),
    prisma.pageView.groupBy({ by: ["visitorId"], where: { createdAt: { gte: month }, visitorId: { not: null } } }),
    prisma.pageView.groupBy({ by: ["visitorId"], where: { createdAt: { gte: prevMonth, lt: month }, visitorId: { not: null } } }),
  ]);

  // Build daily views + unique visitors map
  const dailyMap: Record<string, { views: number; visitors: Set<string> }> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dailyMap[d.toISOString().slice(0, 10)] = { views: 0, visitors: new Set() };
  }
  for (const pv of dailyViews) {
    const key = pv.createdAt.toISOString().slice(0, 10);
    if (key in dailyMap) {
      dailyMap[key].views++;
      if (pv.visitorId) dailyMap[key].visitors.add(pv.visitorId);
    }
  }
  const daily = Object.entries(dailyMap).map(([date, { views, visitors }]) => ({
    date,
    views,
    uniqueVisitors: visitors.size,
  }));

  const revMonthAmt  = revenueMonth._sum.totalAmount  ?? 0;
  const revPrevAmt   = revenuePrevMonth._sum.totalAmount ?? 0;
  const ordersTrend  = ordersPrevMonth > 0
    ? Math.round(((ordersMonth - ordersPrevMonth) / ordersPrevMonth) * 100) : null;
  const revenueTrend = revPrevAmt > 0
    ? Math.round(((revMonthAmt - revPrevAmt) / revPrevAmt) * 100) : null;

  return NextResponse.json({
    business: {
      ordersToday,
      revenueToday:  revenueToday._sum.totalAmount ?? 0,
      ordersWeek,
      revenueWeek:   revenueWeek._sum.totalAmount ?? 0,
      ordersMonth,
      revenueMonth:  revMonthAmt,
      ordersTrend,
      revenueTrend,
      newCustomersToday,
      newCustomersMonth,
      activeProducts,
    },
    traffic: {
      visitorsToday:    uniqueToday.length,
      visitorsWeek:     uniqueWeek.length,
      visitorsMonth:    uniqueMonth.length,
      visitorsTrend:    uniquePrevMonth.length > 0
        ? Math.round(((uniqueMonth.length - uniquePrevMonth.length) / uniquePrevMonth.length) * 100)
        : null,
      pageViewsToday:   totalToday,
      pageViewsWeek:    totalWeek,
      pageViewsMonth:   totalMonth,
      pageViewsTrend:   totalPrevMonth > 0
        ? Math.round(((totalMonth - totalPrevMonth) / totalPrevMonth) * 100)
        : null,
      deviceSplit: { mobile: mobileCount, desktop: desktopCount },
    },
    topPages:     topPages.map(p => ({ path: p.path, views: p._count.path })),
    topReferrers: topReferrers.map(r => ({ referrer: r.referrer ?? "direct", views: r._count.referrer })),
    daily,
  });
}
