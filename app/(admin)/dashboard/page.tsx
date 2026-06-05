"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminEvents } from "@/hooks/useEvents";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { mockActivityFeed } from "@/mocks/user.mock";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { AdminEventRow } from "@/types/events";

type FilterTab = "all" | "published" | "draft" | "completed" | "cancelled";

function deriveType(e: AdminEventRow) {
  if (e.has_tickets) return "Event";
  return "Hangout";
}

function statusBadge(s: string) {
  const m: Record<string, { cls: string; label: string }> = {
    published: { cls: "bg-primary-fixed text-on-primary-fixed-variant", label: "Published" },
    draft:     { cls: "bg-surface-container-high text-on-surface-variant", label: "Draft" },
    completed: { cls: "bg-surface-container-highest text-outline", label: "Completed" },
    cancelled: { cls: "bg-error-container text-on-error-container", label: "Cancelled" },
  };
  return m[s] ?? { cls: "bg-surface-container text-on-surface-variant", label: s };
}

function visLabel(v: string) {
  const m: Record<string, string> = {
    public: "Public", approval_required: "Approval Req.",
    invite_only: "Invite Only", private: "Private",
  };
  return m[v] ?? v;
}

const mockCI = (r: number) => Math.floor(r * 0.72);

const ACT_CFG: Record<string, { bg: string; icon: string; color: string }> = {
  new_rsvp:         { bg: "bg-primary-fixed",       icon: "person",             color: "text-primary" },
  ticket_purchase:  { bg: "bg-secondary-container", icon: "payments",           color: "text-on-secondary-container" },
  approval_request: { bg: "bg-error-container",     icon: "mail",               color: "text-error" },
  check_in:         { bg: "bg-primary-fixed-dim",   icon: "qr_code",            color: "text-primary" },
  cancellation:     { bg: "bg-surface-variant",     icon: "cancel",             color: "text-on-surface-variant" },
  volunteer_apply:  { bg: "bg-tertiary-fixed",      icon: "volunteer_activism", color: "text-on-tertiary-fixed" },
};

