"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { AvailableVolunteerRole, AssignedVolunteer, VolunteerRoleFormData } from "@/types/volunteers";
import type { ApiResponse, ApiPaginatedResponse } from "@/types/api";

// ── Event Volunteer Roles ─────────────────────────────────────────────────────

export function useVolunteerRoles(eventId: string) {
  return useQuery<ApiPaginatedResponse<AvailableVolunteerRole>>({
    queryKey: ["volunteer-roles", eventId],
    queryFn: () =>
      axios.get(`/api/events/${eventId}/volunteer-roles`).then((r) => r.data),
    enabled: !!eventId,
  });
}

// ── Apply to Volunteer ────────────────────────────────────────────────────────

export function useApplyVolunteer(eventId: string, roleId: string) {
  const qc = useQueryClient();
  return useMutation<
    ApiResponse<{ application_id: string }>,
    Error,
    { message: string; portfolio_url?: string }
  >({
    mutationFn: (payload) =>
      axios
        .post(`/api/events/${eventId}/volunteer-roles/${roleId}/apply`, payload)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["volunteer-roles", eventId] });
    },
  });
}

// ── Assigned Roster ───────────────────────────────────────────────────────────
// FIX: was /volunteer-roles/assigned — route doesn't exist
// Correct: fetch all roles and filter assigned from applications

export function useAssignedRoster(eventId: string) {
  return useQuery<ApiPaginatedResponse<AssignedVolunteer>>({
    queryKey: ["assigned-roster", eventId],
    queryFn: () =>
      // Reuse the attendees endpoint filtered, or use the roles endpoint
      // The backend returns assigned volunteers via the main volunteer-roles list
      axios
        .get(`/api/events/${eventId}/volunteer-roles`, {
          params: { status: "assigned" },
        })
        .then((r) => r.data),
    enabled: !!eventId,
  });
}

// ── Create Role (Admin) ───────────────────────────────────────────────────────

export function useCreateRole(eventId: string) {
  const qc = useQueryClient();
  return useMutation<
    ApiResponse<{ role_id: string }>,
    Error,
    Omit<VolunteerRoleFormData, "role_id">
  >({
    mutationFn: (payload) =>
      axios
        .post(`/api/events/${eventId}/volunteer-roles`, payload)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["volunteer-roles", eventId] });
    },
  });
}

// ── Update Role (Admin) ───────────────────────────────────────────────────────

export function useUpdateRole(eventId: string, roleId: string) {
  const qc = useQueryClient();
  return useMutation<ApiResponse<void>, Error, Partial<VolunteerRoleFormData>>({
    mutationFn: (payload) =>
      axios
        .patch(`/api/events/${eventId}/volunteer-roles/${roleId}`, payload)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["volunteer-roles", eventId] });
    },
  });
}

// ── Assign Volunteer (Admin) ──────────────────────────────────────────────────

export function useAssignVolunteer(eventId: string, roleId: string) {
  const qc = useQueryClient();
  return useMutation<
    ApiResponse<void>,
    Error,
    { application_id: string; status: "assigned" | "rejected" }
  >({
    mutationFn: ({ application_id, status }) =>
      axios
        .patch(
          `/api/events/${eventId}/volunteer-roles/${roleId}/applications/${application_id}/assign`,
          { status }
        )
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["volunteer-roles", eventId] });
      qc.invalidateQueries({ queryKey: ["assigned-roster", eventId] });
    },
  });
}

// ── Award Badge ────────────────────────────────────────────────────────────────
// FIX: individual badge award path was wrong
// /api/events/${eventId}/volunteer-roles/${role_id}/badges/award → does not exist as route
// Use award-all for batch, or the assign endpoint handles individual

export function useAwardBadge(eventId: string) {
  const qc = useQueryClient();
  return useMutation<ApiResponse<void>, Error, { role_id?: string }>({
    mutationFn: () =>
      axios
        .post(`/api/events/${eventId}/volunteer-roles/badges/award-all`)
        .then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["assigned-roster", eventId] });
    },
  });
}

// ── Register Revert Host ───────────────────────────────────────────────────────

export function useRegisterRevertHost(eventId: string) {
  return useMutation<
    ApiResponse<{ host_registration_id: string }>,
    Error,
    {
      journey_text: string;
      topics: string[];
      contact_preference: string;
      availability_note?: string;
    }
  >({
    mutationFn: (payload) =>
      axios
        .post(`/api/events/${eventId}/revert-hosts/register`, payload)
        .then((r) => r.data),
  });
}
