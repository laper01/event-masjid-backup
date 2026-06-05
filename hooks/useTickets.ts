"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { UpcomingTicket, WaitlistedTicket, PastTicket, CancelledTicket, TicketPurchase } from "@/types/tickets";
import type { ApiResponse, ApiPaginatedResponse } from "@/types/api";

// ── My Tickets ────────────────────────────────────────────────────────────────

export function useMyTickets() {
  return useQuery<ApiResponse<{
    upcoming: UpcomingTicket[];
    waitlisted: WaitlistedTicket[];
    past: PastTicket[];
    cancelled: CancelledTicket[];
  }>>({
    queryKey: ["my-tickets"],
    queryFn: () => axios.get("/api/tickets/me").then((r) => r.data),
    staleTime: 1000 * 60,
  });
}

// ── QR Ticket ─────────────────────────────────────────────────────────────────

export function useQRTicket(ticketId: string) {
  return useQuery<ApiResponse<{ qr_url: string; qr_token: string; expires_at: string }>>({
    queryKey: ["qr-ticket", ticketId],
    queryFn: () => axios.get(`/api/tickets/${ticketId}/qr`).then((r) => r.data),
    enabled: !!ticketId,
    staleTime: 1000 * 60 * 23,
  });
}

// ── Cancel Ticket ─────────────────────────────────────────────────────────────
// FIX: was /api/events/${eventId}/tickets/${ticket_id}/cancel — correct path

export function useCancelTicket(eventId: string) {
  const qc = useQueryClient();
  return useMutation<ApiResponse<{ refund_initiated: boolean }>, Error, { ticket_id: string }>({
    mutationFn: ({ ticket_id }) =>
      axios
        .post(`/api/events/${eventId}/tickets/${ticket_id}/cancel`)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-tickets"] });
    },
  });
}

// ── Cancel RSVP ───────────────────────────────────────────────────────────────

export function useCancelRSVP(eventId: string) {
  const qc = useQueryClient();
  return useMutation<ApiResponse<void>, Error, { rsvp_id: string }>({
    mutationFn: ({ rsvp_id }) =>
      axios
        .post(`/api/events/${eventId}/rsvps/${rsvp_id}/cancel`)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-tickets"] });
      qc.invalidateQueries({ queryKey: ["event"] });
    },
  });
}

// ── Promo Code ────────────────────────────────────────────────────────────────
// FIX: was GET with ?code= query param — kept same since route handles it

export function useValidatePromo(eventId: string) {
  return useMutation<
    ApiResponse<{ discount_type: string; discount_value: number; display: string }>,
    Error,
    { code: string }
  >({
    mutationFn: ({ code }) =>
      axios
        .get(`/api/events/${eventId}/promo-codes?code=${code}`)
        .then((r) => r.data),
  });
}

// ── Admin Purchases ───────────────────────────────────────────────────────────

export function useAdminPurchases(eventId: string) {
  return useQuery<ApiPaginatedResponse<TicketPurchase>>({
    queryKey: ["admin-purchases", eventId],
    queryFn: () =>
      axios.get(`/api/events/${eventId}/tickets`).then((r) => r.data),
    enabled: !!eventId,
  });
}

// ── Ticket Tiers ──────────────────────────────────────────────────────────────

export function useTicketTiers(eventId: string) {
  return useQuery({
    queryKey: ["ticket-tiers", eventId],
    queryFn: () =>
      axios.get(`/api/events/${eventId}/ticket-tiers`).then((r) => r.data),
    enabled: !!eventId,
  });
}

// ── Ticket Detail (Admin) ─────────────────────────────────────────────────────

export function useAdminTicketDetail(eventId: string, ticketId: string) {
  return useQuery<ApiResponse<TicketPurchase>>({
    queryKey: ["ticket-detail", eventId, ticketId],
    queryFn: () =>
      axios.get(`/api/events/${eventId}/tickets/${ticketId}`).then((r) => r.data),
    enabled: !!ticketId,
  });
}
