"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";

/**
 * Represents a club managed by the authenticated organizer.
 * Returned by GET /api/admin/clubs (BFF → /api/v2/clubs?role=admin)
 */
export interface AdminClubRow {
  club_id: string;
  name: string;
  description: string;
  category: string;
  visibility: "public" | "approval_required" | "private";
  city: string;
  country: string;
  member_count: number;
  pending_requests: number;
  is_active: boolean;
  cover_image_url?: string | null;
  founded_at: string;
  caller_role: "admin" | "moderator";
}

export interface MyAdminClubsParams {
  search?: string;
  category?: string;
  status?: "active" | "inactive" | "all";
  page?: number;
  limit?: number;
}

export function useMyAdminClubs(params?: MyAdminClubsParams) {
  return useQuery<{ data: AdminClubRow[]; metadata: { total: number; page: number; per_page: number; total_pages: number } }>({
    queryKey: ["my-admin-clubs", params],
    queryFn: () =>
      axios
        .get("/api/admin/clubs", { params })
        .then((r) => r.data),
    staleTime: 1000 * 60,
  });
}