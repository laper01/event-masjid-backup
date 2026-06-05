import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";
import { mockDirectInvites } from "@/mocks/approvals.mock";

type Ctx = { params: { eventId: string } };

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/invites`,
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: mockDirectInvites,
      metadata: { total: mockDirectInvites.length, page: 1, per_page: 20, total_pages: 1 },
    },
  });
}

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/invites`,
    method: "POST",
    mockData: { success: true, message: "Invite sent", data: { invite_id: "inv-new-001" } },
  });
}
