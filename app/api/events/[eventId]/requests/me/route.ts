import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";

type Ctx = { params: { eventId: string } };

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/requests/me`,
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: { status: "none", organizer_reply: null },
    },
  });
}
