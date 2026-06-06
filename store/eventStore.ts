import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AdminEventRow } from "@/types/events";

interface EventStore {
  activeEvent: AdminEventRow | null;
  setActiveEvent: (event: AdminEventRow) => void;
  clearActiveEvent: () => void;
}

export const useEventStore = create<EventStore>()(
  persist(
    (set) => ({
      activeEvent: null,
      setActiveEvent: (event) => set({ activeEvent: event }),
      clearActiveEvent: () => set({ activeEvent: null }),
    }),
    {
      name: "masjids-active-event", // localStorage key
      partialize: (state) => ({ activeEvent: state.activeEvent }),
    }
  )
);