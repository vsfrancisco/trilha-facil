import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const authCookie = request.cookies.get("admin_auth")?.value;

  const isDashboardRoute = pathname.startsWith("/dashboard");
  const isLoginRoute = pathname.startsWith("/login");

  if (isDashboardRoute && authCookie !== "true") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isLoginRoute && authCookie === "true") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};