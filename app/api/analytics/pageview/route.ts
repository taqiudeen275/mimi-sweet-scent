import { NextRequest, NextResponse } from "next/server";
import { createHmac, randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "mimi_vid";
const COOKIE_MAX_AGE = 365 * 24 * 60 * 60; // 1 year in seconds

/**
 * Derive a pseudonymous visitor ID from IP + user-agent.
 * Uses a daily rotating salt so the same IP hashes differently each day —
 * no long-term tracking, just enough for same-day unique visitor counts.
 */
function hashedVisitorId(ip: string, ua: string): string {
  const dailySalt = new Date().toISOString().slice(0, 10); // "2026-03-08"
  return createHmac("sha256", dailySalt)
    .update(`${ip}|${ua}`)
    .digest("hex")
    .slice(0, 16); // 16 hex chars is plenty
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const path = typeof body.path === "string" ? body.path.slice(0, 500) : null;
    if (!path) return NextResponse.json({ ok: false }, { status: 400 });

    const ua       = req.headers.get("user-agent") ?? "";
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(ua);
    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null;

    // ── Visitor identification (priority order) ───────────────────────────────
    // 1. Persistent cookie   — same person across tabs & return visits (best)
    // 2. Hashed IP+UA        — fallback when cookies are blocked/private mode
    let visitorId   = req.cookies.get(COOKIE_NAME)?.value ?? null;
    let setCookie   = false;

    if (!visitorId) {
      const ip  = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
               ?? req.headers.get("x-real-ip")
               ?? "unknown";

      if (ip !== "unknown") {
        // Hashed IP fallback — pseudonymous, rotates daily
        visitorId = `h_${hashedVisitorId(ip, ua)}`;
      } else {
        // Last resort: random ID (won't persist but avoids null)
        visitorId = `r_${randomUUID().slice(0, 12)}`;
      }
      setCookie = true; // new visitor — set the cookie
    }

    const sessionId = typeof body.sessionId === "string"
      ? body.sessionId.slice(0, 100)
      : null;

    // Fire-and-forget write
    prisma.pageView.create({
      data: {
        path,
        referrer:  referrer || null,
        userAgent: ua.slice(0, 300),
        sessionId,
        visitorId,
        isMobile,
      },
    }).catch(() => {});

    const res = NextResponse.json({ ok: true });

    // Set the persistent visitor cookie if this is a new visitor
    if (setCookie) {
      res.cookies.set(COOKIE_NAME, visitorId, {
        maxAge:   COOKIE_MAX_AGE,
        httpOnly: true,
        sameSite: "lax",
        path:     "/",
        secure:   process.env.NODE_ENV === "production",
      });
    }

    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
