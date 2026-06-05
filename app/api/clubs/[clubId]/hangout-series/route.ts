import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";

type Ctx = { params: { clubId: string } };

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/clubs/${params.clubId}/hangout-series`,
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: [],
      metadata: { total: 0, page: 1, per_page: 20, total_pages: 1 },
    },
  });
}

export async function POST(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/clubs/${params.clubId}/hangout-series`,
    method: "POST",
    mockData: { success: true, message: "Series created", data: { series_id: "series-new-001" } },
  });
}
