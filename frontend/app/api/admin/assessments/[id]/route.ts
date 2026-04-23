import { NextRequest } from "next/server";
import { adminApiFetch } from "@/lib/admin-api";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(request: NextRequest, context: Context) {
  const sessionCookie = request.cookies.get("session")?.value;
  const { id } = await context.params;

  return adminApiFetch(sessionCookie, `/api/assessments/${id}`, {
    method: "GET",
  });
}

export async function DELETE(request: NextRequest, context: Context) {
  const sessionCookie = request.cookies.get("session")?.value;
  const { id } = await context.params;

  return adminApiFetch(sessionCookie, `/api/assessments/${id}`, {
    method: "DELETE",
  });
}