import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";

type Ctx = { params: { ticketId: string } };

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  return proxyRequest(req, {
    path: `/tickets/${params.ticketId}/qr`,
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: {
        qr_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=TKT-${params.ticketId}-MOCK`,
        qr_token: `TKT-${params.ticketId.toUpperCase()}-MOCK`,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      },
    },
  });
}
