"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { ClubDetailData, ClubCard, ClubMemberRequest, ClubSettings } from "@/types/clubs";
import type { ApiResponse, ApiPaginatedResponse } from "@/types/api";

// ── Discover Clubs ────────────────────────────────────────────────────────────

export function useDiscoverClubs(filters?: Record<string, unknown>) {
  return useQuery<ApiPaginatedResponse<ClubCard>>({
    queryKey: ["clubs", filters],
    queryFn: () => axios.get("/api/clubs", { params: filters }).then((r) => r.data),
  });
}

// ── Club Detail ────────────────────────────────────────────────────────────────

export function useClubDetail(clubId: string) {
  return useQuery<ApiResponse<ClubDetailData>>({
    queryKey: ["club", clubId],
    queryFn: () => axios.get(`/api/clubs/${clubId}`).then((r) => r.data),
    enabled: !!clubId,
  });
}

// ── Join Club ──────────────────────────────────────────────────────────────────

export function useJoinClub(clubId: string) {
  const qc = useQueryClient();
  return useMutation<ApiResponse<{ status: string }>, Error, void>({
    mutationFn: () => axios.post(`/api/clubs/${clubId}/join`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["club", clubId] });
    },
  });
}

// ── Leave Club ─────────────────────────────────────────────────────────────────

export function useLeaveClub(clubId: string) {
  const qc = useQueryClient();
  return useMutation<ApiResponse<void>, Error, void>({
    mutationFn: () => axios.delete(`/api/clubs/${clubId}/leave`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["club", clubId] });
    },
  });
}

// ── Pending Member Requests (Admin) ────────────────────────────────────────────

export function useClubPendingRequests(clubId: string) {
  return useQuery<ApiPaginatedResponse<ClubMemberRequest>>({
    queryKey: ["club-pending", clubId],
    queryFn: () =>
      axios.get(`/api/clubs/${clubId}/members?status=pending`).then((r) => r.data),
    enabled: !!clubId,
    refetchInterval: 30000,
  });
}

// ── Approve Member ─────────────────────────────────────────────────────────────

export function useApproveMember(clubId: string) {
  const qc = useQueryClient();
  return useMutation<ApiResponse<void>, Error, { userId: string }>({
    mutationFn: ({ userId }) =>
      axios.patch(`/api/clubs/${clubId}/members/${userId}/approve`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["club-pending", clubId] });
    },
  });
}

// ── Deny Member ────────────────────────────────────────────────────────────────

export function useDenyMember(clubId: string) {
  const qc = useQueryClient();
  return useMutation<ApiResponse<void>, Error, { userId: string }>({
    mutationFn: ({ userId }) =>
      axios.delete(`/api/clubs/${clubId}/members/${userId}/reject`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["club-pending", clubId] });
    },
  });
}

// ── Update Club Settings ───────────────────────────────────────────────────────

export function useUpdateClubSettings(clubId: string) {
  const qc = useQueryClient();
  return useMutation<ApiResponse<void>, Error, Partial<ClubSettings>>({
    mutationFn: (payload) =>
      axios.patch(`/api/clubs/${clubId}`, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["club", clubId] });
    },
  });
}

// ── Delete Club ────────────────────────────────────────────────────────────────

export function useDeleteClub(clubId: string) {
  return useMutation<ApiResponse<void>, Error, void>({
    mutationFn: () => axios.delete(`/api/clubs/${clubId}`).then((r) => r.data),
  });
}
