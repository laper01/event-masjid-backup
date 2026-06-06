"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEventStore } from "@/store/eventStore";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { ActiveEventBanner } from "@/components/admin/ActiveEventBanner";
import {
  usePendingApprovals,
  useDecidedApprovals,
  useDecideRequest,
} from "@/hooks/useApprovals";
import type { ApprovalRequest, DecidedRequest } from "@/types/approvals";

/* ─────────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────────── */

const MOCK_PENDING: ApprovalRequest[] = [
  {
    request_id: "req-001",
    event_id: "evt-001",
    user_id: "usr-001",
    applicant_name: "Ahmad Bin Yusuf",
    applicant_email: "ahmad.y@example.com",
    applicant_joined_at: "2021-03-15T00:00:00Z",
    message: "I am a local community member and would love to attend. JazakAllah khair.",
    submitted_at: new Date(Date.now() - 2 * 864e5).toISOString(),
    status: "pending",
    is_verified: true,
    previous_events_attended: 12,
    history: [
      { event_title: "Youth Forum 2024", action: "attended", date: "2024-06-05" },
      { event_title: "Ramadan Iftar", action: "attended", date: "2024-03-20" },
    ],
  },
  {
    request_id: "req-002",
    event_id: "evt-001",
    user_id: "usr-002",
    applicant_name: "Zubair Al-Farsi",
    applicant_email: "z.alfarsi@mail.com",
    applicant_joined_at: "2023-10-01T00:00:00Z",
    message: "Assalamu Alaikum, I would like to attend the upcoming Community Leadership Summit. I've been active in the youth mentorship program.",
    submitted_at: new Date(Date.now() - 5 * 36e5).toISOString(),
    status: "pending",
    is_verified: false,
    previous_events_attended: 3,
    history: [],
  },
  {
    request_id: "req-003",
    event_id: "evt-001",
    user_id: "usr-003",
    applicant_name: "Fatima Zahra",
    applicant_email: "f.zahra@service.org",
    applicant_joined_at: "2019-05-10T00:00:00Z",
    message: "Bringing my students from the local madrasah. Total 5 people.",
    submitted_at: new Date(Date.now() - 864e5).toISOString(),
    status: "pending",
    is_verified: true,
    previous_events_attended: 34,
    history: [
      { event_title: "Food Drive 2023", action: "volunteer", date: "2023-12-14" },
    ],
  },
];

