import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req: NextRequest & { auth: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Protect /admin/* — must be authenticated AND have admin/manager/staff role
  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      const loginUrl = new URL("/account/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const adminRoles = ["ADMIN", "MANAGER", "FULFILLMENT_STAFF", "CONTENT_EDITOR"];
    if (!adminRoles.includes(session.user.role ?? "")) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protect /account/profile and /account/orders — must be authenticated
  if (pathname.startsWith("/account/profile") || pathname.startsWith("/account/orders")) {
    if (!session?.user) {
      const loginUrl = new URL("/account/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/admin/:path*",
    "/account/profile/:path*",
    "/account/orders/:path*",
  ],
};
