"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEventStore } from "@/store/eventStore";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { ActiveEventBanner } from "@/components/admin/ActiveEventBanner";
import {
  useLinkInvites,
  useDirectInvites,
  useAccessMembers,
  useSendDirectInvite,
  useRevokeInvite,
  useSearchUsers,
} from "@/hooks/useInvites";
import type { DirectInviteRecord, AccessMember } from "@/types/approvals";

/* ─────────────────────────────────────────────────────────────────
   LOCAL TYPES
───────────────────────────────────────────────────────────────── */

interface LinkInvite {
  link_id: string;
  label: string;
  url: string;
  uses: number;
  max_uses?: number;
  status: "active" | "revoked" | "expired";
  created_at: string;
  expires_at?: string;
}

/* ─────────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────────── */

const MOCK_LINKS: LinkInvite[] = [
  {
    link_id: "lnk-001",
    label: "Instagram Story",
    url: "https://events.masjids.io/invite/abc123",
    uses: 14,
    max_uses: 50,
    status: "active",
    created_at: "2026-10-12T00:00:00Z",
    expires_at: "2026-10-15T00:00:00Z",
  },
  {
    link_id: "lnk-002",
    label: "WhatsApp Group",
    url: "https://events.masjids.io/invite/def456",
    uses: 50,
    max_uses: 50,
    status: "revoked",
    created_at: "2026-10-10T00:00:00Z",
  },
];

const MOCK_DIRECT: DirectInviteRecord[] = [
  {
    invite_id: "inv-001",
    recipient_name: "Zaid Al-Habib",
    recipient_email: "zaid.h@example.com",
    status: "pending",
    sent_at: "2026-10-12T08:00:00Z",
  },
  {
    invite_id: "inv-002",
    recipient_name: "Mariam Ahmed",
    recipient_email: "mariam@school.edu",
    status: "pending",
    sent_at: "2026-10-11T10:00:00Z",
  },
  {
    invite_id: "inv-003",
    recipient_name: "Yusuf Mansoor",
    recipient_email: "yusuf@domain.com",
    status: "accepted",
    sent_at: "2026-10-09T14:00:00Z",
    accepted_at: "2026-10-10T09:00:00Z",
  },
  {
    invite_id: "inv-004",
    recipient_name: "Sana Rahman",
    recipient_email: "sana@work.net",
    status: "revoked",
    sent_at: "2026-10-08T12:00:00Z",
  },
];

