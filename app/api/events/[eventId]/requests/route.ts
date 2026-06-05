import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";
import { mockPendingRequests } from "@/mocks/approvals.mock";

type Ctx = { params: { eventId: string } };

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "pending";

  const filtered = status === "pending"
    ? mockPendingRequests
    : mockPendingRequests.map((r) => ({ ...r, status: "approved" as const }));

  return proxyRequest(req, {
    path: `/events/${params.eventId}/requests`,
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: filtered,
      metadata: { total: filtered.length, page: 1, per_page: 20, total_pages: 1 },
    },
  });
}

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/requests`,
    method: "POST",
    mockData: {
      success: true,
      message: "Request submitted",
      data: { request_id: "req-mock-001", status: "pending" },
    },
  });
}
