"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEventStore } from "@/store/eventStore";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { ActiveEventBanner } from "@/components/admin/ActiveEventBanner";
import {
  useAttendees,
  useCheckInStats,
  useCheckIn,
  useUndoCheckIn,
  useTicketDetail,
} from "@/hooks/useCheckIn";
import { formatCurrency } from "@/lib/utils";
import type { AttendeeRow, TicketDetailData } from "@/types/checkin";

/* ─────────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────────── */

const MOCK_ATTENDEES: AttendeeRow[] = [
  { rsvp_id: "rsvp-001", ticket_id: "tkt-001", user_id: "u-001", name: "Omar Farooq",    email: "omar.f@example.com",      tier_name: "General Admission", checked_in: true,  checked_in_at: new Date(Date.now() - 20 * 60e3).toISOString(), checked_in_by: "Admin", rsvp_status: "confirmed" },
  { rsvp_id: "rsvp-002", ticket_id: "tkt-002", user_id: "u-002", name: "Sarah Malik",    email: "smalik.design@email.com", tier_name: "General Admission", checked_in: false, rsvp_status: "confirmed" },
  { rsvp_id: "rsvp-003", ticket_id: "tkt-003", user_id: "u-003", name: "Zayd Hassan",    email: "zayd.hassan@domain.com",  tier_name: "VIP Pass",          checked_in: false, rsvp_status: "confirmed" },
  { rsvp_id: "rsvp-004", ticket_id: "tkt-004", user_id: "u-004", name: "Hana Siddiqui",  email: "hana.sid@web.com",         tier_name: "General Admission", checked_in: false, rsvp_status: "waitlisted" },
  { rsvp_id: "rsvp-005", ticket_id: "tkt-005", user_id: "u-005", name: "Ahmad Yusuf",    email: "ahmad.y@example.com",     tier_name: "Platinum Sponsor",  checked_in: true,  checked_in_at: new Date(Date.now() - 45 * 60e3).toISOString(), checked_in_by: "Admin", rsvp_status: "confirmed" },
  { rsvp_id: "rsvp-006", ticket_id: "tkt-006", user_id: "u-006", name: "Fatima Nour",    email: "fatima.n@mail.com",       tier_name: "VIP Pass",          checked_in: true,  checked_in_at: new Date(Date.now() - 10 * 60e3).toISOString(), checked_in_by: "Admin", rsvp_status: "confirmed" },
  { rsvp_id: "rsvp-007", ticket_id: "tkt-007", user_id: "u-007", name: "Ibrahim Khan",   email: "ibk@domain.net",          tier_name: "General Admission", checked_in: false, rsvp_status: "confirmed" },
];

const MOCK_TICKET: TicketDetailData = {
  ticket_id: "tkt-001",
  rsvp_id: "rsvp-001",
  user_id: "u-001",
  attendee_name: "Ahmad Yusuf",
  attendee_email: "ahmad.y@example.com",
  tier_name: "Platinum Sponsor",
  amount_paid: 250,
  currency: "USD",
  purchased_at: "2024-10-12T14:22:00Z",
  checked_in: true,
  checked_in_at: new Date(Date.now() - 45 * 60e3).toISOString(),
  checked_in_by: "Admin Javed",
  qr_token: "TKT-STR-8921-YX",
  scan_history: [
    { scanned_at: new Date(Date.now() - 45 * 60e3).toISOString(), result: "success" },
  ],
};

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60e3);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

const STATUS_CFG: Record<string, { cls: string; label: string }> = {
  confirmed:  { cls: "text-primary",           label: "Confirmed" },
  waitlisted: { cls: "text-secondary",          label: "Waitlisted" },
  cancelled:  { cls: "text-error",              label: "Cancelled" },
};

const TIER_CFG: Record<string, string> = {
  "General Admission": "bg-primary-fixed text-on-primary-fixed-variant",
  "VIP Pass":          "bg-secondary-container text-on-secondary-container",
  "Platinum Sponsor":  "bg-surface-container-high text-on-surface-variant",
};

