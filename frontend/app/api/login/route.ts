import { NextRequest, NextResponse } from "next/server";
import { encrypt } from "@/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    const expectedUsername = process.env.ADMIN_USERNAME;
    const expectedPassword = process.env.ADMIN_PASSWORD;
    const authSecret = process.env.AUTH_SECRET;

    console.log("LOGIN ENV CHECK", {
      hasUsername: !!expectedUsername,
      hasPassword: !!expectedPassword,
      hasAuthSecret: !!authSecret,
      nodeEnv: process.env.NODE_ENV,
    });

    if (!expectedUsername || !expectedPassword || !authSecret) {
      return NextResponse.json(
        { detail: "Variáveis de ambiente de autenticação não configuradas." },
        { status: 500 }
      );
    }

    if (username !== expectedUsername || password !== expectedPassword) {
      return NextResponse.json(
        { detail: "Usuário ou senha inválidos." },
        { status: 401 }
      );
    }

    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 8;

    const session = await encrypt({
      username,
      role: "admin",
      expiresAt,
    });

    const response = NextResponse.json({ ok: true });

    response.cookies.set("session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: new Date(expiresAt * 1000),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("LOGIN ROUTE ERROR:", error);

    return NextResponse.json(
      { detail: "Erro ao processar login." },
      { status: 500 }
    );
  }
}