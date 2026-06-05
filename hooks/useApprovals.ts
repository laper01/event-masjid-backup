"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { ApprovalRequest, DecidedRequest } from "@/types/approvals";
import type { ApiResponse, ApiPaginatedResponse } from "@/types/api";

// ── Pending Requests ──────────────────────────────────────────────────────────

export function usePendingApprovals(eventId: string) {
  return useQuery<ApiPaginatedResponse<ApprovalRequest>>({
    queryKey: ["approvals", eventId, "pending"],
    queryFn: () =>
      axios.get(`/api/events/${eventId}/requests?status=pending`).then((r) => r.data),
    enabled: !!eventId,
    refetchInterval: 30000,
  });
}

// ── Decided Requests ──────────────────────────────────────────────────────────

export function useDecidedApprovals(eventId: string) {
  return useQuery<ApiPaginatedResponse<DecidedRequest>>({
    queryKey: ["approvals", eventId, "decided"],
    queryFn: () =>
      axios.get(`/api/events/${eventId}/requests?status=decided`).then((r) => r.data),
    enabled: !!eventId,
  });
}

// ── Submit Request (Consumer) ─────────────────────────────────────────────────

export function useSubmitRequest(eventId: string) {
  const qc = useQueryClient();
  return useMutation<ApiResponse<{ request_id: string; status: string }>, Error, { message: string }>({
    mutationFn: (payload) =>
      axios.post(`/api/events/${eventId}/requests`, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["event", eventId] });
    },
  });
}

// ── Poll My Request Status ─────────────────────────────────────────────────────

export function useMyRequestStatus(eventId: string, enabled: boolean) {
  return useQuery<ApiResponse<{ status: string; organizer_reply?: string }>>({
    queryKey: ["my-request", eventId],
    queryFn: () =>
      axios.get(`/api/events/${eventId}/requests/me`).then((r) => r.data),
    enabled,
    refetchInterval: 30000,
  });
}

// ── Decide Request (Admin) ────────────────────────────────────────────────────

export function useDecideRequest(eventId: string) {
  const qc = useQueryClient();
  return useMutation<
    ApiResponse<void>,
    Error,
    { request_id: string; decision: "approved" | "denied"; reply?: string }
  >({
    mutationFn: ({ request_id, decision, reply }) =>
      axios
        .post(`/api/events/${eventId}/requests/${request_id}/decide`, { decision, reply })
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["approvals", eventId] });
    },
  });
}
