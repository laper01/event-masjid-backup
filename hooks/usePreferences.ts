"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { UserPreferences } from "@/types/user";
import type { ApiResponse } from "@/types/api";

export function usePreferences() {
  return useQuery<ApiResponse<UserPreferences>>({
    queryKey: ["preferences"],
    queryFn: () => axios.get("/api/users/me/preferences").then((r) => r.data),
  });
}

export function useUpdatePreferences() {
  const qc = useQueryClient();
  return useMutation<ApiResponse<UserPreferences>, Error, Partial<UserPreferences>>({
    mutationFn: (payload) =>
      axios.patch("/api/users/me/preferences", payload).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["preferences"] });
      qc.invalidateQueries({ queryKey: ["feed"] });
      qc.invalidateQueries({ queryKey: ["discover"] });
    },
  });
}
