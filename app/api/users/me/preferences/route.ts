import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";
import { mockUserPreferences } from "@/mocks/user.mock";

export async function GET(req: NextRequest): Promise<NextResponse> {
  return proxyRequest(req, {
    path: "/users/me/preferences",
    method: "GET",
    mockData: { success: true, message: "ok", data: mockUserPreferences },
  });
}

export async function PATCH(req: NextRequest): Promise<NextResponse> {
  return proxyRequest(req, {
    path: "/users/me/preferences",
    method: "PATCH",
    mockData: { success: true, message: "Preferences updated", data: mockUserPreferences },
  });
}
