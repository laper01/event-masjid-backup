import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";
import { mockMyHangouts } from "@/mocks/hangouts.mock";

export async function GET(req: NextRequest): Promise<NextResponse> {
  return proxyRequest(req, {
    path: "/hangouts/me",
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: {
        attending: mockMyHangouts.filter((h) => h.role === "attendee"),
        hosting: mockMyHangouts.filter((h) => h.role === "organizer"),
      },
    },
  });
}
