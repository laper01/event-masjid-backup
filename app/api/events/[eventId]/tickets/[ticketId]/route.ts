import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";
import { mockTicketPurchases } from "@/mocks/tickets.mock";

type Ctx = { params: { eventId: string; ticketId: string } };

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const ticket = mockTicketPurchases.find((t) => t.ticket_id === params.ticketId)
    ?? mockTicketPurchases[0];
  return proxyRequest(req, {
    path: `/events/${params.eventId}/tickets/${params.ticketId}`,
    method: "GET",
    mockData: { success: true, message: "ok", data: ticket },
  });
}
