"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { EventCard, EventDetail, DiscoverFilters, CreateEventPayload, AdminEventRow } from "@/types/events";
import type { ApiResponse, ApiPaginatedResponse } from "@/types/api";

// ── Feed ──────────────────────────────────────────────────────────────────────

export function useFeed(filter: string = "all") {
  return useQuery<ApiPaginatedResponse<EventCard>>({
    queryKey: ["feed", filter],
    queryFn: () =>
      axios.get(`/api/events/feed?filter=${filter}`).then((r) => r.data),
    staleTime: 1000 * 60 * 2,
  });
}

// ── Discover ──────────────────────────────────────────────────────────────────

export function useDiscover(filters: DiscoverFilters) {
  return useQuery<ApiPaginatedResponse<EventCard>>({
    queryKey: ["discover", filters],
    queryFn: () =>
      axios.get("/api/events/discover", { params: filters }).then((r) => r.data),
    staleTime: 1000 * 60,
  });
}

// ── Event Detail ──────────────────────────────────────────────────────────────

export function useEventDetail(eventId: string) {
  return useQuery<ApiResponse<EventDetail>>({
    queryKey: ["event", eventId],
    queryFn: () =>
      axios.get(`/api/events/${eventId}`).then((r) => r.data),
    enabled: !!eventId,
  });
}

// ── Admin Events ──────────────────────────────────────────────────────────────
// FIX: was /api/admin/events — route does not exist, correct path is /api/events

export function useAdminEvents(masjidId?: string) {
  return useQuery<ApiPaginatedResponse<AdminEventRow>>({
    queryKey: ["admin-events", masjidId],
    queryFn: () =>
      axios
        .get("/api/events", { params: masjidId ? { masjid_id: masjidId } : {} })
        .then((r) => r.data),
    // masjidId is optional — always fetch even if not provided
    enabled: true,
  });
}

// ── Create Event ──────────────────────────────────────────────────────────────

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation<ApiResponse<{ event_id: string }>, Error, CreateEventPayload>({
    mutationFn: (payload) =>
      axios.post("/api/events", payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });
}

// ── Update Event ──────────────────────────────────────────────────────────────

export function useUpdateEvent(eventId: string) {
  const qc = useQueryClient();
  return useMutation<ApiResponse<EventDetail>, Error, Partial<CreateEventPayload>>({
    mutationFn: (payload) =>
      axios.patch(`/api/events/${eventId}`, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event", eventId] });
      qc.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });
}

// ── Publish Event ─────────────────────────────────────────────────────────────
// FIX: route /api/events/[eventId]/publish needs to exist (add to routes zip)

export function usePublishEvent(eventId: string) {
  const qc = useQueryClient();
  return useMutation<ApiResponse<{ status: string }>, Error, void>({
    mutationFn: () =>
      axios.post(`/api/events/${eventId}/publish`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event", eventId] });
      qc.invalidateQueries({ queryKey: ["admin-events"] });
    },
  });
}

// ── RSVP ──────────────────────────────────────────────────────────────────────

export function useRSVP(eventId: string) {
  const qc = useQueryClient();
  return useMutation<
    ApiResponse<{ rsvp_id: string; status: string; client_secret?: string }>,
    Error,
    { tier_id?: string; promo_code?: string }
  >({
    mutationFn: (payload) =>
      axios.post(`/api/events/${eventId}/register`, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event", eventId] });
      qc.invalidateQueries({ queryKey: ["my-tickets"] });
    },
  });
}

// ── Beginner Events ───────────────────────────────────────────────────────────

export function useBeginnerEvents(filter: string = "all", page: number = 1) {
  return useQuery<ApiPaginatedResponse<EventCard>>({
    queryKey: ["beginner-events", filter, page],
    queryFn: () =>
      axios
        .get("/api/events/discover", {
          params: { is_beginner_friendly: true, filter, page, per_page: 12 },
        })
        .then((r) => r.data),
  });
}
