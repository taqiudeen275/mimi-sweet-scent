import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface AuditLogPayload {
  action: string;
  category: "admin" | "security" | "payment" | "system";
  entityType?: string;
  entityId?: string;
  actorId?: string;
  actorEmail?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

/** Fire-and-forget — never throws, never awaited in hot paths */
export function logAudit(payload: AuditLogPayload): void {
  prisma.auditLog
    .create({
      data: {
        ...payload,
        // Prisma 7 Json nullable field requires Prisma.JsonNull sentinel
        details: payload.details !== undefined
          ? (payload.details as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      },
    })
    .catch(() => {
      // Silently swallow — logging must never break the request
    });
}
