import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";

type Ctx = { params: { eventId: string; roleId: string } };

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/volunteer-roles/${params.roleId}/apply`,
    method: "POST",
    mockData: {
      success: true,
      message: "Application submitted",
      data: { application_id: "app-mock-001" },
    },
  });
}
