import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";

type Ctx = { params: { clubId: string } };

export async function DELETE(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/clubs/${params.clubId}/leave`,
    method: "DELETE",
    mockData: { success: true, message: "Left club", data: null },
  });
}
