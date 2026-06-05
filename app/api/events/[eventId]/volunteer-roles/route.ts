import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";
import { mockVolunteerRoles } from "@/mocks/volunteers.mock";

type Ctx = { params: { eventId: string } };

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const roles = mockVolunteerRoles.map((r) => ({ ...r, event_id: params.eventId }));
  return proxyRequest(req, {
    path: `/events/${params.eventId}/volunteer-roles`,
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: roles,
      metadata: { total: roles.length, page: 1, per_page: 20, total_pages: 1 },
    },
  });
}

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/volunteer-roles`,
    method: "POST",
    mockData: { success: true, message: "Role created", data: { role_id: "role-new-001" } },
  });
}
