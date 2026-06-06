import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { proxyRequest } from "@/lib/proxyHelper";
import { mockAdminEventRows } from "@/mocks/events.mock";

/**
 * EVT-ORG-01
 * GET /api/admin/events
 *
 * Returns events created by the currently authenticated organizer.
 * Backend path: GET /api/v2/events/me
 *
 * The backend extracts organizer_id from the Bearer JWT automatically —
 * no user_id query param is sent. This route just forwards the request.
 *
 * Query params forwarded:
 *   status    - published | draft | completed | cancelled | all
 *   search    - partial title search
 *   masjid_id - scope to one masjid (organizer may manage multiple)
 *   has_tickets - boolean
 *   from / to - ISO 8601 date range
 *   page / limit
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  // Verify session — only organizer / admin role
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  const role = (session as { role?: string }).role;
  if (role && role !== "organizer" && role !== "admin") {
    return NextResponse.json(
      { success: false, message: "Organizer role required" },
      { status: 403 }
    );
  }

  return proxyRequest(req, {
    path: "/events/me",
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: mockAdminEventRows,
      metadata: {
        total: mockAdminEventRows.length,
        page: 1,
        per_page: 20,
        total_pages: 1,
      },
    },
  });
}