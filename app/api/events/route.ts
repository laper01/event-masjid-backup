import { NextRequest, NextResponse } from "next/server";
import { proxyGET, proxyPOST } from "@/lib/proxyHelper";
import { mockAdminEventRows } from "@/mocks/events.mock";

export async function GET(req: NextRequest): Promise<NextResponse> {
  return proxyGET(req, "/events", {
    success: true,
    message: "ok",
    data: mockAdminEventRows,
    metadata: { total: mockAdminEventRows.length, page: 1, per_page: 20, total_pages: 1 },
  });
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  return proxyPOST(req, "/events", {
    success: true,
    message: "Event created successfully",
    data: { event_id: "evt-new-001" },
  });
}
