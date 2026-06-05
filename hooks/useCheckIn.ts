"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { AttendeeRow, TicketDetailData, CheckInStats } from "@/types/checkin";
import type { ApiResponse, ApiPaginatedResponse } from "@/types/api";

// ── Attendee List ──────────────────────────────────────────────────────────────

export function useAttendees(eventId: string, search?: string) {
  return useQuery<ApiPaginatedResponse<AttendeeRow>>({
    queryKey: ["attendees", eventId, search],
    queryFn: () =>
      axios
        .get(`/api/events/${eventId}/attendees`, {
          params: search ? { search } : {},
        })
        .then((r) => r.data),
    enabled: !!eventId,
  });
}

// ── Check-in Stats ─────────────────────────────────────────────────────────────

export function useCheckInStats(eventId: string) {
  return useQuery<ApiResponse<CheckInStats>>({
    queryKey: ["checkin-stats", eventId],
    queryFn: () =>
      axios.get(`/api/events/${eventId}/checkin/stats`).then((r) => r.data),
    enabled: !!eventId,
    refetchInterval: 15000,
  });
}

// ── Manual Check-in ────────────────────────────────────────────────────────────

export function useCheckIn(eventId: string) {
  const qc = useQueryClient();
  return useMutation<
    ApiResponse<{ checked_in_at: string }>,
    Error,
    { rsvp_id: string; note?: string }
  >({
    mutationFn: (payload) =>
      axios.post(`/api/events/${eventId}/checkin`, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendees", eventId] });
      qc.invalidateQueries({ queryKey: ["checkin-stats", eventId] });
    },
  });
}

// ── Undo Check-in ──────────────────────────────────────────────────────────────

export function useUndoCheckIn(eventId: string) {
  const qc = useQueryClient();
  return useMutation<ApiResponse<void>, Error, { rsvp_id: string }>({
    mutationFn: ({ rsvp_id }) =>
      axios
        .delete(`/api/events/${eventId}/checkin/${rsvp_id}`)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["attendees", eventId] });
      qc.invalidateQueries({ queryKey: ["checkin-stats", eventId] });
    },
  });
}

// ── QR Scan ────────────────────────────────────────────────────────────────────

export function useQRScan(eventId: string) {
  return useMutation<
    ApiResponse<{
      status: "success" | "already_scanned" | "invalid" | "expired" | "wrong_event";
      ticket_id?: string;
      attendee_name?: string;
      tier_name?: string;
      event_title?: string;
      scanned_at?: string;
    }>,
    Error,
    { qr_token: string }
  >({
    mutationFn: (payload) =>
      axios
        .post(`/api/events/${eventId}/checkin/scan`, payload)
        .then((r) => r.data),
  });
}

// ── Ticket Detail ──────────────────────────────────────────────────────────────
// FIX: was separate useTicketDetail in useCheckIn — path is correct

export function useTicketDetail(eventId: string, ticketId: string) {
  return useQuery<ApiResponse<TicketDetailData>>({
    queryKey: ["ticket-detail", eventId, ticketId],
    queryFn: () =>
      axios
        .get(`/api/events/${eventId}/tickets/${ticketId}`)
        .then((r) => r.data),
    enabled: !!ticketId,
  });
}
