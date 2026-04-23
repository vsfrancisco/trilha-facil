import { NextRequest, NextResponse } from "next/server";
import { decrypt, encrypt } from "@/lib/session";

const protectedRoutes = ["/dashboard"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const cookie = request.cookies.get("session")?.value;
  const session = await decrypt(cookie);

  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/login") && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const response = NextResponse.next();

  if (session) {
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 8;

    const refreshedSession = await encrypt({
      username: session.username,
      role: "admin",
      expiresAt,
    });

    response.cookies.set("session", refreshedSession, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(expiresAt * 1000),
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
};