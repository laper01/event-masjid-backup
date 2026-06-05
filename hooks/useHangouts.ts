"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { HangoutDetailData, MyHangoutCard, CreateHangoutFormData, HangoutInstance, RecurrenceRule } from "@/types/hangouts";
import type { ApiResponse, ApiPaginatedResponse } from "@/types/api";

// ── Browse Hangouts ────────────────────────────────────────────────────────────

export function useHangouts(filters?: Record<string, unknown>) {
  return useQuery<ApiPaginatedResponse<HangoutDetailData>>({
    queryKey: ["hangouts", filters],
    queryFn: () => axios.get("/api/hangouts", { params: filters }).then((r) => r.data),
  });
}

// ── Hangout Detail ─────────────────────────────────────────────────────────────

export function useHangoutDetail(hangoutId: string) {
  return useQuery<ApiResponse<HangoutDetailData>>({
    queryKey: ["hangout", hangoutId],
    queryFn: () => axios.get(`/api/hangouts/${hangoutId}`).then((r) => r.data),
    enabled: !!hangoutId,
  });
}

// ── My Hangouts ────────────────────────────────────────────────────────────────

export function useMyHangouts() {
  return useQuery<ApiResponse<{ attending: MyHangoutCard[]; hosting: MyHangoutCard[] }>>({
    queryKey: ["my-hangouts"],
    queryFn: () => axios.get("/api/hangouts/me").then((r) => r.data),
  });
}

// ── Create Hangout ─────────────────────────────────────────────────────────────

export function useCreateHangout() {
  const qc = useQueryClient();
  return useMutation<ApiResponse<{ hangout_id: string }>, Error, CreateHangoutFormData>({
    mutationFn: (payload) =>
      axios.post("/api/hangouts", payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hangouts"] });
      qc.invalidateQueries({ queryKey: ["my-hangouts"] });
    },
  });
}

// ── Update Hangout ─────────────────────────────────────────────────────────────

export function useUpdateHangout(hangoutId: string) {
  const qc = useQueryClient();
  return useMutation<ApiResponse<void>, Error, Partial<CreateHangoutFormData>>({
    mutationFn: (payload) =>
      axios.patch(`/api/hangouts/${hangoutId}`, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hangout", hangoutId] });
      qc.invalidateQueries({ queryKey: ["my-hangouts"] });
    },
  });
}

// ── Delete Hangout ─────────────────────────────────────────────────────────────

export function useDeleteHangout() {
  const qc = useQueryClient();
  return useMutation<ApiResponse<void>, Error, string>({
    mutationFn: (hangoutId) =>
      axios.delete(`/api/hangouts/${hangoutId}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hangouts"] });
      qc.invalidateQueries({ queryKey: ["my-hangouts"] });
    },
  });
}

// ── Club Hangout Instances ─────────────────────────────────────────────────────

export function useClubHangoutInstances(clubId: string) {
  return useQuery<ApiPaginatedResponse<HangoutInstance>>({
    queryKey: ["club-instances", clubId],
    queryFn: () =>
      axios.get(`/api/clubs/${clubId}/hangout-instances`).then((r) => r.data),
    enabled: !!clubId,
  });
}

// ── Create Hangout Series ──────────────────────────────────────────────────────

export function useCreateHangoutSeries(clubId: string) {
  const qc = useQueryClient();
  return useMutation<ApiResponse<{ series_id: string }>, Error, Partial<RecurrenceRule>>({
    mutationFn: (payload) =>
      axios.post(`/api/clubs/${clubId}/hangout-series`, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["club-instances", clubId] });
    },
  });
}

// ── Update Hangout Series ──────────────────────────────────────────────────────

export function useUpdateHangoutSeries(clubId: string, seriesId: string) {
  const qc = useQueryClient();
  return useMutation<ApiResponse<void>, Error, Partial<RecurrenceRule> & { from_date?: string }>({
    mutationFn: (payload) =>
      axios.patch(`/api/clubs/${clubId}/hangout-series/${seriesId}`, payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["club-instances", clubId] });
    },
  });
}
