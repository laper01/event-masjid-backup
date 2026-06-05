"use client";

import { create } from "zustand";

type FeedFilter = "all" | "masjids" | "clubs" | "connections" | "local";

interface FeedStore {
  activeFilter: FeedFilter;
  setActiveFilter: (filter: FeedFilter) => void;
}

export const useFeedStore = create<FeedStore>((set) => ({
  activeFilter: "all",
  setActiveFilter: (filter) => set({ activeFilter: filter }),
}));
