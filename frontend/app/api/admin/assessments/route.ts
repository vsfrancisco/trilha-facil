import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function logEvent(event: string, data: Record<string, unknown> = {}) {
  console.log(
    JSON.stringify({
      source: "frontend-api",
      route: "/api/admin/assessments",
      event,
      timestamp: new Date().toISOString(),
      ...data,
    })
  );
}

export async function GET(request: NextRequest) {
  const start = Date.now();

  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;

    logEvent("assessments_list_session_check", {
      method: "GET",
      has_session: Boolean(session),
    });

    if (!session) {
      logEvent("assessments_list_unauthorized", {
        method: "GET",
        reason: "missing_session",
        duration_ms: Date.now() - start,
      });

      return NextResponse.json(
        { error: "Não autenticado." },
        { status: 401 }
      );
    }

    const backendUrl = process.env.BACKEND_URL;

    if (!backendUrl) {
      logEvent("assessments_list_env_error", {
        method: "GET",
        has_backend_url: false,
        duration_ms: Date.now() - start,
      });

      return NextResponse.json(
        { error: "Configuração do servidor incompleta." },
        { status: 500 }
      );
    }

    const search = request.nextUrl.searchParams.toString();
    const url = search
      ? `${backendUrl}/api/assessments?${search}`
      : `${backendUrl}/api/assessments`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Admin-Token": session,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const rawText = await response.text();

    logEvent("assessments_list_backend_response", {
      method: "GET",
      backend_status: response.status,
      sent_x_admin_token: true,
      response_preview: rawText.slice(0, 300),
      duration_ms: Date.now() - start,
    });

    if (!response.ok) {
      let parsedError: any = null;

      try {
        parsedError = rawText ? JSON.parse(rawText) : null;
      } catch {
        parsedError = null;
      }

      return NextResponse.json(
        {
          error:
            parsedError?.detail ||
            parsedError?.error ||
            "Erro ao buscar assessments.",
        },
        { status: response.status }
      );
    }

    let data: unknown = [];

    try {
      data = rawText ? JSON.parse(rawText) : [];
    } catch {
      data = [];
    }

    const count = Array.isArray(data) ? data.length : null;

    logEvent("assessments_list_success", {
      method: "GET",
      item_count: count,
      duration_ms: Date.now() - start,
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    logEvent("assessments_list_unexpected_error", {
      method: "GET",
      duration_ms: Date.now() - start,
      error_type: error instanceof Error ? error.name : "UnknownError",
      error_message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: "Erro interno ao buscar assessments." },
      { status: 500 }
    );
  }
}