const MOCK_MEMBERS: AccessMember[] = [
  {
    rsvp_id: "rsvp-001",
    user_id: "usr-001",
    name: "Layla Hassan",
    email: "layla@example.com",
    access_source: "invite_link",
    granted_at: "2026-10-13T10:00:00Z",
    rsvp_status: "confirmed",
  },
  {
    rsvp_id: "rsvp-002",
    user_id: "usr-002",
    name: "Omar Farooq",
    email: "omar@example.com",
    access_source: "direct_invite",
    granted_at: "2026-10-12T14:00:00Z",
    rsvp_status: "confirmed",
  },
  {
    rsvp_id: "rsvp-003",
    user_id: "usr-003",
    name: "Ibrahim Khan",
    email: "ibrahim@example.com",
    access_source: "approval",
    granted_at: "2026-10-11T09:00:00Z",
    rsvp_status: "confirmed",
  },
  {
    rsvp_id: "rsvp-004",
    user_id: "usr-004",
    name: "Aisha Karim",
    email: "aisha@example.com",
    access_source: "public",
    granted_at: "2026-10-10T16:00:00Z",
    rsvp_status: "pending",
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
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

const SOURCE_CFG: Record<string, { cls: string; label: string; icon: string }> = {
  invite_link:   { cls: "bg-primary-fixed text-on-primary-fixed-variant",   label: "Link Invite",  icon: "link" },
  direct_invite: { cls: "bg-secondary-container text-on-secondary-container", label: "Direct",     icon: "mail" },
  approval:      { cls: "bg-surface-container-high text-on-surface-variant", label: "Approved",    icon: "check_circle" },
  public:        { cls: "bg-surface-container text-on-surface-variant",       label: "Public",     icon: "public" },
};

const STATUS_CFG: Record<string, { cls: string; label: string }> = {
  pending:  { cls: "bg-secondary-container text-on-secondary-container", label: "Pending" },
  accepted: { cls: "bg-primary-fixed text-on-primary-fixed-variant",     label: "Accepted" },
  revoked:  { cls: "bg-error-container text-on-error-container",         label: "Revoked" },
  expired:  { cls: "bg-surface-container-high text-on-surface-variant",  label: "Expired" },
};

/* ─────────────────────────────────────────────────────────────────
   REVOKE CONFIRM MODAL
───────────────────────────────────────────────────────────────── */

function RevokeConfirmModal({
  name, isOpen, onConfirm, onCancel, isPending,
}: {
  name: string; isOpen: boolean;
  onConfirm: () => void; onCancel: () => void;
  isPending: boolean;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-6 shadow-2xl w-[320px]"
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-error text-[20px]">warning</span>
              </div>
              <div>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[15px] text-on-surface">
                  Revoke access for {name}?
                </h3>
                <p className="text-[12px] text-on-surface-variant mt-1">
                  They will lose access and their registration will be cancelled.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={onCancel}
                className="flex-1 py-2.5 rounded-full bg-surface-container text-on-surface text-[13px] font-semibold hover:bg-surface-container-high transition-colors">
                Cancel
              </button>
              <button onClick={onConfirm} disabled={isPending}
                className="flex-1 py-2.5 rounded-full bg-error text-on-error text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-1.5">
                {isPending
                  ? <span className="w-4 h-4 border-2 border-on-error/30 border-t-on-error rounded-full animate-spin" />
                  : "Yes, Revoke"}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TAB 1 — LINK INVITES
───────────────────────────────────────────────────────────────── */

function LinkInvitesTab({ eventId }: { eventId: string }) {
  const qc = useQueryClient();
  const { data } = useLinkInvites(eventId);
  const links: LinkInvite[] = data?.data ?? MOCK_LINKS;

  const [revoking, setRevoking]       = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<LinkInvite | null>(null);

  const handleGenerate = () => {
    toast.success("New invite link generated!");
    qc.invalidateQueries({ queryKey: ["link-invites", eventId] });
  };

  const handleRevoke = async () => {
    if (!confirmTarget) return;
    setRevoking(confirmTarget.link_id);
    await new Promise((r) => setTimeout(r, 600)); // simulate API
    toast.success(`"${confirmTarget.label}" link revoked.`);
    setRevoking(null);
    setConfirmTarget(null);
    qc.invalidateQueries({ queryKey: ["link-invites", eventId] });
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied!");
  };

  return (
    <>
      <div className="space-y-4">
        {/* Generate button */}
        <button onClick={handleGenerate}
          className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-3.5 rounded-full text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm">
          <span className="material-symbols-outlined text-[18px]">add_link</span>
          Generate Invite Link
        </button>

        {/* Link cards */}
        {links.map((link, i) => {
          const pct = link.max_uses ? Math.round((link.uses / link.max_uses) * 100) : 100;
          const revoked = link.status === "revoked" || link.status === "expired";
          return (
            <React.Fragment key={link.link_id}>
            <motion.article
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`relative bg-white rounded-2xl border border-outline/10 shadow-sm p-5 overflow-hidden ${
                revoked ? "opacity-60" : ""
              }`}
            >
              {/* Revoked stamp */}
              {revoked && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="border-4 border-error text-error text-[13px] font-extrabold px-5 py-2 rounded-lg opacity-30 -rotate-12 uppercase">
                    {link.status}
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[15px] text-on-surface">
                    {link.label}
                  </h3>
                  <p className="text-[11px] text-outline mt-0.5">
                    {revoked
                      ? `Revoked · ${timeAgo(link.created_at)}`
                      : `Created ${timeAgo(link.created_at)}${link.expires_at ? ` · Expires in 3 days` : ""}`}
                  </p>
                </div>
                <span className={`material-symbols-outlined text-[20px] ${revoked ? "text-error" : "text-primary"}`}>
                  {revoked ? "link_off" : "share"}
                </span>
              </div>

              {/* Progress */}
              {link.max_uses && (
                <div className="mb-4 space-y-1.5">
                  <div className="flex justify-between text-[11px] font-semibold text-outline">
                    <span>{link.uses}/{link.max_uses} uses</span>
                    <span className={revoked ? "text-error" : "text-primary"}>{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${revoked ? "bg-error/30" : "bg-primary"}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.7, delay: 0.2 + i * 0.1 }}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              {revoked ? (
                <button disabled
                  className="w-full py-2.5 bg-surface-container text-on-surface-variant rounded-full text-[13px] font-semibold cursor-not-allowed">
                  Link Inactive
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => handleCopy(link.url)}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-primary text-primary rounded-full text-[13px] font-semibold hover:bg-primary/5 transition-colors">
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    Copy Link
                  </button>
                  <button onClick={() => setConfirmTarget(link)}
                    className="px-4 py-2.5 border border-error/30 text-error rounded-full text-[13px] font-semibold hover:bg-error/5 transition-colors">
                    Revoke
                  </button>
                </div>
              )}
            </motion.article>
            </React.Fragment>
          );
        })}
      </div>

      <RevokeConfirmModal
        name={confirmTarget?.label ?? ""}
        isOpen={!!confirmTarget}
        onConfirm={handleRevoke}
        onCancel={() => setConfirmTarget(null)}
        isPending={revoking === confirmTarget?.link_id}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TAB 2 — DIRECT INVITES
───────────────────────────────────────────────────────────────── */

function DirectInvitesTab({ eventId }: { eventId: string }) {
  const qc = useQueryClient();
  const [search, setSearch]   = useState("");
  const [email, setEmail]     = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<DirectInviteRecord | null>(null);

  const { data } = useDirectInvites(eventId);
  const invites: DirectInviteRecord[] = data?.data ?? MOCK_DIRECT;

  const { data: searchData } = useSearchUsers(search, eventId);
  const { mutateAsync: sendInvite, isPending: sending } = useSendDirectInvite(eventId);
  const { mutateAsync: revokeInvite, isPending: revoking } = useRevokeInvite(eventId);

  const filtered = invites.filter((inv) =>
    !search ||
    inv.recipient_name.toLowerCase().includes(search.toLowerCase()) ||
    inv.recipient_email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = async () => {
    if (!email.trim()) { toast.error("Email is required."); return; }
    await sendInvite({ recipient_email: email, personal_message: message });
    toast.success(`Invite sent to ${email}!`);
    setEmail(""); setMessage(""); setShowForm(false);
    qc.invalidateQueries({ queryKey: ["direct-invites", eventId] });
  };

  const handleRevoke = async () => {
    if (!confirmTarget) return;
    await revokeInvite({ invite_id: confirmTarget.invite_id });
    toast.success(`Invite to ${confirmTarget.recipient_name} revoked.`);
    setConfirmTarget(null);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Send invite button */}
        <button onClick={() => setShowForm(!showForm)}
          className="w-full flex items-center justify-center gap-2 bg-primary text-on-primary py-3.5 rounded-full text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all shadow-sm">
          <span className="material-symbols-outlined text-[18px]">person_add</span>
          Send Direct Invite
        </button>

        {/* Send form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white rounded-2xl border border-outline/10 shadow-sm p-5 space-y-3"
            >
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[14px] text-primary">
                New Direct Invite
              </h3>
              <div>
                <label className="block text-[12px] font-bold text-on-surface mb-1.5">
                  Email Address <span className="text-error">*</span>
                </label>
                <input
                  type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. friend@example.com"
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline/20 rounded-xl text-[13px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-[12px] font-bold text-on-surface mb-1.5">
                  Personal Message (optional)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={2}
                  placeholder="Add a personal note..."
                  className="w-full px-4 py-2.5 bg-surface-container-low border border-outline/20 rounded-xl text-[13px] resize-none focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                />
              </div>
              <div className="flex gap-2">
                <button onClick={handleSend} disabled={sending}
                  className="flex-1 py-2.5 bg-primary text-on-primary rounded-full text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-1.5">
                  {sending
                    ? <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                    : <span className="material-symbols-outlined text-[16px]">send</span>}
                  {sending ? "Sending..." : "Send Invite"}
                </button>
                <button onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 bg-surface-container text-on-surface rounded-full text-[13px] font-semibold hover:bg-surface-container-high transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[18px]">
            search
          </span>
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-outline/15 rounded-full text-[13px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
          />
        </div>

        {/* Invite list */}
        <div className="bg-white rounded-2xl border border-outline/10 shadow-sm overflow-hidden divide-y divide-outline/5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-outline text-4xl block mb-2">mail</span>
              <p className="text-[13px] text-on-surface-variant font-semibold">No invites found</p>
            </div>
          ) : (
            filtered.map((inv, i) => {
              const st = STATUS_CFG[inv.status] ?? STATUS_CFG.pending;
              return (
                <motion.div key={inv.invite_id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-surface-container-low/30 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                    {inv.recipient_avatar
                      ? <img src={inv.recipient_avatar} className="w-full h-full object-cover rounded-full" />
                      : getInitials(inv.recipient_name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-on-surface truncate">{inv.recipient_name}</p>
                    <p className="text-[11px] text-outline truncate">{inv.recipient_email}</p>
                    <p className="text-[10px] text-outline/60 mt-0.5">Sent {timeAgo(inv.sent_at)}</p>
                  </div>

                  {/* Status + action */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${st.cls}`}>
                      {st.label}
                    </span>
                    {inv.status === "pending" && (
                      <button onClick={() => setConfirmTarget(inv)}
                        className="text-[11px] text-error font-bold hover:underline">
                        Revoke
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      <RevokeConfirmModal
        name={confirmTarget?.recipient_name ?? ""}
        isOpen={!!confirmTarget}
        onConfirm={handleRevoke}
        onCancel={() => setConfirmTarget(null)}
        isPending={revoking}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   TAB 3 — ACCESS MEMBERS
───────────────────────────────────────────────────────────────── */

function AccessMembersTab({ eventId }: { eventId: string }) {
  const qc = useQueryClient();
  const [search, setSearch]     = useState("");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [confirmTarget, setConfirmTarget] = useState<AccessMember | null>(null);

  const { data } = useAccessMembers(eventId);
  const members: AccessMember[] = data?.data ?? MOCK_MEMBERS;

  const { mutateAsync: revokeInvite, isPending: revoking } = useRevokeInvite(eventId);

  const SOURCES = [
    { id: "all",           label: "All" },
    { id: "invite_link",   label: "Link Invite" },
    { id: "direct_invite", label: "Direct" },
    { id: "approval",      label: "Approved" },
    { id: "public",        label: "Public" },
  ];

  const stats = {
    link:     members.filter((m) => m.access_source === "invite_link").length,
    direct:   members.filter((m) => m.access_source === "direct_invite").length,
    approval: members.filter((m) => m.access_source === "approval").length,
    public:   members.filter((m) => m.access_source === "public").length,
  };

  const filtered = members.filter((m) => {
    const matchSource = sourceFilter === "all" || m.access_source === sourceFilter;
    const matchSearch = !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase());
    return matchSource && matchSearch;
  });

  const handleRevoke = async () => {
    if (!confirmTarget) return;
    if (confirmTarget.invite_id) {
      await revokeInvite({ invite_id: confirmTarget.invite_id });
    }
    toast.success(`Access revoked for ${confirmTarget.name}.`);
    setConfirmTarget(null);
    qc.invalidateQueries({ queryKey: ["access-members", eventId] });
  };

  return (
    <>
      <div className="space-y-4">
        {/* Source count stats */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: `${stats.link} via Link`,     cls: "bg-primary-fixed/40 text-primary",                        icon: "link" },
            { label: `${stats.direct} Direct`,     cls: "bg-secondary-container/60 text-secondary",                icon: "mail" },
            { label: `${stats.approval} Approved`, cls: "bg-surface-container-high text-on-surface-variant",       icon: "check_circle" },
            { label: `${stats.public} Public`,     cls: "bg-surface-container text-on-surface-variant",            icon: "public" },
          ].map(({ label, cls, icon }) => (
            <span key={label} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-outline/10 ${cls}`}>
              <span className="material-symbols-outlined text-[13px]">{icon}</span>
              {label}
            </span>
          ))}
        </div>

        {/* Search + export */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[18px]">
              search
            </span>
            <input
              type="text" value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search members..."
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-outline/15 rounded-full text-[13px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-outline/15 rounded-full text-[13px] font-semibold text-on-surface hover:bg-surface-container-low transition-colors">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">download</span>
            Export
          </button>
        </div>

        {/* Source filter pills */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SOURCES.map((s) => (
            <button key={s.id} onClick={() => setSourceFilter(s.id)}
              className={`px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
                sourceFilter === s.id
                  ? "bg-primary text-on-primary shadow-sm"
                  : "bg-white border border-outline/15 text-on-surface-variant hover:bg-surface-container-low"
              }`}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Member list */}
        <div className="bg-white rounded-2xl border border-outline/10 shadow-sm overflow-hidden divide-y divide-outline/5">
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <span className="material-symbols-outlined text-outline text-4xl block mb-2">group</span>
              <p className="text-[13px] text-on-surface-variant font-semibold">No members found</p>
            </div>
          ) : (
            filtered.map((member, i) => {
              const src = SOURCE_CFG[member.access_source] ?? SOURCE_CFG.public;
              return (
                <motion.div key={member.rsvp_id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-surface-container-low/30 transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                    {member.avatar_url
                      ? <img src={member.avatar_url} className="w-full h-full object-cover rounded-full" />
                      : getInitials(member.name)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-bold text-on-surface truncate">{member.name}</p>
                    <p className="text-[11px] text-outline truncate">{member.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${src.cls}`}>
                        <span className="material-symbols-outlined text-[11px]">{src.icon}</span>
                        {src.label}
                      </span>
                      <span className="text-[10px] text-outline">
                        Since {timeAgo(member.granted_at)}
                      </span>
                    </div>
                  </div>

                  {/* Revoke button */}
                  <button onClick={() => setConfirmTarget(member)}
                    className="px-4 py-2 border border-error/25 text-error rounded-full text-[12px] font-semibold hover:bg-error/5 active:scale-95 transition-all shrink-0">
                    Revoke
                  </button>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      <RevokeConfirmModal
        name={confirmTarget?.name ?? ""}
        isOpen={!!confirmTarget}
        onConfirm={handleRevoke}
        onCancel={() => setConfirmTarget(null)}
        isPending={revoking}
      />
    </>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */

type Tab = "links" | "direct" | "members";

export default function AdminInvitesPage() {
  const { activeEvent } = useEventStore();
  const eventId = activeEvent?.event_id ?? "";
  const [tab, setTab] = useState<Tab>("links");

  // Stats for chips (from mock)
  const totalInvites  = MOCK_DIRECT.length + MOCK_LINKS.length;
  const totalAccepted = MOCK_DIRECT.filter((i) => i.status === "accepted").length + MOCK_MEMBERS.length;
  const totalPending  = MOCK_DIRECT.filter((i) => i.status === "pending").length;
  const totalRevoked  = MOCK_DIRECT.filter((i) => i.status === "revoked").length + MOCK_LINKS.filter((l) => l.status === "revoked").length;

  const TABS: { id: Tab; label: string }[] = [
    { id: "links",   label: "Link Invites" },
    { id: "direct",  label: "Direct Invites" },
    { id: "members", label: "Access Members" },
  ];

  return (
    <>
      <AdminTopBar
        breadcrumbs={[
          { label: "My Events", href: "/admin/events" },
          { label: "Invites" },
        ]}
      />

      <ActiveEventBanner pageName="invites" />

      {!activeEvent ? (
        <div className="flex flex-col items-center justify-center py-32 text-center px-6">
          <span className="material-symbols-outlined text-outline text-[48px] mb-4">mail</span>
          <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-on-surface mb-2">
            No event selected
          </h2>
          <p className="text-[13px] text-outline max-w-xs">
            Go to My Events and select an event to manage its invites and access members.
          </p>
        </div>
      ) : (
        <div className="px-6 pt-6 pb-16 max-w-[1200px] mx-auto">

          {/* ── Top header row ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3 flex-wrap">
              <nav className="flex items-center gap-1 text-[11px] text-outline">
                <span>{activeEvent.title}</span>
                <span className="material-symbols-outlined text-[13px]">chevron_right</span>
                <span className="text-primary font-bold">Invites</span>
              </nav>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-container text-[11px] font-bold">
                <span className="material-symbols-outlined text-[13px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}>
                  {activeEvent.visibility === "public" ? "public" : "lock"}
                </span>
                {activeEvent.visibility === "invite_only" ? "Invite Only"
                 : activeEvent.visibility === "approval_required" ? "Approval Required"
                 : activeEvent.visibility === "private" ? "Private"
                 : "Public"}
              </span>
            </div>

            {/* Stat chips */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 overflow-x-auto pb-1"
            >
              {[
                { label: "Total",    value: totalInvites,  cls: "bg-surface-container-high text-on-surface" },
                { label: "Accepted", value: totalAccepted, cls: "bg-primary-container text-on-primary-container" },
                { label: "Pending",  value: totalPending,  cls: "bg-secondary-container text-on-secondary-container" },
                { label: "Revoked",  value: totalRevoked,  cls: "bg-error-container text-on-error-container" },
              ].map(({ label, value, cls }) => (
                <div key={label}
                  className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold ${cls}`}>
                  <span className="font-bold text-[15px]">{value}</span>
                  <span className="opacity-80">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Two-column layout ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* LEFT — tabs + content (8 cols) */}
            <div className="lg:col-span-8 space-y-5">

              {/* Tab navigation */}
              <div className="flex border-b border-outline/10">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex-1 py-3 text-[13px] font-semibold border-b-2 transition-all ${
                      tab === t.id
                        ? "border-primary text-primary font-bold"
                        : "border-transparent text-on-surface-variant hover:text-primary"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                >
                  {tab === "links"   && <LinkInvitesTab   eventId={eventId} />}
                  {tab === "direct"  && <DirectInvitesTab  eventId={eventId} />}
                  {tab === "members" && <AccessMembersTab  eventId={eventId} />}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* RIGHT — event info + quick stats (4 cols) */}
            <aside className="lg:col-span-4 space-y-4 sticky top-6 self-start">

              {/* Event info card */}
              <motion.div
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-outline/10 shadow-sm p-5"
              >
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-3">
                  Event Overview
                </p>
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[15px] text-primary leading-snug mb-3">
                  {activeEvent.title}
                </h3>
                <div className="space-y-2">
                  {[
                    { icon: "calendar_today", label: new Date(activeEvent.start_time).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
                    { icon: "location_on",    label: activeEvent.location_name },
                    { icon: "group",          label: `${activeEvent.registered} registered${activeEvent.capacity ? ` / ${activeEvent.capacity} capacity` : ""}` },
                  ].map(({ icon, label }) => (
                    <p key={icon} className="flex items-center gap-2 text-[12px] text-on-surface-variant">
                      <span className="material-symbols-outlined text-[15px] text-outline shrink-0">{icon}</span>
                      <span className="truncate">{label}</span>
                    </p>
                  ))}
                </div>
              </motion.div>

              {/* Invite breakdown card */}
              <motion.div
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28 }}
                className="bg-white rounded-2xl border border-outline/10 shadow-sm p-5"
              >
                <p className="text-[10px] font-bold text-outline uppercase tracking-wider mb-3">
                  Invite Breakdown
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Link Invites",   value: MOCK_LINKS.length,                          icon: "link",        cls: "text-primary" },
                    { label: "Direct Invites", value: MOCK_DIRECT.length,                         icon: "mail",        cls: "text-secondary" },
                    { label: "Accepted",       value: MOCK_DIRECT.filter(i=>i.status==="accepted").length, icon: "check_circle", cls: "text-primary" },
                    { label: "Pending",        value: MOCK_DIRECT.filter(i=>i.status==="pending").length,  icon: "schedule",     cls: "text-secondary" },
                    { label: "Revoked",        value: MOCK_DIRECT.filter(i=>i.status==="revoked").length + MOCK_LINKS.filter(l=>l.status==="revoked").length, icon: "link_off", cls: "text-error" },
                  ].map(({ label, value, icon, cls }) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-[12px] text-on-surface-variant">
                        <span className={`material-symbols-outlined text-[15px] ${cls}`}>{icon}</span>
                        {label}
                      </span>
                      <span className="text-[13px] font-bold text-on-surface">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Quick tip */}
              <motion.div
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.36 }}
                className="bg-primary/5 border border-primary/10 rounded-2xl p-4"
              >
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">tips_and_updates</span>
                  <p className="text-[12px] text-on-surface-variant leading-relaxed">
                    <span className="font-bold text-primary">Tip:</span> Use Link Invites for sharing on social media, and Direct Invites for personal outreach to specific attendees.
                  </p>
                </div>
              </motion.div>
            </aside>
          </div>
        </div>
      )}
    </>
  );
}