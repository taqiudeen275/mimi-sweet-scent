import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const path = typeof body.path === "string" ? body.path.slice(0, 500) : null;
    if (!path) return NextResponse.json({ ok: false }, { status: 400 });

    const ua = req.headers.get("user-agent") ?? "";
    const isMobile = /mobile|android|iphone|ipad|ipod/i.test(ua);
    const referrer = typeof body.referrer === "string" ? body.referrer.slice(0, 500) : null;

    // Fire and forget — don't await in the response
    prisma.pageView.create({
      data: {
        path,
        referrer: referrer || null,
        userAgent: ua.slice(0, 300),
        sessionId: typeof body.sessionId === "string" ? body.sessionId.slice(0, 100) : null,
        isMobile,
      },
    }).catch(() => {});

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
