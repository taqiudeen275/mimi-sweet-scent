import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { z } from "zod";
import { logAudit } from "@/lib/auditLog";

const ADMIN_ROLES = ["ADMIN", "MANAGER", "FULFILLMENT_STAFF"];

const updateOrderSchema = z.object({
  status:        z.enum(["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"]).optional(),
  trackingNumber:z.string().optional(),
  carrier:       z.string().optional(),
  notes:         z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const ipAddress = req.headers.get("x-forwarded-for") ?? "unknown";
  const { id } = await params;
  const body = await req.json();

  const parsed = updateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  // Fetch current order to capture the previous status for the audit log
  const previousOrder = await prisma.order.findUnique({
    where: { id },
    select: { status: true },
  });

  const order = await prisma.order.update({
    where: { id },
    data:  parsed.data,
  });

  if (parsed.data.status !== undefined) {
    logAudit({
      action:     "ORDER_STATUS_CHANGED",
      category:   "admin",
      entityType: "Order",
      entityId:   id,
      actorId:    session.user.id,
      actorEmail: session.user.email ?? undefined,
      details:    {
        from:    previousOrder?.status ?? "UNKNOWN",
        to:      parsed.data.status,
        orderId: id,
      },
      ipAddress,
    });
  }

  return NextResponse.json({ data: order });
}
