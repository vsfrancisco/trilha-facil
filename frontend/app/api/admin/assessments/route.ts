import { NextRequest } from "next/server";
import { adminApiFetch } from "@/lib/admin-api";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("session")?.value;
  const search = request.nextUrl.search;

  return adminApiFetch(sessionCookie, `/api/assessments${search}`, {
    method: "GET",
  });
}