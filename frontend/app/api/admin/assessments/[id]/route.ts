import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

function logEvent(event: string, data: Record<string, unknown> = {}) {
  console.log(
    JSON.stringify({
      source: "frontend-api",
      route: "/api/admin/assessments/[id]",
      event,
      timestamp: new Date().toISOString(),
      ...data,
    })
  );
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const start = Date.now();

  try {
    const { id } = await context.params;
    const cookieStore = await cookies();
    const session = cookieStore.get("admin_session")?.value;

    logEvent("assessment_delete_session_check", {
      method: "DELETE",
      assessment_id: id,
      has_session: Boolean(session),
    });

    if (!session) {
      logEvent("assessment_delete_unauthorized", {
        method: "DELETE",
        assessment_id: id,
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
      logEvent("assessment_delete_env_error", {
        method: "DELETE",
        assessment_id: id,
        has_backend_url: false,
        duration_ms: Date.now() - start,
      });

      return NextResponse.json(
        { error: "Configuração do servidor incompleta." },
        { status: 500 }
      );
    }

    const response = await fetch(`${backendUrl}/assessments/${id}`, {
      method: "DELETE",
      headers: {
        "X-Admin-Token": session,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const rawText = await response.text();

    logEvent("assessment_delete_backend_response", {
      method: "DELETE",
      assessment_id: id,
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
            "Erro ao excluir assessment.",
        },
        { status: response.status }
      );
    }

    let data: unknown = { success: true };

    try {
      data = rawText ? JSON.parse(rawText) : { success: true };
    } catch {
      data = { success: true };
    }

    logEvent("assessment_delete_success", {
      method: "DELETE",
      assessment_id: id,
      duration_ms: Date.now() - start,
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    logEvent("assessment_delete_unexpected_error", {
      method: "DELETE",
      duration_ms: Date.now() - start,
      error_type: error instanceof Error ? error.name : "UnknownError",
      error_message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      { error: "Erro interno ao excluir assessment." },
      { status: 500 }
    );
  }
}