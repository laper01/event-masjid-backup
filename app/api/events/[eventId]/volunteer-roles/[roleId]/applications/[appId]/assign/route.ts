import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";

type Ctx = { params: { eventId: string; roleId: string; appId: string } };

export async function PATCH(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/volunteer-roles/${params.roleId}/applications/${params.appId}/assign`,
    method: "PATCH",
    mockData: { success: true, message: "Volunteer assigned", data: null },
  });
}
