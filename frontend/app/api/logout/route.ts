import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

function logEvent(event: string, data: Record<string, unknown> = {}) {
  console.log(
    JSON.stringify({
      source: 'frontend-api',
      route: '/api/logout',
      event,
      timestamp: new Date().toISOString(),
      ...data,
    })
  );
}

export async function POST(_request: NextRequest) {
  const start = Date.now();

  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('admin_session')?.value;

    if (!session) {
      logEvent('logout_without_session', {
        method: 'POST',
        duration_ms: Date.now() - start,
      });

      return NextResponse.json({ success: true }, { status: 200 });
    }

    const response = NextResponse.json({ success: true }, { status: 200 });

    response.cookies.set('admin_session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    logEvent('logout_success', {
      method: 'POST',
      duration_ms: Date.now() - start,
    });

    return response;
  } catch (error) {
    logEvent('logout_unexpected_error', {
      method: 'POST',
      duration_ms: Date.now() - start,
      error_type: error instanceof Error ? error.name : 'UnknownError',
      error_message: error instanceof Error ? error.message : 'Unknown error',
    });

    return NextResponse.json(
      { error: 'Erro interno ao processar logout.' },
      { status: 500 }
    );
  }
}