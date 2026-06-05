import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";

type Ctx = { params: { eventId: string; rsvpId: string } };

export async function DELETE(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/checkin/${params.rsvpId}`,
    method: "DELETE",
    mockData: { success: true, message: "Check-in undone", data: null },
  });
}
