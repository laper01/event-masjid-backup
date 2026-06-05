import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";
import { mockClubCards } from "@/mocks/clubs.mock";

export async function GET(req: NextRequest): Promise<NextResponse> {
  return proxyRequest(req, {
    path: "/clubs",
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: mockClubCards,
      metadata: { total: mockClubCards.length, page: 1, per_page: 20, total_pages: 1 },
    },
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return proxyRequest(req, {
    path: "/clubs",
    method: "POST",
    mockData: { success: true, message: "Club created", data: { club_id: "clb-new-001" } },
  });
}
