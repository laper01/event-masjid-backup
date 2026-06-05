import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";
import { mockRevenueAnalytics } from "@/mocks/analytics.mock";

type Ctx = { params: { eventId: string } };

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/analytics/revenue`,
    method: "GET",
    mockData: { success: true, message: "ok", data: mockRevenueAnalytics },
  });
}