export default function AdminDashboardPage() {
  const router = useRouter();
  const [tab, setTab] = useState<FilterTab>("all");
  const [menu, setMenu] = useState<string | null>(null);
  const { data, isLoading } = useAdminEvents();
  const events: AdminEventRow[] = data?.data ?? [];

  const totalRevenue    = events.reduce((s, e) => s + (e.revenue ?? 0), 0);
  const totalReg        = events.reduce((s, e) => s + e.registered, 0);
  const totalCap        = events.reduce((s, e) => s + (e.capacity ?? 0), 0);
  const activeCount     = events.filter((e) => e.status === "published").length;
  const totalPending    = events.reduce((s, e) => s + (e.pending_approvals ?? 0), 0);
  const totalCI         = events.reduce((s, e) => s + mockCI(e.registered), 0);
  const capPct          = totalCap > 0 ? Math.round((totalReg / totalCap) * 100) : 0;
  const now             = new Date();
  const weekEnd         = new Date(now.getTime() + 7 * 864e5);
  const thisWeek        = events.filter((e) => {
    const d = new Date(e.start_time);
    return e.status === "published" && d >= now && d <= weekEnd;
  }).length;

  const filtered = tab === "all" ? events : events.filter((e) => e.status === tab);

  const TABS: { id: FilterTab; label: string }[] = [
    { id: "all", label: "All" }, { id: "published", label: "Active" },
    { id: "draft", label: "Draft" }, { id: "completed", label: "Completed" },
    { id: "cancelled", label: "Cancelled" },
  ];

  function actText(a: typeof mockActivityFeed[0]) {
    const B = ({ children }: { children: React.ReactNode }) => (
      <span className="font-semibold text-on-surface">{children}</span>
    );
    switch (a.activity_type) {
      case "ticket_purchase":
        return <><B>{a.actor_name}</B> purchased a ticket for <B>{a.event_title}</B>{a.amount ? ` — ${formatCurrency(a.amount, a.currency ?? "USD")}` : ""}</>;
      case "new_rsvp":
        return <><B>{a.actor_name}</B> RSVP'd to <B>{a.event_title}</B></>;
      case "approval_request":
        return <><B>{a.actor_name}</B> requested access to <B>{a.event_title}</B></>;
      case "check_in":
        return <><B>{a.actor_name}</B> checked in to <B>{a.event_title}</B></>;
      case "cancellation":
        return <><B>{a.actor_name}</B> cancelled their registration</>;
      case "volunteer_apply":
        return <>New <B>volunteer application</B> for <B>{a.event_title}</B></>;
      default:
        return <span>{a.actor_name}</span>;
    }
  }

  return (
    <>
      <AdminTopBar breadcrumbs={[{ label: "Dashboard" }]} />

      <div className="px-6 pt-8 pb-16 flex gap-6 max-w-[1440px] mx-auto">

        {/* ── LEFT COLUMN ── */}
        <div className="flex-1 min-w-0 space-y-6">

          {/* STAT CARDS */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                label: "Total Revenue",
                value: isLoading ? null : formatCurrency(totalRevenue),
                sub: (
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <span className="material-symbols-outlined text-[14px]">trending_up</span>
                    14% vs last event
                  </div>
                ),
              },
              {
                label: "Tickets Sold",
                value: isLoading ? null : `${totalReg} / ${totalCap}`,
                sub: (
                  <div className="space-y-1">
                    <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                      <motion.div className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }} animate={{ width: `${capPct}%` }}
                        transition={{ duration: 0.9, delay: 0.4 }} />
                    </div>
                    <p className="text-[11px] text-outline">{capPct}% capacity reached</p>
                  </div>
                ),
              },
              {
                label: "Today's Check-ins",
                value: isLoading ? null : String(totalCI),
                sub: <p className="text-[11px] text-outline">of {totalReg} confirmed arrivals</p>,
              },
              {
                label: "Active Events",
                value: isLoading ? null : String(activeCount),
                sub: (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-secondary-container text-on-secondary-container text-[10px] font-bold rounded-full uppercase tracking-wide">
                    <span className="material-symbols-outlined text-[11px]">calendar_today</span>
                    {thisWeek} this week
                  </span>
                ),
              },
            ].map((card, i) => (
              <motion.div key={card.label}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.07 }}
                className="bg-white rounded-2xl border border-outline/10 p-5 space-y-2.5 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">{card.label}</p>
                <p className="text-[28px] font-extrabold text-primary font-['Plus_Jakarta_Sans'] leading-none">
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
            className="flex flex-wrap gap-3 p-4 bg-surface-container-low rounded-2xl border border-outline/5"
          >
            <button onClick={() => router.push("/admin/events/create")}
              className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full text-sm font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create Event
            </button>
            <button onClick={() => router.push("/admin/approvals")}
              className="relative flex items-center gap-2 border border-outline/25 bg-white px-5 py-2.5 rounded-full text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">pending_actions</span>
              View Approval Queue
              {totalPending > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[20px] h-5 px-1 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center">
                  {totalPending}
                </span>
              )}
            </button>
            <button onClick={() => router.push("/admin/volunteers")}
              className="flex items-center gap-2 border border-outline/25 bg-white px-5 py-2.5 rounded-full text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">volunteer_activism</span>
              Manage Volunteers
            </button>
            <button onClick={() => router.push("/admin/analytics")}
              className="flex items-center gap-2 border border-outline/25 bg-white px-5 py-2.5 rounded-full text-sm font-semibold text-on-surface hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">analytics</span>
              View Analytics
            </button>
          </motion.section>

          {/* EVENTS TABLE */}
          <motion.section
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-xl font-extrabold text-primary font-['Plus_Jakarta_Sans']">My Events</h2>
              <div className="flex bg-surface-container p-1 rounded-full gap-0.5 overflow-x-auto">
                {TABS.map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap ${
                      tab === t.id ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
                    }`}>
                    {t.label}
                    {t.id === "all" && !isLoading && (
                      <span className="ml-1.5 text-[10px] bg-surface-container-high text-outline px-1.5 py-0.5 rounded-full font-bold">
                        {events.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low/60 border-b border-outline/10">
                      {["Event","Type","Visibility","Date","Tickets","Check-ins","Status","Actions"].map((h) => (
                        <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-on-surface-variant uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="border-b border-outline/5">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <td key={j} className="px-5 py-4">
                            <div className="h-4 bg-surface-container animate-pulse rounded" />
                          </td>
                        ))}
                      </tr>
                    )) : filtered.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-5 py-20 text-center">
                          <span className="material-symbols-outlined text-outline text-4xl block mb-2">event_busy</span>
                          <p className="text-on-surface-variant text-sm font-semibold">No events found</p>
                        </td>
                      </tr>
                    ) : filtered.map((event, i) => {
                      const badge = statusBadge(event.status);
                      const ci    = mockCI(event.registered);
                      const pct   = event.capacity ? Math.min((event.registered / event.capacity) * 100, 100) : 0;
                      return (
                        <motion.tr key={event.event_id}
                          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                          transition={{ duration: 0.2, delay: i * 0.04 }}
                          className="border-b border-outline/5 hover:bg-surface-container-low/30 transition-colors"
                        >
                          {/* Event name */}
                          <td className="px-5 py-3.5">
                            <p onClick={() => router.push(`/admin/events/${event.event_id}`)}
                              className="font-bold text-primary text-sm cursor-pointer hover:underline leading-snug">
                              {event.title}
                            </p>
                            <p className="text-[11px] text-outline mt-0.5 line-clamp-1">{event.location_name}</p>
                          </td>
                          {/* Type */}
                          <td className="px-5 py-3.5 text-[13px] text-on-surface-variant whitespace-nowrap">
                            {deriveType(event)}
                          </td>
                          {/* Visibility */}
                          <td className="px-5 py-3.5 whitespace-nowrap">
                            <span className={`text-[12px] font-medium flex items-center gap-1 ${
                              event.visibility === "approval_required" ? "text-secondary" : "text-on-surface-variant"
                            }`}>
                              {event.visibility === "approval_required" && (
                                <span className="material-symbols-outlined text-[13px]">lock</span>
                              )}
                              {visLabel(event.visibility)}
                            </span>
                          </td>
                          {/* Date */}
                          <td className="px-5 py-3.5 text-[13px] text-on-surface-variant whitespace-nowrap">
                            {formatDate(event.start_time)}
                          </td>
                          {/* Tickets */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-baseline gap-0.5">
                              <span className="text-[13px] font-bold text-on-surface">{event.registered}</span>
                              <span className="text-[11px] text-outline">/{event.capacity ?? "∞"}</span>
                            </div>
                            {event.capacity && (
                              <div className="mt-1.5 w-16 h-1.5 bg-surface-container rounded-full overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            )}
                          </td>
                          {/* Check-ins */}
                          <td className="px-5 py-3.5">
                            <div className="flex items-baseline gap-0.5">
                              <span className="text-[13px] font-bold text-on-surface">{ci}</span>
                              <span className="text-[11px] text-outline">/{event.registered}</span>
                            </div>
                          </td>
                          {/* Status */}
                          <td className="px-5 py-3.5">
                            <div className="flex flex-col items-start gap-1">
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badge.cls}`}>
                                {badge.label}
                              </span>
                              {(event.pending_approvals ?? 0) > 0 && (
                                <span className="text-[10px] text-error font-bold flex items-center gap-0.5">
                                  <span className="material-symbols-outlined text-[11px]">schedule</span>
                                  {event.pending_approvals} pending
                                </span>
                              )}
                            </div>
                          </td>
                          {/* Actions */}
                          <td className="px-5 py-3.5 relative">
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
                                    transition={{ duration: 0.12 }}
                                    className="absolute right-4 top-12 z-40 bg-white rounded-xl shadow-xl border border-outline/10 py-1.5 min-w-[180px]"
                                  >
                                    {[
                                      { icon: "edit",            label: "Edit Event",    href: `/admin/events/${event.event_id}/edit` },
                                      { icon: "qr_code_scanner", label: "Check-in",      href: `/admin/events/${event.event_id}/checkin` },
                                      { icon: "local_activity",  label: "Tickets",       href: `/admin/events/${event.event_id}/tickets` },
                                      { icon: "analytics",       label: "Analytics",     href: `/admin/events/${event.event_id}/analytics` },
                                      ...(event.pending_approvals ? [{ icon: "pending_actions", label: `Approvals (${event.pending_approvals})`, href: `/admin/events/${event.event_id}/approvals` }] : []),
                                    ].map((item) => (
                                      <button key={item.label}
                                        onClick={() => { setMenu(null); router.push(item.href); }}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-on-surface hover:bg-surface-container-low transition-colors">
                                        <span className="material-symbols-outlined text-[17px] text-on-surface-variant">{item.icon}</span>
                                        {item.label}
                                      </button>
                                    ))}
                                    <div className="border-t border-outline/10 mt-1 pt-1">
                                      <button onClick={() => setMenu(null)}
                                        className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm text-error hover:bg-error/5 transition-colors">
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
              <div className="px-5 py-3 border-t border-outline/10 flex items-center justify-between bg-surface-container-low/20">
                <span className="text-[11px] text-outline">
                  {isLoading ? "Loading…" : `${filtered.length} of ${events.length} events`}
                </span>
                <div className="flex items-center gap-1">
                  <button disabled className="w-8 h-8 flex items-center justify-center rounded-lg text-outline/30 cursor-not-allowed">
                    <span className="material-symbols-outlined text-[20px]">chevron_left</span>
                  </button>
                  <span className="text-[11px] text-on-surface-variant px-2">
                    Page {data?.metadata?.page ?? 1} of {data?.metadata?.total_pages ?? 1}
                  </span>
                  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-outline hover:bg-surface-container transition-colors">
                    <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.section>
        </div>

        {/* ── RIGHT COLUMN: Activity ── */}
        <aside className="w-[272px] shrink-0 sticky top-6 self-start">
          <motion.div
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
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
                const cfg = ACT_CFG[a.activity_type] ?? ACT_CFG.new_rsvp;
                return (
                  <motion.li key={a.activity_id}
                    initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.5 + i * 0.06 }}
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
                          className="text-[11px] text-primary font-bold underline mt-0.5">
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
    </>
  );
}
