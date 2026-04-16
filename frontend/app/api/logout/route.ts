import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    ok: true,
    message: "Logout realizado com sucesso",
  });

  response.cookies.set("admin_auth", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return response;
}