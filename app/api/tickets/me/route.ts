import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";
import {
  mockUpcomingTickets,
  mockWaitlistedTickets,
  mockPastTickets,
  mockCancelledTickets,
} from "@/mocks/tickets.mock";

export async function GET(req: NextRequest): Promise<NextResponse> {
  return proxyRequest(req, {
    path: "/tickets/me",
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: {
        upcoming: mockUpcomingTickets,
        waitlisted: mockWaitlistedTickets,
        past: mockPastTickets,
        cancelled: mockCancelledTickets,
      },
    },
  });
}
