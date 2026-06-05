import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";
import { mockHangoutDetail } from "@/mocks/hangouts.mock";

type Ctx = { params: { hangoutId: string } };

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/hangouts/${params.hangoutId}`,
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: { ...mockHangoutDetail, hangout_id: params.hangoutId },
    },
  });
}

export async function PATCH(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/hangouts/${params.hangoutId}`,
    method: "PATCH",
    mockData: { success: true, message: "Hangout updated", data: null },
  });
}

export async function DELETE(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/hangouts/${params.hangoutId}`,
    method: "DELETE",
    mockData: { success: true, message: "Hangout cancelled", data: null },
  });
}
