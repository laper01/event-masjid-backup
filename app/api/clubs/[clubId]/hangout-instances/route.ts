import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";
import { mockHangoutInstances } from "@/mocks/hangouts.mock";

type Ctx = { params: { clubId: string } };

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/clubs/${params.clubId}/hangout-instances`,
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: mockHangoutInstances,
      metadata: { total: mockHangoutInstances.length, page: 1, per_page: 20, total_pages: 1 },
    },
  });
}
