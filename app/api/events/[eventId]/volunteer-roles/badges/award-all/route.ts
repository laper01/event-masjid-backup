import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";
import { mockAssignedVolunteers } from "@/mocks/volunteers.mock";

type Ctx = { params: { eventId: string } };

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/events/${params.eventId}/volunteer-roles/badges/award-all`,
    method: "POST",
    mockData: {
      success: true,
      message: `${mockAssignedVolunteers.filter((v) => !v.badge_awarded).length} badges awarded`,
      data: { badges_awarded: mockAssignedVolunteers.filter((v) => !v.badge_awarded).length },
    },
  });
}
