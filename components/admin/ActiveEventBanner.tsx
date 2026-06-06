"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEventStore } from "@/store/eventStore";
import { EventSelectorModal } from "@/components/admin/EventSelectorModal";
import { formatDate } from "@/lib/utils";

const STATUS_COLOR: Record<string, string> = {
  published: "bg-primary-fixed text-on-primary-fixed-variant",
  draft:     "bg-surface-container-high text-on-surface-variant",
  completed: "bg-surface-container-highest text-outline",
  cancelled: "bg-error-container text-on-error-container",
};

interface Props {
  /** Page name shown in "No event selected" state */
  pageName?: string;
}

export function ActiveEventBanner({ pageName = "this page" }: Props) {
  const { activeEvent, clearActiveEvent } = useEventStore();
  const [selectorOpen, setSelectorOpen] = useState(false);

  return (
    <>
      <AnimatePresence mode="wait">
        {activeEvent ? (
          /* ── Active event banner ─────────────────────────────── */
          <motion.div
            key="active"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="sticky top-0 z-30 bg-primary/5 border-b border-primary/10 px-6 py-3 flex items-center gap-3"
          >
            {/* Dot indicator */}
            <div className="w-2 h-2 rounded-full bg-primary shrink-0 animate-pulse" />

            {/* Event info */}
            <div className="flex-1 min-w-0 flex items-center gap-3 flex-wrap">
              <p className="text-[12px] text-on-surface-variant font-semibold uppercase tracking-wider shrink-0">
                Managing:
              </p>
              <p className="text-[13px] font-bold text-primary truncate">
                {activeEvent.title}
              </p>
              <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0 ${
                STATUS_COLOR[activeEvent.status] ?? STATUS_COLOR.draft
              }`}>
                {activeEvent.status.charAt(0).toUpperCase() + activeEvent.status.slice(1)}
              </span>
              <span className="text-[11px] text-outline hidden sm:flex items-center gap-1 shrink-0">
                <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                {formatDate(activeEvent.start_time)}
              </span>
              <span className="text-[11px] text-outline hidden md:flex items-center gap-1 shrink-0">
                <span className="material-symbols-outlined text-[13px]">location_on</span>
                {activeEvent.location_name}
              </span>
              {(activeEvent.pending_approvals ?? 0) > 0 && (
                <span className="text-[11px] text-error font-bold flex items-center gap-1 shrink-0">
                  <span className="material-symbols-outlined text-[13px]">schedule</span>
                  {activeEvent.pending_approvals} pending approvals
                </span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSelectorOpen(true)}
                className="flex items-center gap-1.5 text-[12px] font-bold text-primary hover:underline transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
                Change
              </button>
              <div className="w-px h-4 bg-outline/20" />
              <button
                onClick={clearActiveEvent}
                className="text-[12px] font-semibold text-outline hover:text-error transition-colors"
              >
                Clear
              </button>
            </div>
          </motion.div>
        ) : (
          /* ── No event selected state ─────────────────────────── */
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="sticky top-0 z-30 bg-secondary-container/20 border-b border-secondary/10 px-6 py-3 flex items-center gap-3"
          >
            <span className="material-symbols-outlined text-secondary text-[18px]">
              info
            </span>
            <p className="text-[12px] text-on-surface-variant flex-1">
              No event selected.{" "}
              <span className="font-semibold text-on-surface">
                Select an event
              </span>{" "}
              from My Events to manage {pageName}.
            </p>
            <button
              onClick={() => setSelectorOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-primary text-on-primary rounded-full text-[12px] font-bold hover:opacity-90 active:scale-95 transition-all shrink-0"
            >
              <span className="material-symbols-outlined text-[15px]">event</span>
              Select Event
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <EventSelectorModal
        isOpen={selectorOpen}
        onClose={() => setSelectorOpen(false)}
      />
    </>
  );
}

export default ActiveEventBanner;