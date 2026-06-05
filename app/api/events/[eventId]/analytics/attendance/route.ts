import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";
import { mockAttendanceAnalytics } from "@/mocks/analytics.mock";

type Ctx = { params: { eventId: string } };

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/analytics/attendance`,
    method: "GET",
    mockData: { success: true, message: "ok", data: mockAttendanceAnalytics },
  });
}
