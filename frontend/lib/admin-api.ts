import { decrypt } from "@/lib/session";

type RequestOptions = {
  method?: "GET" | "DELETE";
};

export async function adminApiFetch(
  sessionCookie: string | undefined,
  path: string,
  options: RequestOptions = {}
) {
  const session = await decrypt(sessionCookie);

  if (!session) {
    return new Response(
      JSON.stringify({ detail: "Sessão inválida ou expirada." }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  const adminApiToken = process.env.ADMIN_API_TOKEN;

  if (!apiBaseUrl || !adminApiToken) {
    return new Response(
      JSON.stringify({ detail: "Ambiente do servidor não configurado." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const response = await fetch(`${apiBaseUrl}${path}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        "X-Admin-Token": adminApiToken,
      },
      cache: "no-store",
    });

    const text = await response.text();

    return new Response(text, {
      status: response.status,
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/json",
      },
    });
  } catch {
    return new Response(
      JSON.stringify({ detail: "Erro ao comunicar com o backend." }),
      {
        status: 502,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}