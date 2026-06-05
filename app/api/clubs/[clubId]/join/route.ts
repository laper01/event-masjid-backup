import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";

type Ctx = { params: { clubId: string } };

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/clubs/${params.clubId}/join`,
    method: "POST",
    mockData: { success: true, message: "Joined club", data: { status: "active" } },
  });
}
