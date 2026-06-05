import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";

type Ctx = { params: { eventId: string } };

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/register`,
    method: "POST",
    mockData: {
      success: true,
      message: "Registration successful",
      data: {
        rsvp_id: "rsvp-mock-001",
        status: "confirmed",
        event_id: params.eventId,
        client_secret: undefined,
      },
    },
  });
}
