"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useMyAdminEvents } from "@/hooks/useMyAdminEvents";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { CreateEventModal } from "@/components/admin/event-form/CreateEventModal";
import { mockActivityFeed } from "@/mocks/user.mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AdminEventRow } from "@/types/events";

/* ─── helpers ────────────────────────────────────────────────── */

type Tab = "all" | "published" | "draft" | "completed" | "cancelled";

const deriveType = (e: AdminEventRow) => (e.has_tickets ? "Event" : "Hangout");

const STATUS: Record<string, { pill: string; label: string }> = {
  published: { pill: "bg-primary-fixed text-on-primary-fixed-variant", label: "Published" },
  draft:     { pill: "bg-surface-container-high text-on-surface-variant", label: "Draft" },
  completed: { pill: "bg-surface-container-highest text-outline", label: "Completed" },
  cancelled: { pill: "bg-error-container text-on-error-container", label: "Cancelled" },
};

const VIS: Record<string, string> = {
  public: "Public", approval_required: "Approval Req.",
  invite_only: "Invite Only", private: "Private",
};

const mockCI = (r: number) => Math.floor(r * 0.72);

const ACT: Record<string, { bg: string; icon: string; color: string }> = {
  new_rsvp:         { bg: "bg-primary-fixed",       icon: "person",             color: "text-primary" },
  ticket_purchase:  { bg: "bg-secondary-container", icon: "payments",           color: "text-on-secondary-container" },
  approval_request: { bg: "bg-error-container",     icon: "mail",               color: "text-error" },
  check_in:         { bg: "bg-primary-fixed-dim",   icon: "qr_code",            color: "text-primary" },
  cancellation:     { bg: "bg-surface-variant",     icon: "cancel",             color: "text-on-surface-variant" },
  volunteer_apply:  { bg: "bg-tertiary-fixed",      icon: "volunteer_activism", color: "text-on-tertiary-fixed" },
};

/* ─── component ───────────────────────────────────────────────── */

