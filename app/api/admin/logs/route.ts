import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED_ROLES = ["ADMIN", "MANAGER"];

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const page     = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const limit    = 50;
  const category = searchParams.get("category") || undefined;
  const from     = searchParams.get("from") ? new Date(searchParams.get("from")!) : undefined;
  const to       = searchParams.get("to")   ? new Date(searchParams.get("to")!)   : undefined;

  const where = {
    ...(category && { category }),
    ...((from || to) ? {
      createdAt: {
        ...(from && { gte: from }),
        ...(to   && { lte: to   }),
      },
    } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return NextResponse.json({ logs, total, page, pages: Math.ceil(total / limit) });
}
