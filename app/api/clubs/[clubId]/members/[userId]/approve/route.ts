import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";

type Ctx = { params: { clubId: string; userId: string } };

export async function PATCH(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/clubs/${params.clubId}/members/${params.userId}/approve`,
    method: "PATCH",
    mockData: { success: true, message: "Member approved", data: null },
  });
}
