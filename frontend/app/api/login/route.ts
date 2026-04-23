import { NextRequest, NextResponse } from 'next/server';

function logEvent(event: string, data: Record<string, unknown> = {}) {
  console.log(
    JSON.stringify({
      source: 'frontend-api',
      route: '/api/login',
      event,
      timestamp: new Date().toISOString(),
      ...data,
    })
  );
}

export async function POST(request: NextRequest) {
  const start = Date.now();

  try {
    const body = await request.json();
    const username = typeof body?.username === 'string' ? body.username : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    logEvent('login_attempt', {
      method: 'POST',
      has_username: Boolean(username),
    });

    if (!username || !password) {
      logEvent('login_failed_validation', {
        method: 'POST',
        reason: 'missing_credentials',
        duration_ms: Date.now() - start,
      });

      return NextResponse.json(
        { error: 'Usuário e senha são obrigatórios.' },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL;
    const adminToken = process.env.ADMIN_API_TOKEN;

    if (!backendUrl || !adminToken) {
      logEvent('login_failed_env', {
        method: 'POST',
        has_backend_url: Boolean(backendUrl),
        has_admin_token: Boolean(adminToken),
        duration_ms: Date.now() - start,
      });

      return NextResponse.json(
        { error: 'Configuração do servidor incompleta.' },
        { status: 500 }
      );
    }

    const response = await fetch(`${backendUrl}/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({ username, password }),
      cache: 'no-store',
    });

    if (!response.ok) {
      logEvent('login_failed_backend', {
        method: 'POST',
        backend_status: response.status,
        duration_ms: Date.now() - start,
      });

      return NextResponse.json(
        { error: 'Credenciais inválidas.' },
        { status: response.status === 401 ? 401 : 500 }
      );
    }

    const data = await response.json();
    const sessionToken = data?.token;

    if (!sessionToken) {
      logEvent('login_failed_backend_payload', {
        method: 'POST',
        reason: 'missing_token',
        duration_ms: Date.now() - start,
      });

      return NextResponse.json(
        { error: 'Resposta inválida do servidor.' },
        { status: 500 }
      );
    }

    const nextResponse = NextResponse.json({ success: true }, { status: 200 });

    nextResponse.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });

    logEvent('login_success', {
      method: 'POST',
      duration_ms: Date.now() - start,
    });

    return nextResponse;
  } catch (error) {
    logEvent('login_unexpected_error', {
      method: 'POST',
      duration_ms: Date.now() - start,
      error_type: error instanceof Error ? error.name : 'UnknownError',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Erro interno ao processar login.' },
      { status: 500 }
    );
  }
}