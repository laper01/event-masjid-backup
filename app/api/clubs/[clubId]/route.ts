import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";
import { mockClubDetail } from "@/mocks/clubs.mock";

type Ctx = { params: { clubId: string } };

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/clubs/${params.clubId}`,
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: { ...mockClubDetail, club_id: params.clubId },
    },
  });
}

export async function PATCH(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/clubs/${params.clubId}`,
    method: "PATCH",
    mockData: { success: true, message: "Club updated", data: null },
  });
}

export async function DELETE(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/clubs/${params.clubId}`,
    method: "DELETE",
    mockData: { success: true, message: "Club deleted", data: null },
  });
}
