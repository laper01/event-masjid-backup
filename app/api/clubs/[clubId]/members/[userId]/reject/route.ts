import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";

type Ctx = { params: { clubId: string; userId: string } };

export async function DELETE(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/clubs/${params.clubId}/members/${params.userId}/reject`,
    method: "DELETE",
    mockData: { success: true, message: "Member rejected", data: null },
  });
}
