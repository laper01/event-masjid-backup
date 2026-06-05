import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";
import { mockAccessMembers } from "@/mocks/approvals.mock";

type Ctx = { params: { eventId: string } };

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/access-members`,
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: mockAccessMembers,
      metadata: { total: mockAccessMembers.length, page: 1, per_page: 20, total_pages: 1 },
    },
  });
}
