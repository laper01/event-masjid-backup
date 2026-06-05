import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";

type Ctx = { params: { eventId: string } };

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/checkin/scan`,
    method: "POST",
    mockData: {
      success: true,
      message: "ok",
      data: {
        status: "success",
        ticket_id: "tkt-001",
        attendee_name: "Ahmad Bin Yusuf",
        tier_name: "General Admission",
        event_title: "Arabic Calligraphy Workshop",
        scanned_at: new Date().toISOString(),
      },
    },
  });
}
