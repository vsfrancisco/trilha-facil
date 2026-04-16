import { NextRequest, NextResponse } from "next/server";

const SESSION_MAX_AGE = 60 * 5;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      return NextResponse.json(
        { detail: "Credenciais do servidor não configuradas" },
        { status: 500 }
      );
    }

    if (username !== adminUsername || password !== adminPassword) {
      return NextResponse.json(
        { detail: "Usuário ou senha inválidos" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      message: "Login realizado com sucesso",
    });

    response.cookies.set("admin_auth", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { detail: "Erro ao processar login" },
      { status: 500 }
    );
  }
}