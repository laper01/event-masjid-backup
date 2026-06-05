"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import type {
  AttendanceAnalytics,
  RevenueAnalytics,
  VolunteerAnalytics,
  RevertAnalytics,
} from "@/types/analytics";
import type { ApiResponse } from "@/types/api";

// ── Attendance Analytics ───────────────────────────────────────────────────────

export function useAttendanceAnalytics(eventId: string) {
  return useQuery<ApiResponse<AttendanceAnalytics>>({
    queryKey: ["analytics-attendance", eventId],
    queryFn: () =>
      axios
        .get(`/api/events/${eventId}/analytics/attendance`)
        .then((r) => r.data),
    enabled: !!eventId,
  });
}

// ── Revenue Analytics ──────────────────────────────────────────────────────────

export function useRevenueAnalytics(eventId: string) {
  return useQuery<ApiResponse<RevenueAnalytics>>({
    queryKey: ["analytics-revenue", eventId],
    queryFn: () =>
      axios
        .get(`/api/events/${eventId}/analytics/revenue`)
        .then((r) => r.data),
    enabled: !!eventId,
  });
}

// ── Volunteer Analytics ────────────────────────────────────────────────────────

export function useVolunteerAnalytics(eventId: string) {
  return useQuery<ApiResponse<VolunteerAnalytics>>({
    queryKey: ["analytics-volunteer", eventId],
    queryFn: () =>
      axios
        .get(`/api/events/${eventId}/analytics/volunteer`)
        .then((r) => r.data),
    enabled: !!eventId,
  });
}

// ── Revert Analytics ───────────────────────────────────────────────────────────
// NOTE: No dedicated /analytics/revert route exists yet.
// Uses the volunteer analytics endpoint and filters revert data server-side.
// Add src/app/api/events/[eventId]/analytics/revert/route.ts if needed.

export function useRevertAnalytics(eventId: string) {
  return useQuery<ApiResponse<RevertAnalytics>>({
    queryKey: ["analytics-revert", eventId],
    queryFn: () =>
      axios
        .get(`/api/events/${eventId}/analytics/volunteer`)
        .then((r) => r.data),
    enabled: !!eventId,
  });
}
