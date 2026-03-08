import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_ROLES = ["ADMIN", "MANAGER"];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const week  = new Date(today); week.setDate(week.getDate() - 7);
  const month = new Date(today); month.setDate(month.getDate() - 30);
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
    // Last 30 days daily view counts - using findMany then aggregating
    prisma.pageView.findMany({
      where: { createdAt: { gte: month } },
      select: { createdAt: true },
    }),
    // Orders and revenue today
    prisma.order.count({ where: { createdAt: { gte: today }, paymentStatus: "PAID" } }),
    prisma.order.aggregate({
      where: { createdAt: { gte: today }, paymentStatus: "PAID" },
      _sum: { totalAmount: true },
    }),
  ]);

  // Build daily views map
  const dailyMap: Record<string, number> = {};
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dailyMap[d.toISOString().slice(0, 10)] = 0;
  }
  for (const pv of dailyViews) {
    const key = pv.createdAt.toISOString().slice(0, 10);
    if (key in dailyMap) dailyMap[key]++;
  }
  const daily = Object.entries(dailyMap).map(([date, views]) => ({ date, views }));

  return NextResponse.json({
    summary: {
      totalToday,
      totalWeek,
      totalMonth,
      totalPrevMonth,
      trendPercent: totalPrevMonth > 0
        ? Math.round(((totalMonth - totalPrevMonth) / totalPrevMonth) * 100)
        : null,
      ordersToday,
      revenueToday: revenueToday._sum.totalAmount ?? 0,
    },
    topPages: topPages.map(p => ({ path: p.path, views: p._count.path })),
    topReferrers: topReferrers.map(r => ({ referrer: r.referrer ?? "direct", views: r._count.referrer })),
    deviceSplit: { mobile: mobileCount, desktop: desktopCount },
    daily,
  });
}
