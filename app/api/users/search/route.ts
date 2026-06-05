import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  return proxyRequest(req, {
    path: "/users/search",
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: q.length >= 2 ? [
        { user_id: "usr-010", name: "Fatima Al-Rashid", email: "fatima@example.com", avatar_url: undefined, is_already_registered: false, is_already_invited: false },
        { user_id: "usr-011", name: "Yusuf Malik", email: "yusuf@example.com", avatar_url: undefined, is_already_registered: false, is_already_invited: false },
      ] : [],
      metadata: { total: q.length >= 2 ? 2 : 0, page: 1, per_page: 10, total_pages: 1 },
    },
  });
}
