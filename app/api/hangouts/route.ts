import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";
import { mockHangoutDetail } from "@/mocks/hangouts.mock";

export async function GET(req: NextRequest): Promise<NextResponse> {
  return proxyRequest(req, {
    path: "/hangouts",
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: [mockHangoutDetail],
      metadata: { total: 1, page: 1, per_page: 20, total_pages: 1 },
    },
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return proxyRequest(req, {
    path: "/hangouts",
    method: "POST",
    mockData: { success: true, message: "Hangout created", data: { hangout_id: "hng-new-001" } },
  });
}
