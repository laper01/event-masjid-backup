"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useMyAdminEvents } from "@/hooks/useMyAdminEvents";
import { useEventStore } from "@/store/eventStore";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { EventSelectorModal } from "@/components/admin/EventSelectorModal";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AdminEventRow } from "@/types/events";

/* ─── helpers ─────────────────────────────────────────────────── */

const STATUS_PILL: Record<string, { cls: string; label: string }> = {
  published: { cls: "bg-primary-fixed text-on-primary-fixed-variant", label: "Published" },
  draft:     { cls: "bg-surface-container-high text-on-surface-variant", label: "Draft" },
  completed: { cls: "bg-surface-container-highest text-outline", label: "Completed" },
  cancelled: { cls: "bg-error-container text-on-error-container", label: "Cancelled" },
};

const VIS: Record<string, string> = {
  public:            "Public",
  invite_only:       "Invite Only",
  approval_required: "Approval Required",
  private:           "Private",
};

/* ─── stat card ───────────────────────────────────────────────── */
function StatCard({
  label, value, icon, sub, delay = 0,
}: {
  label: string;
  value: string | number;
  icon: string;
  sub?: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-white rounded-2xl border border-outline/10 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
          {label}
        </p>
        <span className="material-symbols-outlined text-outline/50 text-[20px]">{icon}</span>
      </div>
      <p className="text-[26px] font-extrabold text-primary font-['Plus_Jakarta_Sans'] leading-none mb-2">
        {value}
      </p>
      {sub && <div className="text-[11px] text-outline">{sub}</div>}
    </motion.div>
  );
}

