import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";
import { mockTicketPurchases } from "@/mocks/tickets.mock";

type Ctx = { params: { eventId: string } };

const checkedIn = mockTicketPurchases.filter((t) => t.checked_in).length;

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/checkin/stats`,
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: {
        total_registered: mockTicketPurchases.length,
        total_checked_in: checkedIn,
        check_in_rate: Math.round((checkedIn / mockTicketPurchases.length) * 100),
        last_check_in_at: new Date().toISOString(),
      },
    },
  });
}