export default function AdminDashboardPage() {
  const router  = useRouter();
  const qc      = useQueryClient();
  const [tab, setTab]           = useState<Tab>("all");
  const [menu, setMenu]         = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useMyAdminEvents();
  const events: AdminEventRow[] = data?.data ?? [];

  /* stats */
  const revenue  = events.reduce((s, e) => s + (e.revenue ?? 0), 0);
  const reg      = events.reduce((s, e) => s + e.registered, 0);
  const cap      = events.reduce((s, e) => s + (e.capacity ?? 0), 0);
  const active   = events.filter((e) => e.status === "published").length;
  const pending  = events.reduce((s, e) => s + (e.pending_approvals ?? 0), 0);
  const checkins = events.reduce((s, e) => s + mockCI(e.registered), 0);
  const capPct   = cap > 0 ? Math.round((reg / cap) * 100) : 0;
  const now      = new Date();
  const week     = new Date(now.getTime() + 7 * 864e5);
  const thisWeek = events.filter((e) => {
    const d = new Date(e.start_time);
    return e.status === "published" && d >= now && d <= week;
  }).length;

  const rows = tab === "all" ? events : events.filter((e) => e.status === tab);

  const TABS: { id: Tab; label: string }[] = [
    { id: "all", label: "All" }, { id: "published", label: "Active" },
    { id: "draft", label: "Draft" }, { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  function actText(a: typeof mockActivityFeed[0]) {
    const B = ({ c }: { c: string }) => <span className="font-bold text-on-surface">{c}</span>;
    switch (a.activity_type) {
      case "ticket_purchase":  return <><B c={a.actor_name} /> purchased a ticket for <B c={a.event_title ?? ""} />{a.amount ? ` — ${formatCurrency(a.amount)}` : ""}</>;
      case "new_rsvp":         return <><B c={a.actor_name} /> RSVP'd to <B c={a.event_title ?? ""} /></>;
      case "approval_request": return <><B c={a.actor_name} /> requested access to <B c={a.event_title ?? ""} /></>;
      case "check_in":         return <><B c={a.actor_name} /> checked in to <B c={a.event_title ?? ""} /></>;
      case "cancellation":     return <><B c={a.actor_name} /> cancelled their registration</>;
      case "volunteer_apply":  return <>New <B c="volunteer application" /> for <B c={a.event_title ?? ""} /></>;
      default:                 return <span>{a.actor_name}</span>;
    }
  }

  /* ─── render ─────────────────────────────────────────────── */
  return (
    <>
      <AdminTopBar breadcrumbs={[{ label: "Dashboard" }]} />

      <div className="flex gap-6 px-6 pt-6 pb-16 max-w-[1440px] mx-auto w-full">

        {/* ══ LEFT ══════════════════════════════════════════ */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* STAT CARDS */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                label: "Total Revenue",
                value: isLoading ? null : formatCurrency(revenue),
                sub: (
                  <div className="flex items-center gap-1 text-[12px] font-semibold text-emerald-700">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span>
                    14% vs last event
                  </div>
                ),
              },
              {
                label: "Tickets Sold",
                value: isLoading ? null : `${reg} / ${cap}`,
                sub: (
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <motion.div className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${capPct}%` }}
                        transition={{ duration: 0.8, delay: 0.4 }} />
                    </div>
                    <p className="text-[11px] text-outline">{capPct}% capacity reached</p>
                  </div>
                ),
              },
              {
                label: "Today's Check-ins",
                value: isLoading ? null : String(checkins),
                sub: <p className="text-[11px] text-outline">of {reg} confirmed arrivals</p>,
              },
              {
                label: "Active Events",
                value: isLoading ? null : String(active),
                sub: (
                  <span className="inline-flex items-center gap-1 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full px-2.5 py-1 uppercase tracking-wide">
                    <span className="material-symbols-outlined text-[11px]">calendar_today</span>
                    {thisWeek} this week
                  </span>
                ),
              },
            ].map((card, i) => (
              <motion.div key={card.label}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.07 }}
                className="bg-white rounded-2xl border border-outline/10 p-5 space-y-2.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{card.label}</p>
                <p className="text-[26px] font-extrabold text-primary font-['Plus_Jakarta_Sans'] leading-none">
                  {card.value ?? <span className="block w-24 h-7 bg-surface-container animate-pulse rounded-lg" />}
                </p>
                {!isLoading && card.sub}
              </motion.div>
            ))}
          </div>

          {/* QUICK ACTIONS */}
          <motion.section
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="flex flex-wrap gap-3 p-5 bg-surface-container-low rounded-2xl border border-outline/5"
          >
            {/* ← "Create Event" opens modal instead of navigating */}
            <button
              onClick={() => setCreateOpen(true)}
              className="flex items-center gap-2 bg-primary text-on-primary px-6 py-2.5 rounded-full text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create Event
            </button>

            <button onClick={() => router.push("/admin/approvals")}
              className="relative flex items-center gap-2 border border-outline/20 bg-white px-5 py-2.5 rounded-full text-[13px] font-semibold text-on-surface hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">pending_actions</span>
              View Approval Queue
              {pending > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1.5 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pending}
                </span>
              )}
            </button>

            <button onClick={() => router.push("/admin/volunteers")}
              className="flex items-center gap-2 border border-outline/20 bg-white px-5 py-2.5 rounded-full text-[13px] font-semibold text-on-surface hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">volunteer_activism</span>
              Manage Volunteers
            </button>

            <button onClick={() => router.push("/admin/analytics")}
              className="flex items-center gap-2 border border-outline/20 bg-white px-5 py-2.5 rounded-full text-[13px] font-semibold text-on-surface hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">analytics</span>
              View Analytics
            </button>
          </motion.section>

          {/* EVENTS TABLE */}
          <motion.section
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.38 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-[20px] font-extrabold text-primary font-['Plus_Jakarta_Sans']">My Events</h2>
              <div className="flex bg-surface-container p-1 rounded-full overflow-x-auto gap-0.5">
                {TABS.map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all ${
                      tab === t.id ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
                    }`}>
                    {t.label}
                    {t.id === "all" && !isLoading && (
                      <span className="ml-1.5 text-[10px] bg-surface-container-high text-outline rounded-full px-1.5 py-0.5 font-bold">
                        {events.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-outline/10 bg-surface-container-low/50">
                      {[
                        { h: "Event",      cls: "pl-6 pr-4 min-w-[200px]" },
                        { h: "Type",       cls: "px-4 w-[90px]" },
                        { h: "Visibility", cls: "px-4 w-[130px]" },
                        { h: "Date",       cls: "px-4 w-[120px]" },
                        { h: "Tickets",    cls: "px-4 w-[100px]" },
                        { h: "Check-ins",  cls: "px-4 w-[100px]" },
                        { h: "Status",     cls: "px-4 w-[130px]" },
                        { h: "Actions",    cls: "px-4 w-[70px]" },
                      ].map(({ h, cls }) => (
                        <th key={h} className={`${cls} py-3.5 text-left text-[11px] font-bold text-on-surface-variant uppercase tracking-wider`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline/5">
                    {isLoading
                      ? Array.from({ length: 3 }).map((_, i) => (
                          <tr key={i}>
                            <td colSpan={8} className="pl-6 pr-4 py-4">
                              <div className="h-4 bg-surface-container animate-pulse rounded w-full" />
                            </td>
                          </tr>
                        ))
                      : rows.length === 0
                      ? (
                          <tr>
                            <td colSpan={8} className="py-20 text-center">
                              <span className="material-symbols-outlined text-outline text-4xl block mb-2">event_busy</span>
                              <p className="text-on-surface-variant text-sm font-semibold">No events found</p>
                              <button onClick={() => setCreateOpen(true)}
                                className="mt-4 px-5 py-2 bg-primary text-on-primary rounded-full text-[13px] font-bold">
                                Create your first event
                              </button>
                            </td>
                          </tr>
                        )
                      : rows.map((event, i) => {
                          const st  = STATUS[event.status] ?? STATUS.draft;
                          const ci  = mockCI(event.registered);
                          const pct = event.capacity ? Math.min((event.registered / event.capacity) * 100, 100) : 0;
                          return (
                            <motion.tr key={event.event_id}
                              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                              transition={{ duration: 0.15, delay: i * 0.04 }}
                              className="hover:bg-surface-container-low/30 transition-colors">
                              <td className="pl-6 pr-4 py-4">
                                <p onClick={() => router.push(`/admin/events/${event.event_id}`)}
                                  className="font-bold text-primary text-[13px] cursor-pointer hover:underline leading-snug">
                                  {event.title}
                                </p>
                                <p className="text-[11px] text-outline mt-0.5 line-clamp-1 max-w-[200px]">
                                  {event.location_name}
                                </p>
                              </td>
                              <td className="px-4 py-4 text-[13px] text-on-surface-variant">{deriveType(event)}</td>
                              <td className="px-4 py-4">
                                <span className={`text-[12px] flex items-center gap-1 ${
                                  event.visibility === "approval_required" ? "text-secondary font-semibold" : "text-on-surface-variant"
                                }`}>
                                  {event.visibility === "approval_required" && (
                                    <span className="material-symbols-outlined text-[13px]">lock</span>
                                  )}
                                  {VIS[event.visibility] ?? event.visibility}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-[13px] text-on-surface-variant whitespace-nowrap">
                                {formatDate(event.start_time)}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-baseline gap-0.5">
                                  <span className="text-[13px] font-bold text-on-surface">{event.registered}</span>
                                  <span className="text-[11px] text-outline">/{event.capacity ?? "∞"}</span>
                                </div>
                                {event.capacity && (
                                  <div className="mt-1.5 w-16 h-1 bg-surface-container-high rounded-full overflow-hidden">
                                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-baseline gap-0.5">
                                  <span className="text-[13px] font-bold text-on-surface">{ci}</span>
                                  <span className="text-[11px] text-outline">/{event.registered}</span>
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex flex-col items-start gap-1.5">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${st.pill}`}>
                                    {st.label}
                                  </span>
                                  {(event.pending_approvals ?? 0) > 0 && (
                                    <span className="text-[10px] text-error font-bold flex items-center gap-0.5">
                                      <span className="material-symbols-outlined text-[11px]">schedule</span>
                                      {event.pending_approvals} pending
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 py-4 relative">
                                <button onClick={() => setMenu(menu === event.event_id ? null : event.event_id)}
                                  className="w-8 h-8 flex items-center justify-center rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors">
                                  <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                                </button>
                                <AnimatePresence>
                                  {menu === event.event_id && (
                                    <>
                                      <div className="fixed inset-0 z-30" onClick={() => setMenu(null)} />
                                      <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                        transition={{ duration: 0.1 }}
                                        className="absolute right-4 top-12 z-40 bg-white rounded-xl shadow-xl border border-outline/10 py-1.5 min-w-[180px]"
                                      >
                                        {[
                                          { icon: "edit",            label: "Edit Event",  path: `/admin/events/${event.event_id}/edit` },
                                          { icon: "qr_code_scanner", label: "Check-in",    path: `/admin/events/${event.event_id}/checkin` },
                                          { icon: "local_activity",  label: "Tickets",     path: `/admin/events/${event.event_id}/tickets` },
                                          { icon: "analytics",       label: "Analytics",   path: `/admin/events/${event.event_id}/analytics` },
                                          ...(event.pending_approvals
                                            ? [{ icon: "pending_actions", label: `Approvals (${event.pending_approvals})`, path: `/admin/events/${event.event_id}/approvals` }]
                                            : []),
                                        ].map((item) => (
                                          <button key={item.label}
                                            onClick={() => { setMenu(null); router.push(item.path); }}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[13px] text-on-surface hover:bg-surface-container-low transition-colors">
                                            <span className="material-symbols-outlined text-[17px] text-on-surface-variant">{item.icon}</span>
                                            {item.label}
                                          </button>
                                        ))}
                                        <div className="border-t border-outline/10 mt-1 pt-1">
                                          <button onClick={() => setMenu(null)}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[13px] text-error hover:bg-error/5 transition-colors">
                                            <span className="material-symbols-outlined text-[17px] text-error">delete</span>
                                            Delete Event
                                          </button>
                                        </div>
                                      </motion.div>
                                    </>
                                  )}
                                </AnimatePresence>
                              </td>
                            </motion.tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              <div className="px-6 py-3 border-t border-outline/10 bg-surface-container-low/20 flex items-center justify-between">
                <span className="text-[11px] text-outline">
                  {isLoading ? "Loading…" : `${rows.length} of ${events.length} events`}
                </span>
                <div className="flex items-center gap-1">
                  <button disabled className="w-7 h-7 flex items-center justify-center rounded text-outline/30 cursor-not-allowed">
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <span className="text-[11px] text-on-surface-variant px-2">
                    Page {data?.metadata?.page ?? 1} / {data?.metadata?.total_pages ?? 1}
                  </span>
                  <button className="w-7 h-7 flex items-center justify-center rounded text-outline hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        {/* ══ RIGHT: Recent Activity ════════════ */}
        <aside className="w-[280px] shrink-0 sticky top-6 self-start">
          <motion.div
            initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl border border-outline/10 shadow-sm overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-outline/10 flex items-center justify-between">
              <h3 className="font-bold text-primary text-[15px] font-['Plus_Jakarta_Sans'] flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">history</span>
                Recent Activity
              </h3>
              <button className="text-[11px] text-primary font-semibold hover:underline">View all</button>
            </div>
            <ul className="divide-y divide-outline/5">
              {mockActivityFeed.map((a, i) => {
                const cfg = ACT[a.activity_type] ?? ACT.new_rsvp;
                return (
                  <motion.li key={a.activity_id}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    transition={{ duration: 0.15, delay: 0.4 + i * 0.05 }}
                    className={`flex gap-3 px-4 py-3.5 hover:bg-surface-container-low/30 transition-colors ${!a.is_new ? "opacity-55" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <span className={`material-symbols-outlined text-[15px] ${cfg.color}`}
                        style={{ fontVariationSettings: "'FILL' 1" }}>
                        {cfg.icon}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-on-surface-variant leading-relaxed">
                        {actText(a)}
                      </p>
                      {a.activity_type === "approval_request" && a.event_id && (
                        <button
                          onClick={() => router.push(`/admin/events/${a.event_id}/approvals`)}
                          className="text-[11px] text-primary font-bold underline mt-0.5 block">
                          Review Requests
                        </button>
                      )}
                      <p className="text-[10px] text-outline font-semibold uppercase tracking-wide mt-1">
                        {new Date(a.created_at).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })}
                        {" · "}
                        {new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </div>
                    {a.is_new && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
                  </motion.li>
                );
              })}
            </ul>
          </motion.div>
        </aside>
      </div>

      {/* ── Create Event Modal ─────────────────────────────── */}
      <CreateEventModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={(eventId) => {
          qc.invalidateQueries({ queryKey: ["admin-events"] });
        }}
      />
    </>
  );
}