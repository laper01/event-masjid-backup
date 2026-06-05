import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";

type Ctx = { params: { eventId: string } };

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/revert-hosts/register`,
    method: "POST",
    mockData: {
      success: true,
      message: "Registered as revert host",
      data: { host_registration_id: "host-mock-001" },
    },
  });
}