/* ─── action button ───────────────────────────────────────────── */
function ActionBtn({
  icon, label, href, color = "border border-outline/20 bg-white text-on-surface hover:bg-surface-container-low",
}: {
  icon: string;
  label: string;
  href: string;
  color?: string;
}) {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push(href)}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all active:scale-95 ${color}`}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
      {label}
    </button>
  );
}

/* ─── page ────────────────────────────────────────────────────── */
export default function AdminEventsPage() {
  const router = useRouter();
  const qc = useQueryClient();
  const [selectorOpen, setSelectorOpen] = useState(false);

  const { activeEvent, setActiveEvent, clearActiveEvent } = useEventStore();
  const { data, isLoading } = useMyAdminEvents();
  const events: AdminEventRow[] = data?.data ?? [];

  const ev = activeEvent;
  const capPct = ev?.capacity
    ? Math.round((ev.registered / ev.capacity) * 100)
    : null;
  const checkins = ev ? Math.floor(ev.registered * 0.72) : 0;
  const pill = ev ? (STATUS_PILL[ev.status] ?? STATUS_PILL.draft) : null;

  return (
    <>
      <AdminTopBar breadcrumbs={[{ label: "My Events" }]} />

      <div className="px-6 pt-6 pb-16 max-w-[1200px] mx-auto space-y-6">

        {/* ── Event Selector ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center gap-3"
        >
          <div className="flex-1">
            <h1 className="text-[20px] font-extrabold text-primary font-['Plus_Jakarta_Sans']">
              My Events
            </h1>
            <p className="text-[12px] text-outline mt-0.5">
              {isLoading ? "Loading…" : `${events.length} events — select one to manage`}
            </p>
          </div>

          {/* Selector trigger button */}
          <button
            onClick={() => setSelectorOpen(true)}
            className="flex items-center gap-3 bg-white border border-outline/20 shadow-sm rounded-2xl px-4 py-3 hover:border-primary/30 hover:shadow-md transition-all text-left w-full sm:w-auto sm:min-w-[300px]"
          >
            {ev ? (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-primary truncate">{ev.title}</p>
                  <p className="text-[11px] text-outline truncate">{ev.location_name}</p>
                </div>
                <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0 ${pill?.cls}`}>
                  {pill?.label}
                </span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-outline text-[22px]">event</span>
                <span className="text-[13px] text-outline flex-1">Select an event to manage…</span>
              </>
            )}
            <span className="material-symbols-outlined text-outline text-[20px] shrink-0">
              unfold_more
            </span>
          </button>
        </motion.div>

        {/* ── Empty state ────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {!ev ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-5">
                <span className="material-symbols-outlined text-outline text-[40px]">
                  event_note
                </span>
              </div>
              <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-on-surface mb-2">
                No event selected
              </h2>
              <p className="text-[13px] text-outline mb-6 max-w-xs">
                Choose an event from the selector above to view its details and manage everything in one place.
              </p>
              <button
                onClick={() => setSelectorOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                Select an Event
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={ev.event_id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >

              {/* ── Event header card ─────────────────────────── */}
              <div className="bg-white rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
                {/* Color strip */}
                <div className="h-2 bg-gradient-to-r from-primary to-primary-fixed-dim" />
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${pill?.cls}`}>
                          {pill?.label}
                        </span>
                        <span className="text-[12px] text-outline">
                          {VIS[ev.visibility] ?? ev.visibility}
                        </span>
                        {ev.has_tickets && (
                          <span className="text-[11px] text-secondary font-bold bg-secondary-container px-2 py-0.5 rounded-full">
                            Paid Tickets
                          </span>
                        )}
                        {(ev.pending_approvals ?? 0) > 0 && (
                          <span className="text-[11px] text-error font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-[13px]">schedule</span>
                            {ev.pending_approvals} pending approvals
                          </span>
                        )}
                      </div>
                      <h2 className="font-['Plus_Jakarta_Sans'] text-[22px] font-extrabold text-primary leading-snug">
                        {ev.title}
                      </h2>
                      <div className="flex flex-wrap gap-4 mt-3">
                        <span className="text-[12px] text-on-surface-variant flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px]">calendar_today</span>
                          {formatDate(ev.start_time)}
                        </span>
                        <span className="text-[12px] text-on-surface-variant flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-[15px]">location_on</span>
                          {ev.location_name}
                        </span>
                        {(ev.volunteer_roles_count ?? 0) > 0 && (
                          <span className="text-[12px] text-on-surface-variant flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px]">volunteer_activism</span>
                            {ev.volunteer_roles_count} volunteer roles
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Change / Clear */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectorOpen(true)}
                        className="flex items-center gap-1.5 px-4 py-2 border border-outline/20 rounded-full text-[12px] font-semibold text-on-surface hover:bg-surface-container-low transition-colors"
                      >
                        <span className="material-symbols-outlined text-[15px]">swap_horiz</span>
                        Change
                      </button>
                      <button
                        onClick={clearActiveEvent}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-error/5 transition-colors"
                        title="Clear selection"
                      >
                        <span className="material-symbols-outlined text-outline hover:text-error text-[18px] transition-colors">close</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Stats grid ───────────────────────────────── */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  label="Total Revenue" icon="payments" delay={0}
                  value={formatCurrency(ev.revenue ?? 0, ev.currency ?? "USD")}
                  sub={ev.has_tickets ? "From ticket sales" : "Free event"}
                />
                <StatCard
                  label="Tickets Sold" icon="confirmation_number" delay={0.06}
                  value={`${ev.registered} / ${ev.capacity ?? "∞"}`}
                  sub={
                    ev.capacity ? (
                      <div className="space-y-1">
                        <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${capPct}%` }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                          />
                        </div>
                        <span>{capPct}% capacity reached</span>
                      </div>
                    ) : "No capacity limit"
                  }
                />
                <StatCard
                  label="Check-ins" icon="qr_code_scanner" delay={0.12}
                  value={checkins}
                  sub={`of ${ev.registered} registered`}
                />
                <StatCard
                  label="Pending Approvals" icon="pending_actions" delay={0.18}
                  value={ev.pending_approvals ?? 0}
                  sub={(ev.pending_approvals ?? 0) > 0
                    ? <span className="text-error font-semibold">Requires attention</span>
                    : "All caught up"}
                />
              </div>

              {/* ── Quick actions ─────────────────────────────── */}
              <div className="bg-surface-container-low rounded-2xl p-5 border border-outline/5">
                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-3">
                  Manage Event
                </p>
                <div className="flex flex-wrap gap-3">
                  <ActionBtn
                    icon="local_activity" label="Tickets"
                    href={`/admin/events/${ev.event_id}/tickets`}
                    color="bg-primary text-on-primary hover:opacity-90 shadow-sm"
                  />
                  <ActionBtn
                    icon="qr_code_scanner" label="Check-in"
                    href={`/admin/events/${ev.event_id}/checkin`}
                  />
                  <ActionBtn
                    icon="people" label="Volunteers"
                    href={`/admin/events/${ev.event_id}/volunteers`}
                  />
                  <ActionBtn
                    icon="analytics" label="Analytics"
                    href={`/admin/events/${ev.event_id}/analytics`}
                  />
                  {(ev.pending_approvals ?? 0) > 0 && (
                    <ActionBtn
                      icon="pending_actions"
                      label={`Approvals (${ev.pending_approvals})`}
                      href={`/admin/events/${ev.event_id}/approvals`}
                      color="border border-error/30 bg-error-container/20 text-error hover:bg-error-container/30"
                    />
                  )}
                  <ActionBtn
                    icon="edit" label="Edit Event"
                    href={`/admin/events/${ev.event_id}/edit`}
                  />
                </div>
              </div>

              {/* ── All events list (mini table) ──────────────── */}
              <div className="bg-white rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-outline/10 flex items-center justify-between">
                  <h3 className="font-bold text-primary text-[15px] font-['Plus_Jakarta_Sans']">
                    All My Events
                  </h3>
                  <span className="text-[11px] text-outline">{events.length} total</span>
                </div>
                <div className="divide-y divide-outline/5">
                  {isLoading
                    ? Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="px-5 py-4">
                          <div className="h-4 bg-surface-container animate-pulse rounded w-2/3" />
                        </div>
                      ))
                    : events.map((event) => {
                        const isSelected = event.event_id === ev.event_id;
                        const p = STATUS_PILL[event.status] ?? STATUS_PILL.draft;
                        return (
                          <button
                            key={event.event_id}
                            onClick={() => setActiveEvent(event)}
                            className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors ${
                              isSelected
                                ? "bg-primary-fixed/15"
                                : "hover:bg-surface-container-low/40"
                            }`}
                          >
                            <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                              isSelected ? "bg-primary" : "bg-transparent"
                            }`} />
                            <div className="flex-1 min-w-0">
                              <p className={`text-[13px] font-bold leading-snug truncate ${
                                isSelected ? "text-primary" : "text-on-surface"
                              }`}>
                                {event.title}
                              </p>
                              <p className="text-[11px] text-outline truncate">
                                {formatDate(event.start_time)} · {event.location_name}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[11px] text-outline">
                                {event.registered}/{event.capacity ?? "∞"}
                              </span>
                              <span className={`text-[10px] font-bold rounded-full px-2 py-0.5 ${p.cls}`}>
                                {p.label}
                              </span>
                              {isSelected && (
                                <span className="material-symbols-outlined text-primary text-[16px]"
                                  style={{ fontVariationSettings: "'FILL' 1" }}>
                                  check_circle
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Event selector modal */}
      <EventSelectorModal
        isOpen={selectorOpen}
        onClose={() => setSelectorOpen(false)}
      />
    </>
  );
}