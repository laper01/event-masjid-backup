import { NextRequest, NextResponse } from "next/server";
import { proxyRequest } from "@/lib/proxyHelper";
import { mockClubDetail } from "@/mocks/clubs.mock";

type Ctx = { params: { clubId: string } };

// Build mock member list from club detail
const mockMembers = [
  {
    user_id: mockClubDetail.admin.user_id,
    name: mockClubDetail.admin.name,
    email: "admin@example.com",
    avatar_url: undefined,
    role: "admin",
    status: "active",
    joined_at: mockClubDetail.founded_at,
  },
  ...mockClubDetail.member_preview.map((m) => ({
    user_id: m.user_id,
    name: m.name,
    email: `${m.name.toLowerCase().replace(" ", "")}@example.com`,
    avatar_url: undefined,
    role: "member",
    status: "active",
    joined_at: "2026-03-01T00:00:00Z",
  })),
];

export async function GET(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "active";
  const filtered = status === "pending" ? [] : mockMembers;

  return proxyRequest(req, {
    path: `/clubs/${params.clubId}/members`,
    method: "GET",
    mockData: {
      success: true,
      message: "ok",
      data: filtered,
      metadata: { total: filtered.length, page: 1, per_page: 20, total_pages: 1 },
    },
  });
}
