import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";

type Ctx = { params: { eventId: string; ticketId: string } };

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/tickets/${params.ticketId}/cancel`,
    method: "POST",
    mockData: {
      success: true,
      message: "Ticket cancelled",
      data: { refund_initiated: true, refund_amount: 20.0 },
    },
  });
}
