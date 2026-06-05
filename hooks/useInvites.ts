"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { DirectInviteRecord, AccessMember, UserSearchResult } from "@/types/approvals";
import type { ApiResponse, ApiPaginatedResponse } from "@/types/api";

// ── Link Invites ──────────────────────────────────────────────────────────────

export function useLinkInvites(eventId: string) {
  return useQuery({
    queryKey: ["link-invites", eventId],
    queryFn: () =>
      axios.get(`/api/events/${eventId}/invites?type=link`).then((r) => r.data),
    enabled: !!eventId,
  });
}

// ── Direct Invites ────────────────────────────────────────────────────────────

export function useDirectInvites(eventId: string) {
  return useQuery<ApiPaginatedResponse<DirectInviteRecord>>({
    queryKey: ["direct-invites", eventId],
    queryFn: () =>
      axios.get(`/api/events/${eventId}/invites?type=direct`).then((r) => r.data),
    enabled: !!eventId,
  });
}

// ── Access Members ────────────────────────────────────────────────────────────

export function useAccessMembers(eventId: string) {
  return useQuery<ApiPaginatedResponse<AccessMember>>({
    queryKey: ["access-members", eventId],
    queryFn: () =>
      axios.get(`/api/events/${eventId}/access-members`).then((r) => r.data),
    enabled: !!eventId,
  });
}

// ── Send Direct Invite ────────────────────────────────────────────────────────

export function useSendDirectInvite(eventId: string) {
  const qc = useQueryClient();
  return useMutation<ApiResponse<{ invite_id: string }>, Error, {
    recipient_email: string;
    recipient_id?: string;
    personal_message?: string;
    expires_in_hours?: number;
  }>({
    mutationFn: (payload) =>
      axios.post(`/api/events/${eventId}/invites`, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["direct-invites", eventId] });
    },
  });
}

// ── Accept Invite (Consumer) ──────────────────────────────────────────────────

export function useAcceptInvite() {
  return useMutation<ApiResponse<{ rsvp_id: string; status: string }>, Error, { token: string }>({
    mutationFn: ({ token }) =>
      axios.post(`/api/events/invites/accept/${token}`).then((r) => r.data),
  });
}

// ── Revoke Invite ─────────────────────────────────────────────────────────────

export function useRevokeInvite(eventId: string) {
  const qc = useQueryClient();
  return useMutation<ApiResponse<void>, Error, { invite_id: string }>({
    mutationFn: ({ invite_id }) =>
      axios.delete(`/api/events/${eventId}/invites/${invite_id}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["direct-invites", eventId] });
      qc.invalidateQueries({ queryKey: ["access-members", eventId] });
    },
  });
}

// ── Search Users ──────────────────────────────────────────────────────────────

export function useSearchUsers(query: string, eventId: string) {
  return useQuery<ApiPaginatedResponse<UserSearchResult>>({
    queryKey: ["user-search", query, eventId],
    queryFn: () =>
      axios
        .get("/api/users/search", { params: { q: query, event_id: eventId } })
        .then((r) => r.data),
    enabled: query.length >= 2,
  });
}