const MOCK_DECIDED: DecidedRequest[] = [
  {
    request_id: "req-004",
    applicant_name: "Zubair Ahmed",
    applicant_email: "zubair.a@example.com",
    message: "Looking forward to the event.",
    submitted_at: new Date(Date.now() - 3 * 864e5).toISOString(),
    status: "approved",
    organizer_reply: "As-salamu alaykum Zubair, we are thrilled to have you join! Looking forward to seeing you there.",
    decided_at: new Date(Date.now() - 2 * 36e5).toISOString(),
    decided_by: "Admin Yusuf",
    has_registered: true,
  },
  {
    request_id: "req-005",
    applicant_name: "Layla Hassan",
    applicant_email: "layla@example.com",
    message: "I attended last year and would love to come again.",
    submitted_at: new Date(Date.now() - 2 * 864e5).toISOString(),
    status: "approved",
    organizer_reply: "Welcome back Layla! Your participation in the previous youth workshop was appreciated.",
    decided_at: new Date(Date.now() - 5 * 36e5).toISOString(),
    decided_by: "Admin Fatima",
    has_registered: true,
  },
  {
    request_id: "req-006",
    applicant_name: "Ibrahim Noor",
    applicant_email: "ibrahim.n@domain.com",
    message: "I would like to attend.",
    submitted_at: new Date(Date.now() - 5 * 864e5).toISOString(),
    status: "denied",
    organizer_reply: "This session is now limited to residents of the local area. Please look for future events.",
    decided_at: new Date(Date.now() - 4 * 864e5).toISOString(),
    decided_by: "Admin Yusuf",
    has_registered: false,
  },
];

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 36e5);
  const days  = Math.floor(diff / 864e5);
  if (hours < 1)  return "just now";
  if (hours < 24) return `${hours} hours ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function memberSince(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

/* ─────────────────────────────────────────────────────────────────
   REQUEST DETAIL DRAWER
───────────────────────────────────────────────────────────────── */

function RequestDetailDrawer({
  request,
  isOpen,
  onClose,
  onDecide,
  deciding,
}: {
  request: ApprovalRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onDecide: (decision: "approved" | "denied", reply: string) => void;
  deciding: boolean;
}) {
  const [tab, setTab]     = useState<"details" | "history">("details");
  const [reply, setReply] = useState("");
  const [action, setAction] = useState<"approve" | "deny" | null>(null);

  return (
    <AnimatePresence>
      {isOpen && request && (
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
            {/* Header */}
            <div className="px-6 py-5 border-b border-outline/10 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[18px] ring-4 ring-primary-fixed/50 overflow-hidden">
                    {request.applicant_avatar
                      ? <img src={request.applicant_avatar} className="w-full h-full object-cover" />
                      : getInitials(request.applicant_name)}
                  </div>
                  {request.is_verified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-on-primary text-[12px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                    </div>
                  )}
                </div>
                <div>
                  <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[16px] text-primary">
                    {request.applicant_name}
                  </h2>
                  <p className="text-[12px] text-outline">{request.applicant_email}</p>
                </div>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors">
                <span className="material-symbols-outlined text-outline text-[20px]">close</span>
              </button>
            </div>

            {/* Stats row */}
            <div className="px-6 py-4 bg-surface-container-low/50 border-b border-outline/10">
              <div className="flex divide-x divide-outline/15">
                {[
                  { label: "Member Since",   value: memberSince(request.applicant_joined_at) },
                  { label: "Events Attended", value: `${request.previous_events_attended}` },
                  { label: "Submitted",       value: timeAgo(request.submitted_at) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex-1 text-center px-3">
                    <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-0.5">{label}</p>
                    <p className="text-[13px] font-bold text-primary">{value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tab switcher */}
            <div className="px-6 pt-4 pb-2">
              <div className="flex p-1 bg-surface-container rounded-full gap-0.5">
                {(["details", "history"] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`flex-1 py-1.5 rounded-full text-[12px] font-semibold transition-all capitalize ${
                      tab === t ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
                    }`}>
                    {t === "details" ? "Request Details" : "Profile History"}
                  </button>
                ))}
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              <AnimatePresence mode="wait">
                {tab === "details" ? (
                  <motion.div key="details"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} className="space-y-4"
                  >
                    {/* Applicant message */}
                    <div className="relative">
                      <span className="material-symbols-outlined absolute -top-3 -left-1 text-primary/10 text-[48px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
                      <div className="bg-surface-container-lowest border-l-4 border-primary p-4 rounded-r-xl shadow-sm">
                        <p className="text-[13px] text-on-surface leading-relaxed italic">
                          "{request.message}"
                        </p>
                      </div>
                    </div>

                    {/* Risk insight if low history */}
                    {request.previous_events_attended < 5 && (
                      <div className="bg-error/5 border border-error/15 rounded-xl p-4 flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-error text-[18px]"
                            style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-error mb-1">Engagement Insights</p>
                          <p className="text-[12px] text-on-surface-variant leading-relaxed">
                            New member with limited event history. Consider verifying identity before approving.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Request metadata */}
                    <div className="text-[11px] text-outline">
                      Request ID: #{request.request_id.toUpperCase()}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="history"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} className="space-y-3"
                  >
                    <p className="text-[11px] font-bold text-outline uppercase tracking-wider mb-2">
                      Event History
                    </p>
                    {request.history.length === 0 ? (
                      <div className="py-8 text-center">
                        <span className="material-symbols-outlined text-outline text-3xl block mb-2">history</span>
                        <p className="text-[13px] text-on-surface-variant">No event history yet</p>
                      </div>
                    ) : (
                      request.history.map((h, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-surface-container-lowest border border-outline/10 rounded-xl">
                          <div className="w-10 h-10 rounded-full bg-primary-fixed/30 flex items-center justify-center text-primary shrink-0">
                            <span className="material-symbols-outlined text-[18px]">event</span>
                          </div>
                          <div>
                            <p className="text-[13px] font-bold text-on-surface">{h.event_title}</p>
                            <p className="text-[11px] text-outline capitalize">{h.action} · {h.date}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action area */}
            <div className="border-t border-outline/10 px-6 py-4 bg-surface-container-low/30 space-y-3">
              <AnimatePresence>
                {action && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`rounded-xl p-4 border space-y-3 ${
                      action === "approve"
                        ? "bg-primary-fixed/20 border-primary/15"
                        : "bg-error/5 border-error/15"
                    }`}
                  >
                    <p className={`text-[13px] font-bold flex items-center gap-2 ${
                      action === "approve" ? "text-primary" : "text-error"
                    }`}>
                      <span className="material-symbols-outlined text-[18px]">
                        {action === "approve" ? "check_circle" : "block"}
                      </span>
                      {action === "approve"
                        ? `Approve access for ${request.applicant_name}?`
                        : `Deny access for ${request.applicant_name}?`}
                    </p>
                    <div>
                      <label className="block text-[12px] font-bold text-on-surface mb-1.5">
                        {action === "approve" ? "Welcome message (optional)" : "Denial reason (sent to user)"}
                      </label>
                      <textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        maxLength={300}
                        rows={3}
                        placeholder={action === "approve"
                          ? "Add a warm welcome message..."
                          : "e.g. This session is limited to local residents..."}
                        className="w-full px-4 py-2.5 bg-white border border-outline/20 rounded-xl text-[13px] resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      />
                      <p className="text-[10px] text-outline text-right mt-0.5">{reply.length}/300</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => onDecide(action === "approve" ? "approved" : "denied", reply)}
                        disabled={deciding}
                        className={`flex-1 py-2.5 rounded-full text-[13px] font-bold transition-all disabled:opacity-60 flex items-center justify-center gap-1.5 ${
                          action === "approve"
                            ? "bg-primary text-on-primary hover:opacity-90"
                            : "bg-error text-on-error hover:opacity-90"
                        }`}>
                        {deciding
                          ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : action === "approve" ? "Confirm Approval" : "Confirm Denial"}
                      </button>
                      <button onClick={() => { setAction(null); setReply(""); }}
                        className="flex-1 py-2.5 bg-surface-container text-on-surface rounded-full text-[13px] font-semibold hover:bg-surface-container-high transition-colors">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {!action && (
                <div className="flex gap-3">
                  <button onClick={() => setAction("deny")}
                    className="flex-1 py-2.5 border-2 border-error text-error rounded-full text-[13px] font-bold hover:bg-error/5 active:scale-95 transition-all">
                    Deny Request
                  </button>
                  <button onClick={() => setAction("approve")}
                    className="flex-1 py-2.5 bg-primary text-on-primary rounded-full text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm">
                    Approve Access
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PENDING TAB
───────────────────────────────────────────────────────────────── */

function PendingTab({
  eventId, search,
  onViewDetail,
}: {
  eventId: string;
  search: string;
  onViewDetail: (req: ApprovalRequest) => void;
}) {
  const qc = useQueryClient();
  const { data, isLoading } = usePendingApprovals(eventId);
  const { mutateAsync: decide, isPending: deciding } = useDecideRequest(eventId);

  const requests: ApprovalRequest[] = data?.data ?? MOCK_PENDING;
  const filtered = requests.filter((r) =>
    !search ||
    r.applicant_name.toLowerCase().includes(search.toLowerCase()) ||
    r.applicant_email.toLowerCase().includes(search.toLowerCase())
  );

  const handleQuickDecide = async (req: ApprovalRequest, decision: "approved" | "denied") => {
    await decide({ request_id: req.request_id, decision });
    toast.success(`${req.applicant_name} ${decision === "approved" ? "approved" : "denied"}.`);
    qc.invalidateQueries({ queryKey: ["approvals", eventId] });
  };

  const handleApproveAll = async () => {
    for (const req of filtered) {
      await decide({ request_id: req.request_id, decision: "approved" });
    }
    toast.success(`${filtered.length} requests approved!`);
    qc.invalidateQueries({ queryKey: ["approvals", eventId] });
  };

  if (isLoading) return (
    <div className="space-y-4">
      {[0,1,2].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-outline/10 h-48 animate-pulse" />
      ))}
    </div>
  );

  if (filtered.length === 0) return (
    <div className="py-20 text-center">
      <span className="material-symbols-outlined text-outline text-[48px] block mb-3">check_circle</span>
      <p className="font-['Plus_Jakarta_Sans'] font-bold text-[16px] text-on-surface mb-1">All caught up!</p>
      <p className="text-[13px] text-outline">No pending approval requests.</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Approve All */}
      {filtered.length > 1 && (
        <div className="flex justify-end">
          <button onClick={handleApproveAll} disabled={deciding}
            className="flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-60">
            <span className="material-symbols-outlined text-[18px]">done_all</span>
            Approve All ({filtered.length})
          </button>
        </div>
      )}

      {filtered.map((req, i) => (
        <motion.div key={req.request_id}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="bg-white rounded-2xl border border-outline/10 shadow-sm hover:shadow-md transition-shadow p-5"
        >
          <div className="flex flex-col md:flex-row gap-5">
            {/* User info */}
            <div className="flex items-start gap-4 flex-1">
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary text-[18px] overflow-hidden">
                  {req.applicant_avatar
                    ? <img src={req.applicant_avatar} className="w-full h-full object-cover" />
                    : getInitials(req.applicant_name)}
                </div>
                {req.is_verified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-on-primary text-[11px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[16px] text-on-surface">
                    {req.applicant_name}
                  </h3>
                  <span className="bg-primary-fixed text-on-primary-fixed-variant px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    Member since {memberSince(req.applicant_joined_at)}
                  </span>
                  {req.previous_events_attended > 10 && (
                    <span className="flex items-center gap-1 text-secondary text-[11px] font-bold">
                      <span className="material-symbols-outlined text-[15px]">military_tech</span>
                      {req.previous_events_attended} events attended
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-outline mb-3">
                  Requested {timeAgo(req.submitted_at)} · {req.applicant_email}
                </p>

                {/* Message */}
                <div className="relative bg-surface-container-low border-l-4 border-primary p-3 rounded-r-xl">
                  <span className="material-symbols-outlined absolute -top-2 -left-1.5 text-primary/15 text-[32px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}>format_quote</span>
                  <p className="text-[12px] text-on-surface-variant italic leading-relaxed">
                    "{req.message}"
                  </p>
                </div>

                <button onClick={() => onViewDetail(req)}
                  className="mt-3 text-primary text-[12px] font-bold hover:underline flex items-center gap-1">
                  View Full Profile
                  <span className="material-symbols-outlined text-[15px]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex md:flex-col gap-2 md:w-40 shrink-0">
              <button onClick={() => handleQuickDecide(req, "approved")} disabled={deciding}
                className="flex-1 md:flex-none py-2.5 bg-primary text-on-primary rounded-full text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm disabled:opacity-60">
                Approve
              </button>
              <button onClick={() => onViewDetail(req)}
                className="flex-1 md:flex-none py-2.5 bg-surface-container-highest text-error rounded-full text-[13px] font-semibold hover:bg-error-container transition-colors border border-error/20">
                Deny
              </button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   DECIDED TAB (Approved + Denied)
───────────────────────────────────────────────────────────────── */

function DecidedTab({
  eventId, search, filter,
}: {
  eventId: string;
  search: string;
  filter: "approved" | "denied";
}) {
  const { data, isLoading } = useDecidedApprovals(eventId);
  const all: DecidedRequest[] = data?.data ?? MOCK_DECIDED;

  const filtered = all.filter((r) =>
    r.status === filter &&
    (!search ||
      r.applicant_name.toLowerCase().includes(search.toLowerCase()) ||
      r.applicant_email.toLowerCase().includes(search.toLowerCase()))
  );

  if (isLoading) return (
    <div className="space-y-4">
      {[0,1].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-outline/10 h-40 animate-pulse" />
      ))}
    </div>
  );

  if (filtered.length === 0) return (
    <div className="py-20 text-center">
      <span className="material-symbols-outlined text-outline text-[48px] block mb-3">
        {filter === "approved" ? "check_circle" : "block"}
      </span>
      <p className="text-[13px] text-on-surface-variant font-semibold">
        No {filter} requests yet.
      </p>
    </div>
  );

  return (
    <div className="space-y-4">
      {filtered.map((req, i) => (
        <motion.div key={req.request_id}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.06 }}
          className="bg-white rounded-2xl border border-outline/10 shadow-sm p-5"
        >
          <div className="flex flex-col md:flex-row gap-5">
            {/* Avatar */}
            <div className="shrink-0">
              <div className="w-16 h-16 rounded-full bg-primary-fixed flex items-center justify-center font-bold text-primary text-[18px] overflow-hidden border-2 border-primary-fixed">
                {req.applicant_avatar
                  ? <img src={req.applicant_avatar} className="w-full h-full object-cover" />
                  : getInitials(req.applicant_name)}
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[15px] text-on-surface">
                  {req.applicant_name}
                </h3>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`material-symbols-outlined text-[16px] ${
                    req.status === "approved" ? "text-primary-container" : "text-error"
                  }`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    {req.status === "approved" ? "verified" : "block"}
                  </span>
                  <span className={`text-[11px] font-bold uppercase tracking-wide ${
                    req.status === "approved" ? "text-primary-container" : "text-error"
                  }`}>
                    {req.status}
                  </span>
                  <span className="text-[11px] text-outline">
                    · {timeAgo(req.decided_at)} by {req.decided_by}
                  </span>
                </div>
              </div>

              {/* Organizer reply */}
              {req.organizer_reply && (
                <div className="bg-primary-fixed/15 border-l-4 border-primary-container p-3 rounded-r-xl">
                  <p className="text-[12px] text-on-primary-fixed-variant italic leading-relaxed">
                    "{req.organizer_reply}"
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-outline/10">
                <div className="flex gap-2">
                  <button className="px-4 py-1.5 rounded-full border border-outline/20 text-on-surface text-[12px] font-semibold hover:bg-surface-container-low transition-colors">
                    View Profile
                  </button>
                  {req.status === "approved" && (
                    <button className="px-4 py-1.5 rounded-full text-error text-[12px] font-semibold hover:bg-error-container/20 transition-colors">
                      Revoke Access
                    </button>
                  )}
                </div>
                <span className="material-symbols-outlined text-outline text-[20px] cursor-pointer hover:text-primary transition-colors">
                  info
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */

type TabId = "pending" | "approved" | "denied";

export default function AdminApprovalsPage() {
  const { activeEvent } = useEventStore();
  const eventId = activeEvent?.event_id ?? "";

  const [tab, setTab]       = useState<TabId>("pending");
  const [search, setSearch] = useState("");
  const [detailReq, setDetailReq] = useState<ApprovalRequest | null>(null);

  const { data: pendingData } = usePendingApprovals(eventId);
  const { data: decidedData } = useDecidedApprovals(eventId);
  const { mutateAsync: decide, isPending: deciding } = useDecideRequest(eventId);
  const qc = useQueryClient();

  const pending  = pendingData?.data  ?? MOCK_PENDING;
  const decided  = decidedData?.data  ?? MOCK_DECIDED;
  const approved = decided.filter((r) => r.status === "approved");
  const denied   = decided.filter((r) => r.status === "denied");

  const TABS: { id: TabId; label: string; count: number }[] = [
    { id: "pending",  label: "Pending",  count: pending.length },
    { id: "approved", label: "Approved", count: approved.length },
    { id: "denied",   label: "Denied",   count: denied.length },
  ];

  const handleDecide = async (decision: "approved" | "denied", reply: string) => {
    if (!detailReq) return;
    await decide({ request_id: detailReq.request_id, decision, reply });
    toast.success(`${detailReq.applicant_name} ${decision === "approved" ? "approved!" : "denied."}`);
    qc.invalidateQueries({ queryKey: ["approvals", eventId] });
    setDetailReq(null);
  };

  return (
    <>
      <AdminTopBar
        breadcrumbs={[
          { label: "My Events", href: "/admin/events" },
          { label: "Approvals" },
        ]}
      />

      <ActiveEventBanner pageName="approvals" />

      {!activeEvent ? (
        <div className="flex flex-col items-center justify-center py-32 text-center px-6">
          <span className="material-symbols-outlined text-outline text-[48px] mb-4">how_to_reg</span>
          <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-on-surface mb-2">
            No event selected
          </h2>
          <p className="text-[13px] text-outline max-w-xs">
            Go to My Events and select an event to manage its approval queue.
          </p>
        </div>
      ) : (
        <div className="px-6 pt-6 pb-16 max-w-[1200px] mx-auto">

          {/* ── Summary stats ── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-4 mb-6"
          >
            {[
              { label: "Pending",  count: pending.length,  cls: "bg-white border-outline/10", valCls: "text-secondary",       icon: "hourglass_empty", iconBg: "bg-secondary-container",  iconCl: "text-on-secondary-container" },
              { label: "Approved", count: approved.length, cls: "bg-primary-container border-primary/10", valCls: "text-on-primary-container", icon: "check_circle", iconBg: "bg-primary-fixed", iconCl: "text-primary" },
              { label: "Denied",   count: denied.length,   cls: "bg-white border-outline/10", valCls: "text-error",           icon: "cancel",         iconBg: "bg-error-container",      iconCl: "text-on-error-container" },
            ].map(({ label, count, cls, valCls, icon, iconBg, iconCl }) => (
              <div key={label} className={`rounded-2xl p-5 flex items-center justify-between border shadow-sm ${cls}`}>
                <div>
                  <p className={`text-[11px] font-bold ${label === "Approved" ? "text-on-primary-container/70" : "text-on-surface-variant"} uppercase tracking-wider mb-1`}>
                    {label}
                  </p>
                  <p className={`font-['Plus_Jakarta_Sans'] text-[28px] font-extrabold ${valCls}`}>{count}</p>
                </div>
                <div className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center`}>
                  <span className={`material-symbols-outlined ${iconCl} text-[22px]`}>{icon}</span>
                </div>
              </div>
            ))}
          </motion.div>

          {/* ── Tabs + search ── */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Tabs */}
              <div className="flex bg-surface-container p-1 rounded-full gap-0.5">
                {TABS.map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`px-5 py-2 rounded-full text-[13px] font-semibold whitespace-nowrap transition-all ${
                      tab === t.id
                        ? "bg-white text-primary shadow-sm font-bold"
                        : "text-on-surface-variant hover:text-primary"
                    }`}>
                    {t.label}
                    <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      tab === t.id ? "bg-primary/10 text-primary" : "bg-surface-container-high text-outline"
                    }`}>
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                search
              </span>
              <input
                type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full pl-11 pr-4 py-3 bg-surface-container-low border-none rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
          </div>

          {/* ── Tab content ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
            >
              {tab === "pending" && (
                <PendingTab
                  eventId={eventId}
                  search={search}
                  onViewDetail={(req) => setDetailReq(req)}
                />
              )}
              {tab === "approved" && (
                <DecidedTab eventId={eventId} search={search} filter="approved" />
              )}
              {tab === "denied" && (
                <DecidedTab eventId={eventId} search={search} filter="denied" />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Request Detail Drawer */}
      <RequestDetailDrawer
        request={detailReq}
        isOpen={!!detailReq}
        onClose={() => setDetailReq(null)}
        onDecide={handleDecide}
        deciding={deciding}
      />
    </>
  );
}