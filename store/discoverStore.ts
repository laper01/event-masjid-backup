"use client";

import { create } from "zustand";
import type { DiscoverFilters } from "@/types/events";

const defaultFilters: DiscoverFilters = {
  search: "",
  type: "all",
  gender: "NO_RESTRICTION",
  tags: [],
  is_beginner_friendly: undefined,
  has_tickets: undefined,
  date_from: undefined,
  date_to: undefined,
  radius_km: 15,
  page: 1,
  per_page: 20,
};

interface DiscoverStore {
  filters: DiscoverFilters;
  setFilter: (partial: Partial<DiscoverFilters>) => void;
  resetFilters: () => void;
  activeTab: "feed" | "discover";
  setActiveTab: (tab: "feed" | "discover") => void;
}

export const useDiscoverStore = create<DiscoverStore>((set) => ({
  filters: defaultFilters,
  setFilter: (partial) =>
    set((state) => ({
      filters: { ...state.filters, ...partial, page: 1 },
    })),
  resetFilters: () => set({ filters: defaultFilters }),
  activeTab: "feed",
  setActiveTab: (tab) => set({ activeTab: tab }),
}));
