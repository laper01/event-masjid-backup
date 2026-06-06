import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { proxyRequest } from "@/lib/proxyHelper";

/**
 * GET /api/admin/clubs
 *
 * Returns clubs managed by the authenticated organizer.
 * Backend path: GET /api/v2/clubs?role=admin
 *
 * Query params forwarded:
 *   search   - partial name search
 *   category - filter by category
 *   status   - active | inactive | all
 *   page / limit
 */

const mockClubs = [
  {
    club_id: "club-001",
    name: "Mataram Brothers FC",
    description: "A community football club fostering sportsmanship and brotherhood in Mataram.",
    category: "Sports",
    visibility: "approval_required",
    city: "Mataram",
    country: "ID",
    member_count: 28,
    pending_requests: 3,
    is_active: true,
    cover_image_url: null,
    founded_at: "2024-01-01T00:00:00Z",
    caller_role: "admin",
  },
  {
    club_id: "club-002",
    name: "Al-Huda Youth Circle",
    description: "Fostering spiritual growth and community engagement for brothers aged 16-25.",
    category: "Youth",
    visibility: "public",
    city: "Jakarta",
    country: "ID",
    member_count: 54,
    pending_requests: 7,
    is_active: true,
    cover_image_url: null,
    founded_at: "2023-06-15T00:00:00Z",
    caller_role: "admin",
  },
  {
    club_id: "club-003",
    name: "Tech Ummah Collective",
    description: "Muslim developers and designers building tech for the community.",
    category: "Technology",
    visibility: "private",
    city: "Surabaya",
    country: "ID",
    member_count: 17,
    pending_requests: 0,
    is_active: false,
    cover_image_url: null,
    founded_at: "2023-11-20T00:00:00Z",
    caller_role: "admin",
  },
];

export async function GET(req: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 }
    );
  }

  return proxyRequest(req, {
    path: "/clubs?role=admin",
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: mockClubs,
      metadata: {
        total: mockClubs.length,
        page: 1,
        per_page: 20,
        total_pages: 1,
      },
    },
  });
}