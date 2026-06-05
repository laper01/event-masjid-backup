import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";

type Ctx = { params: { eventId: string; inviteId: string } };

export async function DELETE(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/invites/${params.inviteId}`,
    method: "DELETE",
    mockData: { success: true, message: "Invite revoked", data: null },
  });
}
