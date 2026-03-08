import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !["ADMIN"].includes(session.user.role ?? "")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { host, port, secure, user, pass, fromName, fromEmail } = await req.json();

  if (!host || !user || !pass) {
    return NextResponse.json({ error: "host, user, and pass are required" }, { status: 400 });
  }

  try {
    const transport = nodemailer.createTransport({
      host,
      port:   Number(port ?? 587),
      secure: secure === "true" || secure === true,
      auth:   { user, pass },
    });

    await transport.verify();

    await transport.sendMail({
      from:    `"${fromName ?? "Mimi's Sweet Scent"}" <${fromEmail || user}>`,
      to:      session.user.email ?? user,
      subject: "✓ Email connection test — Mimi's Sweet Scent",
      html:    `<p style="font-family:sans-serif">Your SMTP connection is working correctly.<br><br>This test was sent from the admin settings panel.</p>`,
    });

    return NextResponse.json({ success: true, message: `Test email sent to ${session.user.email ?? user}` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 422 });
  }
}
