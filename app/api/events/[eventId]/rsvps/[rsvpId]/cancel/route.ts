import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";

type Ctx = { params: { eventId: string; rsvpId: string } };

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/rsvps/${params.rsvpId}/cancel`,
    method: "POST",
    mockData: { success: true, message: "RSVP cancelled", data: null },
  });
}
