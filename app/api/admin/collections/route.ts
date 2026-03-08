import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

const ADMIN_ROLES = ["ADMIN", "MANAGER", "CONTENT_EDITOR"];

export async function GET() {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const collections = await prisma.collection.findMany({
    orderBy: { position: "asc" },
    select: { id: true, name: true, slug: true },
  });

  return NextResponse.json({ data: collections });
}
