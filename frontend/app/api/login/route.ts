import { NextRequest, NextResponse } from "next/server";

function logEvent(event: string, data: Record<string, unknown> = {}) {
  console.log(
    JSON.stringify({
      source: "frontend-api",
      route: "/api/login",
      event,
      timestamp: new Date().toISOString(),
      ...data,
    })
  );
}

function sanitizeRedirectPath(value: unknown) {
  if (typeof value !== "string") return "/dashboard";
  if (!value.startsWith("/")) return "/dashboard";
  if (value.startsWith("//")) return "/dashboard";
  return value;
}

export async function POST(request: NextRequest) {
  const start = Date.now();

  try {
    const body = await request.json();

    const username = typeof body?.username === "string" ? body.username : "";
    const password = typeof body?.password === "string" ? body.password : "";
    const redirectTo = sanitizeRedirectPath(body?.redirectTo);

    logEvent("login_attempt", {
      method: "POST",
      has_username: Boolean(username),
      redirect_to: redirectTo,
    });

    if (!username || !password) {
      logEvent("login_failed_validation", {
        method: "POST",
        reason: "missing_credentials",
        duration_ms: Date.now() - start,
      });

      return NextResponse.json(
        { error: "Usuário e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminToken = process.env.ADMIN_API_TOKEN;

    logEvent("login_env_check", {
      method: "POST",
      admin_username_exists: Boolean(adminUsername),
      admin_password_exists: Boolean(adminPassword),
      admin_token_exists: Boolean(adminToken),
    });

    if (!adminUsername || !adminPassword || !adminToken) {
      logEvent("login_failed_env", {
        method: "POST",
        has_admin_username: Boolean(adminUsername),
        has_admin_password: Boolean(adminPassword),
        has_admin_token: Boolean(adminToken),
        duration_ms: Date.now() - start,
      });

      return NextResponse.json(
        { error: "Configuração do servidor incompleta." },
        { status: 500 }
      );
    }

    if (username !== adminUsername || password !== adminPassword) {
      logEvent("login_failed_invalid_credentials", {
        method: "POST",
        duration_ms: Date.now() - start,
      });

      return NextResponse.json(
        { error: "Credenciais inválidas." },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        redirectTo,
      },
      { status: 200 }
    );

    response.cookies.set("admin_session", adminToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    logEvent("login_success", {
      method: "POST",
      redirect_to: redirectTo,
      duration_ms: Date.now() - start,
    });

    return response;
  } catch (error) {
    logEvent("login_unexpected_error", {
      method: "POST",
      duration_ms: Date.now() - start,
      error_type: error instanceof Error ? error.name : "UnknownError",
      error_message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: "Erro interno ao processar login." },
      { status: 500 }
    );
  }
}