import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";

type Ctx = { params: { eventId: string } };

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/checkin`,
    method: "GET",
    mockData: { success: true, message: "ok", data: [], metadata: { total: 0, page: 1, per_page: 50, total_pages: 1 } },
  });
}

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/checkin`,
    method: "POST",
    mockData: {
      success: true,
      message: "Checked in successfully",
      data: { checked_in_at: new Date().toISOString() },
    },
  });
}
