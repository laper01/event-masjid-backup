"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type { AdminEventRow } from "@/types/events";
import type { ApiPaginatedResponse } from "@/types/api";

/* ─────────────────────────────────────────────────────────────────
   EVT-ORG-01
   useMyAdminEvents — events created by the authenticated organizer

   Route:   GET /api/admin/events
   Backend: GET /api/v2/events/me

   Drop-in replacement for useAdminEvents().
   Identical response shape (AdminEventRow[]) — no other code changes needed.
   Just swap:
     const { data } = useAdminEvents()
     →
     const { data } = useMyAdminEvents()
───────────────────────────────────────────────────────────────── */

export interface MyAdminEventsParams {
  /** Filter by event status. Omit for all statuses. */
  status?: "published" | "draft" | "completed" | "cancelled" | "all";
  /** Partial title search */
  search?: string;
  /** Scope to one masjid (if organizer manages multiple) */
  masjid_id?: string;
  /** Filter by whether the event has paid ticket tiers */
  has_tickets?: boolean;
  /** ISO 8601 — events with start_time >= this date */
  from?: string;
  /** ISO 8601 — events with start_time <= this date */
  to?: string;
  /** Page number (default: 1) */
  page?: number;
  /** Items per page (default: 20, max: 100) */
  limit?: number;
}

export function useMyAdminEvents(params?: MyAdminEventsParams) {
  return useQuery<ApiPaginatedResponse<AdminEventRow>>({
    queryKey: ["my-admin-events", params],
    queryFn: () =>
      axios
        .get("/api/admin/events", {
          params: {
            ...params,
            // Remove undefined values so they don't appear as "undefined" in URL
            ...(params?.status     !== undefined && { status:      params.status }),
            ...(params?.search     !== undefined && { search:      params.search }),
            ...(params?.masjid_id  !== undefined && { masjid_id:  params.masjid_id }),
            ...(params?.has_tickets !== undefined && { has_tickets: params.has_tickets }),
            ...(params?.from       !== undefined && { from:        params.from }),
            ...(params?.to         !== undefined && { to:          params.to }),
            ...(params?.page       !== undefined && { page:        params.page }),
            ...(params?.limit      !== undefined && { limit:       params.limit }),
          },
        })
        .then((r) => r.data),
    staleTime: 1000 * 60,
  });
}