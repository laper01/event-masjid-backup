import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";
import { mockTicketPurchases } from "@/mocks/tickets.mock";

type Ctx = { params: { eventId: string } };

// Build attendee rows from ticket purchases
const mockAttendees = mockTicketPurchases.map((t) => ({
  rsvp_id: `rsvp-${t.ticket_id}`,
  ticket_id: t.ticket_id,
  user_id: t.buyer_id,
  name: t.buyer_name,
  email: t.buyer_email,
  avatar_url: undefined,
  tier_name: t.tier_name,
  checked_in: t.checked_in,
  checked_in_at: t.checked_in_at,
  checked_in_by: t.checked_in ? "Admin" : undefined,
  rsvp_status: t.status === "completed" ? "confirmed" : "pending_payment",
}));

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/attendees`,
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: mockAttendees,
      metadata: { total: mockAttendees.length, page: 1, per_page: 50, total_pages: 1 },
    },
  });
}
