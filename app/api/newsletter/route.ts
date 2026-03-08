import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rateLimit";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email("Please provide a valid email address."),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting: 5 signups per IP per hour
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const rl = checkRateLimit(`newsletter:${ip}`, { max: 5, windowMs: 60 * 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { success: false, message: "Too many requests. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    const body: unknown = await request.json();
    const result = schema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.error.issues[0]?.message ?? "Invalid email." },
        { status: 400 }
      );
    }

    const { email } = result.data;

    // Upsert — re-subscribing is fine
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { active: true, subscribedAt: new Date() },
      create: { email },
    });

    return NextResponse.json(
      { success: true, message: "You're on the list!" },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
