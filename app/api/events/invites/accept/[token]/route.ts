import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";

type Ctx = { params: { token: string } };

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/invites/accept/${params.token}`,
    method: "POST",
    mockData: {
      success: true,
      message: "Invitation accepted",
      data: { rsvp_id: "rsvp-invite-001", status: "confirmed" },
    },
  });
}
