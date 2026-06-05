import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";
import { mockEventDetail, mockAdminEventRows } from "@/mocks/events.mock";

type Ctx = { params: { eventId: string } };

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  // Find matching mock or return default
  const adminRow = mockAdminEventRows.find((e) => e.event_id === params.eventId);
  return proxyRequest(req, {
    path: `/events/${params.eventId}`,
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: { ...mockEventDetail, event_id: params.eventId, title: adminRow?.title ?? mockEventDetail.title },
    },
  });
}

export async function PATCH(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}`,
    method: "PATCH",
    mockData: { success: true, message: "Event updated", data: mockEventDetail },
  });
}

export async function DELETE(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}`,
    method: "DELETE",
    mockData: { success: true, message: "Event deleted", data: null },
  });
}
