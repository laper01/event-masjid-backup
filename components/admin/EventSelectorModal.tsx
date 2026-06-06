"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMyAdminEvents } from "@/hooks/useMyAdminEvents";
import { useEventStore } from "@/store/eventStore";
import { formatDate } from "@/lib/utils";
import type { AdminEventRow } from "@/types/events";

const STATUS_PILL: Record<string, string> = {
  published: "bg-primary-fixed text-on-primary-fixed-variant",
  draft:     "bg-surface-container-high text-on-surface-variant",
  completed: "bg-surface-container-highest text-outline",
  cancelled: "bg-error-container text-on-error-container",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function EventSelectorModal({ isOpen, onClose }: Props) {
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const { activeEvent, setActiveEvent } = useEventStore();
  const { data, isLoading } = useMyAdminEvents();
  const events: AdminEventRow[] = data?.data ?? [];

  const filtered = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase()) ||
    e.location_name?.toLowerCase().includes(search.toLowerCase())
  );

  /* Focus search on open */
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      setSearch("");
    }
  }, [isOpen]);

  /* ESC to close */
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  const handleSelect = (event: AdminEventRow) => {
    setActiveEvent(event);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.96, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -16 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="fixed top-[10vh] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-outline/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header + search */}
            <div className="px-5 pt-5 pb-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-['Plus_Jakarta_Sans'] text-[17px] font-bold text-primary">
                  Select Event to Manage
                </h2>
                <button onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-outline text-[20px]">close</span>
                </button>
              </div>

              {/* Search input */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                  search
                </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by event title or location..."
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-container-low border border-outline/15 rounded-xl text-[13px] text-on-surface focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all placeholder:text-outline"
                />
                {search && (
                  <button onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                )}
              </div>
            </div>

            {/* Event list */}
            <div className="overflow-y-auto max-h-[55vh] divide-y divide-outline/5 pb-2">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="px-5 py-4 flex items-center gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-surface-container animate-pulse rounded w-3/4" />
                      <div className="h-3 bg-surface-container animate-pulse rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : filtered.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <span className="material-symbols-outlined text-outline text-4xl block mb-2">event_busy</span>
                  <p className="text-on-surface-variant text-[13px] font-semibold">
                    {search ? `No events matching "${search}"` : "No events found"}
                  </p>
                </div>
              ) : (
                filtered.map((event) => {
                  const isActive = activeEvent?.event_id === event.event_id;
                  const pill = STATUS_PILL[event.status] ?? STATUS_PILL.draft;
                  const capPct = event.capacity
                    ? Math.round((event.registered / event.capacity) * 100)
                    : null;

                  return (
                    <button
                      key={event.event_id}
                      onClick={() => handleSelect(event)}
                      className={`w-full flex items-start gap-3 px-5 py-4 text-left transition-colors ${
                        isActive
                          ? "bg-primary-fixed/20"
                          : "hover:bg-surface-container-low/50"
                      }`}
                    >
                      {/* Active indicator */}
                      <div className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                        isActive ? "bg-primary" : "bg-transparent"
                      }`} />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={`text-[13px] font-bold leading-snug ${
                            isActive ? "text-primary" : "text-on-surface"
                          }`}>
                            {event.title}
                          </p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${pill}`}>
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                        </div>

                        <p className="text-[11px] text-outline mt-0.5 line-clamp-1">
                          {event.location_name}
                        </p>

                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                            {formatDate(event.start_time)}
                          </span>
                          <span className="text-[11px] text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">group</span>
                            {event.registered}{event.capacity ? `/${event.capacity}` : ""}
                            {capPct !== null && (
                              <span className="text-outline">({capPct}%)</span>
                            )}
                          </span>
                          {(event.pending_approvals ?? 0) > 0 && (
                            <span className="text-[11px] text-error font-bold flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-[13px]">schedule</span>
                              {event.pending_approvals} pending
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Check icon if active */}
                      {isActive && (
                        <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-1"
                          style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer count */}
            <div className="px-5 py-3 border-t border-outline/10 bg-surface-container-low/30">
              <p className="text-[11px] text-outline">
                {isLoading ? "Loading events..." : `${filtered.length} of ${events.length} events`}
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default EventSelectorModal;