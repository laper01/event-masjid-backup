import { NextRequest, NextResponse } from "next/server";
import { proxyGET } from "@/lib/proxyHelper";
import { mockEventCards } from "@/mocks/events.mock";

export async function GET(req: NextRequest): Promise<NextResponse> {
  return proxyGET(req, "/events/feed", {
    success: true,
    message: "ok",
    data: mockEventCards,
    metadata: { total: mockEventCards.length, page: 1, per_page: 20, total_pages: 1 },
  });
}
