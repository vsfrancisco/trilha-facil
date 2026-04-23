import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const backendUrl =
      process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

    if (!backendUrl) {
      console.error("BACKEND_URL não configurada no ambiente.");
      return NextResponse.json(
        { error: "Erro de configuração do servidor." },
        { status: 500 }
      );
    }

    const response = await fetch(`${backendUrl}/api/assessment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.error ||
            data?.detail ||
            "Falha ao comunicar com o backend.",
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Erro no proxy /api/assessments:", error);

    return NextResponse.json(
      { error: "Erro interno ao processar assessment." },
      { status: 500 }
    );
  }
}