/* ─────────────────────────────────────────────────────────────────
   LIVE INDICATOR
───────────────────────────────────────────────────────────────── */

function LiveBadge() {
  return (
    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold border border-green-200">
      <motion.div
        className="w-1.5 h-1.5 bg-green-500 rounded-full"
        animate={{ opacity: [1, 0.4, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      LIVE
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TICKET DETAIL DRAWER
───────────────────────────────────────────────────────────────── */

function TicketDetailDrawer({
  ticketId, eventId, isOpen, onClose,
}: {
  ticketId: string | null; eventId: string; isOpen: boolean; onClose: () => void;
}) {
  const qc = useQueryClient();
  const [tab, setTab]           = useState<"info" | "history">("info");
  const [note, setNote]         = useState("");
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);

  const { data } = useTicketDetail(eventId, ticketId ?? "");
  const { mutateAsync: undoCheckIn, isPending: undoing } = useUndoCheckIn(eventId);

  const ticket: TicketDetailData | null = data?.data ?? (ticketId ? MOCK_TICKET : null);

  const handleUndo = async () => {
    if (!ticket) return;
    await undoCheckIn({ rsvp_id: ticket.rsvp_id });
    toast.success("Check-in undone.");
    qc.invalidateQueries({ queryKey: ["attendees", eventId] });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col"
          >
            {/* Dark green header */}
            <div className="relative bg-primary text-on-primary px-6 pt-6 pb-12 overflow-hidden shrink-0">
              <div className="absolute inset-0 opacity-5"
                style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-5">
                  <button onClick={onClose}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors">
                    <span className="material-symbols-outlined text-[20px]">close</span>
                  </button>
                  {ticket && (
                    <span className="bg-white/10 px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase">
                      {ticket.qr_token}
                    </span>
                  )}
                </div>
                {ticket && (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[18px] overflow-hidden border-2 border-white/20 shrink-0">
                      {ticket.attendee_avatar
                        ? <img src={ticket.attendee_avatar} className="w-full h-full object-cover" />
                        : getInitials(ticket.attendee_name)}
                    </div>
                    <div>
                      <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[18px]">{ticket.attendee_name}</h2>
                      <p className="text-on-primary/70 text-[12px]">{ticket.attendee_email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status strip */}
            {ticket && (
              <div className="px-5 -mt-5 relative z-10">
                <div className="bg-white rounded-xl shadow-sm border border-outline/10 p-3 flex items-center justify-between">
                  <span className="text-[12px] text-on-surface-variant font-semibold">Registration Status</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
                    ticket.checked_in
                      ? "bg-primary-fixed text-on-primary-fixed-variant"
                      : "bg-surface-container-high text-on-surface-variant"
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${ticket.checked_in ? "bg-primary" : "bg-outline"}`} />
                    {ticket.checked_in ? "Checked In" : "Not Checked In"}
                  </span>
                </div>
              </div>
            )}

            {/* Tab switcher */}
            <div className="px-5 py-4 shrink-0">
              <div className="flex p-1 bg-surface-container rounded-full gap-0.5">
                {(["info", "history"] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-1.5 rounded-full text-[12px] font-semibold transition-all capitalize ${
                      tab === t ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
                    }`}>
                    {t === "info" ? "Information" : "Log History"}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 space-y-4 pb-4">
              <AnimatePresence mode="wait">
                {tab === "info" ? (
                  <motion.div key="info"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} className="space-y-4"
                  >
                    {ticket && (
                      <>
                        {/* Event details */}
                        <div className="bg-surface-container-low rounded-xl p-4 space-y-3 border border-outline/10">
                          <div className="grid grid-cols-2 gap-3">
                            {[
                              { label: "Tier",          value: ticket.tier_name },
                              { label: "Price",         value: formatCurrency(ticket.amount_paid, ticket.currency) },
                              { label: "Ref Code",      value: ticket.qr_token },
                              { label: "Purchase Date", value: new Date(ticket.purchased_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
                            ].map(({ label, value }) => (
                              <div key={label}>
                                <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">{label}</p>
                                <p className="text-[13px] font-semibold text-on-surface">{value}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Financial */}
                        <div className="bg-white rounded-xl border border-outline/10 p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Total Paid</span>
                            <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[22px] text-primary">
                              {formatCurrency(ticket.amount_paid, ticket.currency)}
                            </span>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <button className="flex items-center justify-end gap-2 text-primary text-[12px] font-semibold hover:underline">
                              <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                              View Invoice
                            </button>
                          </div>
                        </div>

                        {/* Internal note */}
                        <div>
                          <label className="block text-[11px] font-bold text-outline uppercase tracking-wider mb-1.5">
                            Internal Organizer Notes
                          </label>
                          <div className="relative">
                            <textarea
                              value={note}
                              onChange={(e) => setNote(e.target.value.slice(0, 200))}
                              rows={3}
                              placeholder="Add a check-in note (e.g., VIP dietary request)..."
                              className="w-full px-4 py-2.5 bg-surface-container-low border border-outline/20 rounded-xl text-[13px] resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                            />
                            <p className="absolute bottom-2 right-3 text-[10px] text-outline">{note.length}/200</p>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="history"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} className="space-y-3"
                  >
                    <p className="text-[11px] font-bold text-outline uppercase tracking-wider">Scan History</p>
                    {ticket && (
                      <div className="relative pl-6 space-y-5 border-l-2 border-surface-container-high ml-2">
                        {[
                          ...(ticket.checked_in_at ? [{
                            label: "Check-in Successful",
                            sub: `${timeAgo(ticket.checked_in_at)} by ${ticket.checked_in_by ?? "Admin"}`,
                            color: "bg-primary",
                          }] : []),
                          { label: "Reminder Sent",   sub: "Oct 23, 10:00 AM", color: "bg-surface-container-high" },
                          { label: "Ticket Purchased", sub: new Date(ticket.purchased_at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }), color: "bg-surface-container-high" },
                        ].map((item, i) => (
                          <div key={i} className="relative">
                            <div className={`absolute -left-[31px] top-1 w-4 h-4 ${item.color} rounded-full border-4 border-white shadow-sm`} />
                            <p className="text-[13px] font-bold text-on-surface">{item.label}</p>
                            <p className="text-[11px] text-outline">{item.sub}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer actions */}
            <div className="px-5 py-4 border-t border-outline/10 bg-surface-container-low/30 space-y-2 shrink-0">
              {ticket?.checked_in && (
                <button onClick={handleUndo} disabled={undoing}
                  className="w-full py-3 bg-surface-container text-on-surface rounded-full text-[13px] font-semibold hover:bg-surface-container-high transition-colors disabled:opacity-60">
                  {undoing ? "Undoing..." : "Undo Check-in"}
                </button>
              )}
              <button onClick={() => setShowRefundConfirm(!showRefundConfirm)}
                className="w-full py-2.5 text-error text-[13px] font-semibold hover:underline">
                Cancel & Refund Ticket
              </button>
              <AnimatePresence>
                {showRefundConfirm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-error/5 border border-error/15 rounded-xl p-4 space-y-3"
                  >
                    <p className="text-[12px] text-error font-semibold text-center">
                      Are you sure? This will invalidate the ticket and process a full refund.
                    </p>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-error text-on-error py-2.5 rounded-full text-[12px] font-bold">
                        Yes, Refund
                      </button>
                      <button onClick={() => setShowRefundConfirm(false)}
                        className="flex-1 bg-white border border-error/20 text-error py-2.5 rounded-full text-[12px] font-bold">
                        Keep Ticket
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MANUAL CHECKIN EXPANDED ROW
───────────────────────────────────────────────────────────────── */

function ManualCheckInRow({
  attendee, eventId, onDone,
}: {
  attendee: AttendeeRow; eventId: string; onDone: () => void;
}) {
  const qc = useQueryClient();
  const [note, setNote] = useState("");
  const { mutateAsync: checkIn, isPending } = useCheckIn(eventId);

  const handleConfirm = async () => {
    await checkIn({ rsvp_id: attendee.rsvp_id, note });
    toast.success(`${attendee.name} checked in!`);
    qc.invalidateQueries({ queryKey: ["attendees", eventId] });
    qc.invalidateQueries({ queryKey: ["checkin-stats", eventId] });
    onDone();
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="bg-surface-container-low/60 border-t border-outline/10 px-5 py-4"
    >
      <div className="space-y-3">
        <div>
          <label className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-1.5">
            Internal Note (Optional)
          </label>
          <div className="relative">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 200))}
              rows={2}
              placeholder="Add a check-in note (e.g., VIP dietary request)..."
              className="w-full px-4 py-2.5 bg-white border border-outline/20 rounded-xl text-[13px] resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
            <p className="absolute bottom-2 right-3 text-[10px] text-outline">{note.length}/200</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleConfirm} disabled={isPending}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-on-primary py-2.5 rounded-full text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-60">
            {isPending
              ? <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
              : <span className="material-symbols-outlined text-[18px]">how_to_reg</span>}
            {isPending ? "Checking in..." : "Confirm Manual Check-in"}
          </button>
          <button onClick={onDone}
            className="px-5 py-2.5 text-on-surface-variant text-[13px] font-semibold hover:text-on-surface transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */

type FilterTab = "all" | "confirmed" | "waitlisted" | "checked_in";

export default function AdminCheckinPage() {
  const { activeEvent } = useEventStore();
  const eventId = activeEvent?.event_id ?? "";
  const qc = useQueryClient();

  const [search, setSearch]             = useState("");
  const [filterTab, setFilterTab]       = useState<FilterTab>("all");
  const [tierFilter, setTierFilter]     = useState("all");
  const [expandedRow, setExpandedRow]   = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Hooks
  const { data: statsData, isLoading: statsLoading } = useCheckInStats(eventId);
  const { data: attendeesData, isLoading: attendeesLoading } = useAttendees(eventId, search);
  const { mutateAsync: undoCheckIn } = useUndoCheckIn(eventId);

  const stats = statsData?.data;
  const rawAttendees: AttendeeRow[] = attendeesData?.data ?? MOCK_ATTENDEES;

  // Derived stats
  const checkedIn   = rawAttendees.filter((a) => a.checked_in).length;
  const notArrived  = rawAttendees.filter((a) => !a.checked_in && a.rsvp_status === "confirmed").length;
  const waitlisted  = rawAttendees.filter((a) => a.rsvp_status === "waitlisted").length;
  const total       = rawAttendees.length;
  const checkInPct  = total > 0 ? Math.round((checkedIn / total) * 100) : 0;

  // Filter attendees
  const tiers = [...new Set(rawAttendees.map((a) => a.tier_name).filter(Boolean))] as string[];

  const filtered = rawAttendees.filter((a) => {
    const matchSearch = !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filterTab === "all" ? true :
      filterTab === "checked_in" ? a.checked_in :
      filterTab === "confirmed" ? (!a.checked_in && a.rsvp_status === "confirmed") :
      a.rsvp_status === "waitlisted";
    const matchTier = tierFilter === "all" || a.tier_name === tierFilter;
    return matchSearch && matchFilter && matchTier;
  });

  // Tier breakdown stats
  const tierBreakdown = tiers.map((tier) => {
    const tierAtts = rawAttendees.filter((a) => a.tier_name === tier);
    return {
      tier,
      total: tierAtts.length,
      checkedIn: tierAtts.filter((a) => a.checked_in).length,
    };
  });

  const FILTER_TABS: { id: FilterTab; label: string; count: number }[] = [
    { id: "all",        label: "All",         count: total },
    { id: "confirmed",  label: "Confirmed",   count: rawAttendees.filter((a) => a.rsvp_status === "confirmed" && !a.checked_in).length },
    { id: "waitlisted", label: "Waitlisted",  count: waitlisted },
    { id: "checked_in", label: "Checked In",  count: checkedIn },
  ];

  return (
    <>
      <AdminTopBar
        breadcrumbs={[
          { label: "My Events", href: "/admin/events" },
          { label: "Check-in" },
        ]}
        actions={
          activeEvent ? (
            <button className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm">
              <span className="material-symbols-outlined text-[18px]">qr_code_scanner</span>
              <span className="hidden sm:inline">Open Scanner</span>
            </button>
          ) : undefined
        }
      />

      <ActiveEventBanner pageName="check-in" />

      {!activeEvent ? (
        <div className="flex flex-col items-center justify-center py-32 text-center px-6">
          <span className="material-symbols-outlined text-outline text-[48px] mb-4">qr_code_scanner</span>
          <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-on-surface mb-2">
            No event selected
          </h2>
          <p className="text-[13px] text-outline max-w-xs">
            Go to My Events and select an event to manage check-ins.
          </p>
        </div>
      ) : (
        <div className="px-6 pt-6 pb-16 max-w-[1200px] mx-auto space-y-6">

          {/* ── Live stats + breadcrumb row ── */}
          <div className="flex items-center gap-3 flex-wrap">
            <nav className="flex items-center gap-1 text-[11px] text-outline">
              <span>{activeEvent.title}</span>
              <span className="material-symbols-outlined text-[13px]">chevron_right</span>
              <span className="text-primary font-bold">Attendees & Check-in</span>
            </nav>
            <LiveBadge />
          </div>

          {/* ── 3 stat cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Checked in */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-outline/10 shadow-sm p-5">
              <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Checked In</p>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="font-['Plus_Jakarta_Sans'] text-[36px] font-extrabold text-primary">
                  {statsLoading ? "—" : (stats?.total_checked_in ?? checkedIn)}
                </span>
                <span className="text-outline text-[13px]">
                  of {stats?.total_registered ?? total} confirmed
                </span>
              </div>
              <div className="h-2 bg-surface-container rounded-full overflow-hidden mb-1">
                <motion.div className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${stats?.check_in_rate ?? checkInPct}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <p className="text-[11px] text-outline">
                {stats?.check_in_rate ?? checkInPct}% checked in
              </p>
            </motion.div>

            {/* Yet to arrive */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.07 }}
              className="bg-white rounded-2xl border border-outline/10 shadow-sm p-5">
              <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Yet to Arrive</p>
              <div className="font-['Plus_Jakarta_Sans'] text-[36px] font-extrabold text-secondary mb-3">
                {notArrived}
              </div>
              <div className="flex items-center gap-2 text-[12px] text-on-surface-variant">
                <span className="material-symbols-outlined text-secondary text-[18px]">pending</span>
                Confirmed but not checked in
              </div>
            </motion.div>

            {/* Waitlisted */}
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.14 }}
              className="bg-white rounded-2xl border border-outline/10 shadow-sm p-5">
              <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">Waitlisted</p>
              <div className="font-['Plus_Jakarta_Sans'] text-[36px] font-extrabold text-outline mb-3">
                {waitlisted}
              </div>
              {waitlisted > 0 && (
                <div className="flex items-center gap-2 text-[12px] text-error">
                  <span className="material-symbols-outlined text-[18px]">warning</span>
                  Capacity may be reached
                </div>
              )}
            </motion.div>
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* ── LEFT: Attendee table (8 cols) ── */}
            <div className="lg:col-span-8 space-y-4">
              {/* Search + filters */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Search */}
                  <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                      search
                    </span>
                    <input type="text" value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search by name or email..."
                      className="w-full pl-11 pr-4 py-2.5 bg-surface-container-low border-b-2 border-outline/20 focus:border-primary rounded-t-lg text-[13px] focus:outline-none transition-all"
                    />
                  </div>

                  {/* Tier filter */}
                  <div className="relative">
                    <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}
                      className="appearance-none bg-surface-container-low border-b-2 border-outline/20 px-4 py-2.5 pr-8 text-[13px] font-semibold focus:outline-none focus:border-primary rounded-t-lg w-full sm:w-auto">
                      <option value="all">All Tiers</option>
                      {tiers.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
                      expand_more
                    </span>
                  </div>
                </div>

                {/* Status filter pills */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {FILTER_TABS.map((t) => (
                    <button key={t.id} onClick={() => setFilterTab(t.id)}
                      className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
                        filterTab === t.id
                          ? "bg-primary text-on-primary shadow-sm"
                          : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
                      }`}>
                      {t.label}
                      <span className="ml-1.5 text-[10px] font-bold opacity-70">({t.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[560px]">
                    <thead>
                      <tr className="bg-surface-container-low/60 border-b border-outline/10">
                        {["Attendee", "Tier", "Status", "Actions"].map((h) => (
                          <th key={h} className="px-5 py-3.5 text-left text-[10px] font-bold text-outline uppercase tracking-widest">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {attendeesLoading ? (
                        Array.from({ length: 4 }).map((_, i) => (
                          <tr key={i} className="border-b border-outline/5">
                            <td colSpan={4} className="px-5 py-4">
                              <div className="h-4 bg-surface-container animate-pulse rounded w-full" />
                            </td>
                          </tr>
                        ))
                      ) : filtered.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-16 text-center">
                            <span className="material-symbols-outlined text-outline text-4xl block mb-2">person_search</span>
                            <p className="text-[13px] text-on-surface-variant font-semibold">No attendees found</p>
                          </td>
                        </tr>
                      ) : (
                        filtered.map((att, i) => {
                          const isExpanded = expandedRow === att.rsvp_id;
                          const tierCls = TIER_CFG[att.tier_name ?? ""] ?? "bg-surface-container text-on-surface-variant";
                          const statusCfg = STATUS_CFG[att.rsvp_status] ?? STATUS_CFG.confirmed;

                          return (
                            <React.Fragment key={att.rsvp_id}>
                              <motion.tr
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.04 }}
                                className={`border-b border-outline/5 transition-colors ${
                                  isExpanded ? "bg-surface-container-low/40" : "hover:bg-surface-container-low/30"
                                }`}
                              >
                                {/* Attendee */}
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-[10px] font-bold text-primary shrink-0 overflow-hidden">
                                      {att.avatar_url
                                        ? <img src={att.avatar_url} className="w-full h-full object-cover" />
                                        : getInitials(att.name)}
                                    </div>
                                    <div>
                                      <p className="text-[13px] font-bold text-on-surface">{att.name}</p>
                                      <p className="text-[11px] text-outline">{att.email}</p>
                                    </div>
                                  </div>
                                </td>

                                {/* Tier */}
                                <td className="px-5 py-3.5">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${tierCls}`}>
                                    {att.tier_name}
                                  </span>
                                </td>

                                {/* Status */}
                                <td className="px-5 py-3.5">
                                  {att.checked_in ? (
                                    <span className="flex items-center gap-1.5 text-primary text-[12px] font-bold">
                                      <span className="material-symbols-outlined text-[16px]"
                                        style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                                      Checked In
                                    </span>
                                  ) : (
                                    <span className={`text-[12px] font-semibold ${statusCfg.cls}`}>
                                      {statusCfg.label}
                                    </span>
                                  )}
                                </td>

                                {/* Actions */}
                                <td className="px-5 py-3.5">
                                  <div className="flex items-center gap-2 justify-end">
                                    {att.checked_in ? (
                                      <>
                                        <button
                                          onClick={async () => {
                                            await undoCheckIn({ rsvp_id: att.rsvp_id });
                                            toast.success("Check-in undone.");
                                            qc.invalidateQueries({ queryKey: ["attendees", eventId] });
                                          }}
                                          className="text-[11px] text-error hover:underline font-semibold">
                                          Undo
                                        </button>
                                        <button
                                          onClick={() => setSelectedTicketId(att.ticket_id ?? null)}
                                          className="text-[11px] text-primary font-bold hover:underline">
                                          View Ticket
                                        </button>
                                      </>
                                    ) : att.rsvp_status === "waitlisted" ? (
                                      <button className="text-[11px] text-primary font-bold hover:underline">
                                        Manage Status
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() => setExpandedRow(isExpanded ? null : att.rsvp_id)}
                                        className="flex items-center gap-1.5 bg-primary text-on-primary px-3 py-1.5 rounded-full text-[11px] font-bold hover:opacity-90 active:scale-95 transition-all"
                                      >
                                        <span className="material-symbols-outlined text-[14px]">how_to_reg</span>
                                        Check In
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </motion.tr>

                              {/* Manual check-in expanded row */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <tr key={`${att.rsvp_id}-expanded`}>
                                    <td colSpan={4} className="p-0">
                                      <ManualCheckInRow
                                        attendee={att}
                                        eventId={eventId}
                                        onDone={() => setExpandedRow(null)}
                                      />
                                    </td>
                                  </tr>
                                )}
                              </AnimatePresence>
                            </React.Fragment>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="px-5 py-3 border-t border-outline/10 bg-surface-container-low/20 flex items-center justify-between">
                  <span className="text-[11px] text-outline">
                    {filtered.length} of {rawAttendees.length} attendees
                  </span>
                  <div className="flex gap-1">
                    <button disabled className="w-7 h-7 flex items-center justify-center rounded text-outline/30 cursor-not-allowed">
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    <button className="w-7 h-7 flex items-center justify-center rounded text-outline hover:bg-surface-container transition-colors">
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT sidebar (4 cols) ── */}
            <aside className="lg:col-span-4 space-y-4 sticky top-6 self-start">

              {/* Arrivals mini chart */}
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-outline/10 shadow-sm p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[14px] text-primary">
                    Arrivals This Hour
                  </h3>
                  <span className="text-[10px] text-outline bg-surface-container px-2 py-1 rounded-lg font-semibold">
                    Real-time
                  </span>
                </div>
                <div className="flex items-end justify-between gap-1 h-24 px-1">
                  {[40, 65, 85, 95, 60, 30].map((h, i) => (
                    <div key={i} className="flex flex-col items-center flex-1">
                      <motion.div
                        className={`w-full rounded-t-lg ${i === 3 ? "bg-primary" : "bg-primary-fixed-dim"}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${h}%` }}
                        transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
                      />
                      <span className="text-[9px] text-outline mt-1.5">
                        {["17:00","17:30","18:00","18:30","19:00","19:30"][i]}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Check-ins by tier */}
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28 }}
                className="bg-white rounded-2xl border border-outline/10 shadow-sm p-5"
              >
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[14px] text-primary mb-4">
                  Check-ins by Tier
                </h3>
                <div className="space-y-4">
                  {tierBreakdown.map(({ tier, total: t, checkedIn: c }) => {
                    const pct = t > 0 ? Math.round((c / t) * 100) : 0;
                    return (
                      <div key={tier} className="space-y-1.5">
                        <div className="flex justify-between text-[12px] font-bold">
                          <span className="text-on-surface truncate max-w-[140px]">{tier}</span>
                          <span className="text-primary shrink-0">{c} / {t}</span>
                        </div>
                        <div className="h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                          <motion.div className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.7, delay: 0.4 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>

              {/* Quick scan CTA */}
              <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.36 }}
                className="bg-primary rounded-2xl p-5 text-on-primary"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">qr_code_scanner</span>
                  </div>
                  <div>
                    <p className="font-['Plus_Jakarta_Sans'] font-bold text-[14px]">QR Scanner</p>
                    <p className="text-on-primary/70 text-[11px]">Scan tickets for instant check-in</p>
                  </div>
                </div>
                <button className="w-full py-2.5 bg-white text-primary rounded-full text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all">
                  Open Scanner
                </button>
              </motion.div>
            </aside>
          </div>
        </div>
      )}

      {/* Ticket detail drawer */}
      <TicketDetailDrawer
        ticketId={selectedTicketId}
        eventId={eventId}
        isOpen={!!selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
      />
    </>
  );
}