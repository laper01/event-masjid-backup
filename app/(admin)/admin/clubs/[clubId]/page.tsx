"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import {
  useClubDetail,
  useClubPendingRequests,
  useApproveMember,
  useDenyMember,
  useUpdateClubSettings,
  useDeleteClub,
} from "@/hooks/useClubs";
import { formatDate } from "@/lib/utils";
import type {
  ClubDetailData,
  ClubMemberRequest,
  ClubSettings,
  ClubVisibility,
} from "@/types/clubs";

/* ─────────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────────── */

const MOCK_CLUB: ClubDetailData = {
  club_id: "club-001",
  name: "Mataram Brothers FC",
  description: "A community football club fostering sportsmanship and brotherhood in Mataram. Weekly matches, youth coaching, and monthly community events.",
  category: "Sports",
  visibility: "approval_required",
  city: "Mataram",
  country: "ID",
  member_count: 28,
  founded_at: "2024-01-01T00:00:00Z",
  cover_image_url: undefined,
  is_active: true,
  admin: { user_id: "u-admin", name: "Ahmad Dahlan", avatar_url: undefined, role: "Club Admin" },
  member_preview: [],
  upcoming_hangouts: [],
  caller_member_status: "active",
  is_admin: true,
};

interface ClubMember {
  user_id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role: "Club Admin" | "Member";
  status: "active";
  joined_at: string;
}

const MOCK_MEMBERS: ClubMember[] = [
  { user_id: "u-001", name: "Ahmad Dahlan",   email: "ahmad.dahlan@email.com",  role: "Club Admin", status: "active", joined_at: "2024-01-12T00:00:00Z" },
  { user_id: "u-002", name: "Siti Rahma",     email: "siti.rahma@email.com",    role: "Member",     status: "active", joined_at: "2024-01-15T00:00:00Z" },
  { user_id: "u-003", name: "Budi Santoso",   email: "budi.s@email.com",        role: "Member",     status: "active", joined_at: "2024-02-02T00:00:00Z" },
  { user_id: "u-004", name: "Dedi Kurniawan", email: "dedi.k@email.com",        role: "Member",     status: "active", joined_at: "2024-02-10T00:00:00Z" },
  { user_id: "u-005", name: "Rudi Hermawan",  email: "rudi.h@email.com",        role: "Member",     status: "active", joined_at: "2024-03-01T00:00:00Z" },
];

const MOCK_REQUESTS: ClubMemberRequest[] = [
  { request_id: "req-001", user_id: "u-r1", name: "Fadhil Rahman",  email: "fadhil@email.com", request_message: "I've been following Mataram Brothers since last season. I'm a striker looking to join the Sunday morning community sessions to stay fit and meet fellow fans.", requested_at: new Date(Date.now() - 2 * 864e5).toISOString(), previous_events_attended: 4 },
  { request_id: "req-002", user_id: "u-r2", name: "Siti Aminah",    email: "siti.a@email.com", request_message: "I am a certified physiotherapist and would love to help out with the team's medical needs during the league.", requested_at: new Date(Date.now() - 864e5).toISOString(), previous_events_attended: 0 },
  { request_id: "req-003", user_id: "u-r3", name: "Bambang Wijaya", email: "bambang.w@email.com", request_message: "Mataram FC represents the pride of our neighborhood. I want to contribute to the youth coaching program.", requested_at: new Date(Date.now() - 2 * 36e5).toISOString(), previous_events_attended: 1 },
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

/* ─────────────────────────────────────────────────────────────────
   MEMBERS TAB
───────────────────────────────────────────────────────────────── */

function MembersTab({ clubId }: { clubId: string }) {
  const [search, setSearch]     = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [removingId, setRemovingId] = useState<string | null>(null);

  const members = MOCK_MEMBERS;
  const filtered = members.filter(
    (m) =>
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((m) => m.user_id)));
  };

  const handleRemove = (userId: string) => {
    toast.success("Member removed.");
    setRemovingId(null);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="bg-white rounded-2xl border border-outline/10 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input
            type="text" value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members by name or email..."
            className="w-full pl-11 pr-4 py-2.5 bg-surface-container-low border-b border-outline/20 rounded-t-lg focus:border-primary focus:outline-none text-[13px] transition-all"
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-high text-on-surface-variant text-[12px] font-semibold hover:bg-outline-variant transition-colors">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filter
          </button>
          {selected.size > 0 && (
            <button
              onClick={() => { toast.success(`${selected.size} member(s) removed.`); setSelected(new Set()); }}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-error text-error text-[12px] font-semibold hover:bg-error-container transition-colors">
              <span className="material-symbols-outlined text-[18px]">group_remove</span>
              Remove Selected ({selected.size})
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-surface-container-low/60 border-b border-outline/10">
                <th className="px-5 py-3.5 w-12">
                  <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
                    onChange={toggleAll}
                    className="rounded border-outline text-primary focus:ring-primary" />
                </th>
                {["Member", "Role", "Status", "Joined Date", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3.5 text-left text-[11px] font-bold text-on-surface-variant uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5">
              {filtered.map((member, i) => (
                <motion.tr key={member.user_id}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => toggleSelect(member.user_id)}
                  className={`hover:bg-surface-container-low transition-colors cursor-pointer ${
                    selected.has(member.user_id) ? "bg-primary-fixed/10" : ""
                  }`}
                >
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(member.user_id)}
                      onChange={() => toggleSelect(member.user_id)}
                      className="rounded border-outline text-primary focus:ring-primary" />
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-fixed flex items-center justify-center text-[10px] font-bold text-primary shrink-0 overflow-hidden">
                        {member.avatar_url
                          ? <img src={member.avatar_url} className="w-full h-full object-cover" />
                          : getInitials(member.name)}
                      </div>
                      <div>
                        <p className="text-[13px] font-bold text-primary">{member.name}</p>
                        <p className="text-[11px] text-outline">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      member.role === "Club Admin"
                        ? "bg-primary-container text-on-primary-container"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="flex items-center gap-1.5 text-primary text-[12px] font-semibold">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      Active
                    </span>
                  </td>
                  <td className="px-5 py-4 text-[13px] text-on-surface-variant">
                    {new Date(member.joined_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-5 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                    {member.role !== "Club Admin" && (
                      <button onClick={() => handleRemove(member.user_id)}
                        className="text-error text-[12px] font-semibold hover:underline underline-offset-4">
                        Remove
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-3 border-t border-outline/10 bg-surface-container-low/20 flex items-center justify-between">
          <span className="text-[11px] text-outline">Showing 1–{filtered.length} of {members.length} members</span>
          <div className="flex items-center gap-1">
            <button disabled className="w-8 h-8 flex items-center justify-center rounded-full border border-outline/20 text-outline/30 cursor-not-allowed">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            {[1, 2, 3].map((p) => (
              <button key={p}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-[12px] font-bold ${
                  p === 1 ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container"
                }`}>
                {p}
              </button>
            ))}
            <button className="w-8 h-8 flex items-center justify-center rounded-full border border-outline/20 text-on-surface-variant hover:bg-surface-container transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PENDING REQUESTS TAB
───────────────────────────────────────────────────────────────── */

function PendingRequestsTab({ clubId }: { clubId: string }) {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [expandMode, setExpandMode]   = useState<"approve" | "deny" | null>(null);
  const [welcomeMsg, setWelcomeMsg]   = useState("");
  const [denyReason, setDenyReason]   = useState("Incomplete Profile");
  const [denyNote, setDenyNote]       = useState("");

  const { data } = useClubPendingRequests(clubId);
  const requests: ClubMemberRequest[] = data?.data ?? MOCK_REQUESTS;

  const { mutateAsync: approveMember, isPending: approving } = useApproveMember(clubId);
  const { mutateAsync: denyMember,    isPending: denying }   = useDenyMember(clubId);

  const filtered = requests.filter(
    (r) =>
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleExpand = (id: string, mode: "approve" | "deny") => {
    if (expandedId === id && expandMode === mode) {
      setExpandedId(null); setExpandMode(null);
    } else {
      setExpandedId(id); setExpandMode(mode);
      setWelcomeMsg(""); setDenyNote("");
    }
  };

  const handleApprove = async (req: ClubMemberRequest) => {
    await approveMember({ userId: req.user_id });
    toast.success(`${req.name} approved!`);
    qc.invalidateQueries({ queryKey: ["club-pending", clubId] });
    setExpandedId(null);
  };

  const handleDeny = async (req: ClubMemberRequest) => {
    await denyMember({ userId: req.user_id });
    toast.success(`${req.name} denied.`);
    qc.invalidateQueries({ queryKey: ["club-pending", clubId] });
    setExpandedId(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[18px] text-primary">
            Pending Requests
          </h2>
          <p className="text-[12px] text-outline mt-0.5">
            Manage membership applications for this club.
          </p>
        </div>
        <span className="bg-primary-container text-on-primary-container text-[12px] font-bold px-3 py-1 rounded-full">
          {filtered.length} New
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
        <input type="text" value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full pl-11 pr-4 py-2.5 bg-surface-container-low border-b border-outline/20 rounded-xl focus:border-primary focus:outline-none text-[13px] transition-all" />
      </div>

      {/* Request cards */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <span className="material-symbols-outlined text-outline text-[48px] block mb-3">check_circle</span>
          <p className="font-['Plus_Jakarta_Sans'] font-bold text-[16px] text-on-surface">All caught up!</p>
          <p className="text-[12px] text-outline mt-1">No pending requests.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((req, i) => {
            const isExpanded = expandedId === req.request_id;
            return (
              <motion.div key={req.request_id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl border border-outline/10 shadow-sm p-5 space-y-4"
              >
                {/* Applicant */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary-fixed flex items-center justify-center text-primary font-bold text-[14px] shrink-0">
                    {req.avatar_url
                      ? <img src={req.avatar_url} className="w-full h-full object-cover rounded-full" />
                      : getInitials(req.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-on-surface text-[14px]">{req.name}</h3>
                    <p className="text-[11px] text-outline">
                      {req.previous_events_attended > 0
                        ? `${req.previous_events_attended} mutual connections`
                        : "New member"} · {timeAgo(req.requested_at)}
                    </p>
                  </div>
                </div>

                {/* Message */}
                {req.request_message && (
                  <div className="bg-surface-container-low border-l-4 border-primary-fixed p-3 rounded-r-xl">
                    <p className="text-[12px] text-on-surface-variant italic leading-relaxed">
                      "{req.request_message}"
                    </p>
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={() => toggleExpand(req.request_id, "approve")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-[13px] font-bold transition-all ${
                      isExpanded && expandMode === "approve"
                        ? "bg-primary text-on-primary"
                        : "bg-primary text-on-primary hover:opacity-90 active:scale-95"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    Approve
                  </button>
                  <button
                    onClick={() => toggleExpand(req.request_id, "deny")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-[13px] font-semibold border transition-all ${
                      isExpanded && expandMode === "deny"
                        ? "border-error bg-error text-on-error"
                        : "border-outline/30 text-error hover:bg-error/5 active:scale-95"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    Deny
                  </button>
                </div>

                {/* Expanded: Approve flow */}
                <AnimatePresence>
                  {isExpanded && expandMode === "approve" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-outline/10 pt-4 space-y-3"
                    >
                      <label className="block text-[11px] font-bold text-primary uppercase tracking-wider">
                        Personal Welcome Message (Optional)
                      </label>
                      <textarea
                        value={welcomeMsg}
                        onChange={(e) => setWelcomeMsg(e.target.value)}
                        rows={2}
                        placeholder={`Welcome to the family, ${req.name.split(" ")[0]}!`}
                        className="w-full px-4 py-2.5 bg-surface-container-low border-b border-outline/20 rounded-t-lg text-[13px] focus:border-primary focus:outline-none resize-none transition-all"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setExpandedId(null)}
                          className="px-4 py-2 text-on-surface-variant text-[12px] font-semibold hover:text-on-surface transition-colors">
                          Cancel
                        </button>
                        <button onClick={() => handleApprove(req)} disabled={approving}
                          className="px-6 py-2 bg-primary-container text-on-primary-container rounded-full text-[12px] font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-60">
                          {approving ? "Approving..." : "Confirm Approval"}
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Expanded: Deny flow */}
                  {isExpanded && expandMode === "deny" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-outline/10 pt-4 space-y-3"
                    >
                      <label className="block text-[11px] font-bold text-error uppercase tracking-wider">
                        Reason for Rejection
                      </label>
                      <select value={denyReason} onChange={(e) => setDenyReason(e.target.value)}
                        className="w-full px-4 py-2.5 bg-surface-container-low border-b border-outline/20 rounded-t-lg text-[13px] focus:border-error focus:outline-none transition-all">
                        {["Incomplete Profile", "Outside Catchment Area", "Club Capacity Reached", "Other"].map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                      <textarea
                        value={denyNote}
                        onChange={(e) => setDenyNote(e.target.value)}
                        rows={2}
                        placeholder="Add specific feedback..."
                        className="w-full px-4 py-2.5 bg-surface-container-low border-b border-outline/20 rounded-t-lg text-[13px] focus:border-error focus:outline-none resize-none transition-all"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setExpandedId(null)}
                          className="px-4 py-2 text-on-surface-variant text-[12px] font-semibold hover:text-on-surface transition-colors">
                          Cancel
                        </button>
                        <button onClick={() => handleDeny(req)} disabled={denying}
                          className="px-6 py-2 bg-error text-on-error rounded-full text-[12px] font-bold hover:opacity-90 active:scale-95 transition-all disabled:opacity-60">
                          {denying ? "Denying..." : "Confirm Rejection"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}

          {/* Load more */}
          <button className="w-full py-3 text-primary text-[13px] font-semibold hover:bg-primary-fixed/20 rounded-full transition-colors">
            View All {requests.length} Requests
          </button>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SETTINGS TAB
───────────────────────────────────────────────────────────────── */

const VIS_OPTIONS: { id: ClubVisibility; icon: string; label: string; desc: string }[] = [
  { id: "public",            icon: "public",       label: "Public",            desc: "Anyone can find and join" },
  { id: "approval_required", icon: "how_to_reg",   label: "Approval Required", desc: "Members must be vetted" },
  { id: "private",           icon: "lock",         label: "Private",           desc: "Invite-only access" },
];

function SettingsTab({ club, clubId }: { club: ClubDetailData; clubId: string }) {
  const router = useRouter();
  const qc     = useQueryClient();
  const [form, setForm]                   = useState<Partial<ClubSettings>>({
    name: club.name, description: club.description, category: club.category,
    city: club.city, visibility: club.visibility, is_active: club.is_active,
  });
  const [showTransfer, setShowTransfer]   = useState(false);
  const [showDelete, setShowDelete]       = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [transferEmail, setTransferEmail] = useState("");

  const { mutateAsync: updateSettings, isPending: saving } = useUpdateClubSettings(clubId);
  const { mutateAsync: deleteClub, isPending: deleting }   = useDeleteClub(clubId);

  const set = (k: keyof ClubSettings, v: unknown) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    await updateSettings(form);
    toast.success("Club settings saved!");
    qc.invalidateQueries({ queryKey: ["club", clubId] });
  };

  const handleDelete = async () => {
    if (deleteConfirm !== "DELETE") { toast.error('Type "DELETE" to confirm.'); return; }
    await deleteClub();
    toast.success("Club deleted.");
    router.push("/admin/clubs");
  };

  return (
    <div className="max-w-2xl space-y-8">

      {/* Club Identity */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}>badge</span>
          <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[18px] text-primary">Club Identity</h2>
        </div>
        <div className="bg-white rounded-2xl border border-outline/10 shadow-sm p-5 space-y-5">
          <div>
            <label className="block text-[12px] font-bold text-on-surface-variant mb-1.5">Club Name</label>
            <div className="bg-surface-container-low border-b border-outline focus-within:border-primary transition-all rounded-t-lg">
              <input type="text" value={form.name ?? ""}
                onChange={(e) => set("name", e.target.value)}
                className="w-full bg-transparent border-none focus:ring-0 py-3 px-4 text-[14px] text-on-surface" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-bold text-on-surface-variant mb-1.5">Category</label>
              <div className="relative bg-surface-container-low border-b border-outline focus-within:border-primary transition-all rounded-t-lg">
                <select value={form.category ?? ""}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 py-3 px-4 text-[14px] text-on-surface appearance-none pr-8">
                  {["Sports", "Youth", "Education", "Community Outreach", "Arts", "Technology"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">expand_more</span>
              </div>
            </div>
            <div>
              <label className="block text-[12px] font-bold text-on-surface-variant mb-1.5">Location</label>
              <div className="bg-surface-container-low border-b border-outline focus-within:border-primary transition-all rounded-t-lg">
                <input type="text" value={form.city ?? ""}
                  onChange={(e) => set("city", e.target.value)}
                  placeholder="City, Country"
                  className="w-full bg-transparent border-none focus:ring-0 py-3 px-4 text-[14px] text-on-surface" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-[12px] font-bold text-on-surface-variant mb-1.5">Description</label>
            <div className="bg-surface-container-low border-b border-outline focus-within:border-primary transition-all rounded-t-lg">
              <textarea value={form.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
                rows={3} placeholder="Describe your club's mission..."
                className="w-full bg-transparent border-none focus:ring-0 py-3 px-4 text-[14px] text-on-surface resize-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Status & Visibility */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}>visibility</span>
          <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[18px] text-primary">Status & Visibility</h2>
        </div>
        <div className="bg-white rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
          {/* Active toggle */}
          <div className="p-5 flex items-start justify-between gap-4 border-b border-outline/10">
            <div>
              <p className="text-[13px] font-bold text-on-surface">Club Status</p>
              <p className="text-[12px] text-on-surface-variant mt-1 leading-relaxed">
                Deactivating hides the club from search. Existing members can still access the portal.
              </p>
            </div>
            <button type="button"
              onClick={() => set("is_active", !form.is_active)}
              className={`relative w-11 h-6 rounded-full transition-colors shrink-0 mt-0.5 ${
                form.is_active ? "bg-primary" : "bg-outline-variant"
              }`}>
              <motion.div
                className="absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-sm"
                animate={{ x: form.is_active ? 20 : 0 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            </button>
          </div>

          {/* Visibility options */}
          <div className="p-5">
            <label className="block text-[12px] font-bold text-on-surface-variant mb-3">Discovery Visibility</label>
            <div className="bg-surface-container-low rounded-xl p-1 space-y-0.5">
              {VIS_OPTIONS.map((opt) => (
                <button key={opt.id} type="button"
                  onClick={() => set("visibility", opt.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-all ${
                    form.visibility === opt.id
                      ? "bg-secondary-container/30 text-primary"
                      : "hover:bg-surface-container-high/50 text-on-surface-variant"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[20px]">{opt.icon}</span>
                    <div className="text-left">
                      <p className="text-[13px] font-bold">{opt.label}</p>
                      <p className="text-[10px] opacity-70">{opt.desc}</p>
                    </div>
                  </div>
                  {form.visibility === opt.id && (
                    <span className="material-symbols-outlined text-primary text-[20px]"
                      style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Admin Actions */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary-container text-[20px]"
            style={{ fontVariationSettings: "'FILL' 1" }}>admin_panel_settings</span>
          <h2 className="font-['Plus_Jakarta_Sans'] font-bold text-[18px] text-primary">Administrative Actions</h2>
        </div>
        <div className="space-y-3">
          <button onClick={() => setShowTransfer(true)}
            className="w-full flex items-center justify-between p-5 bg-white border border-outline/10 rounded-2xl hover:bg-surface-container transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                <span className="material-symbols-outlined text-[20px]">move_up</span>
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-on-surface">Transfer Ownership</p>
                <p className="text-[12px] text-on-surface-variant">Hand over admin rights to another member</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">chevron_right</span>
          </button>
          <button onClick={() => setShowDelete(true)}
            className="w-full flex items-center justify-between p-5 bg-white border border-error/20 rounded-2xl hover:bg-error-container/20 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-full bg-error-container flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[20px]">delete_forever</span>
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-error">Delete Club</p>
                <p className="text-[12px] text-on-surface-variant">Permanently remove all data and history</p>
              </div>
            </div>
            <span className="material-symbols-outlined text-error opacity-40">warning</span>
          </button>
        </div>
      </section>

      {/* Save bar */}
      <div className="fixed bottom-0 left-[240px] right-0 bg-white/80 backdrop-blur-md border-t border-outline/10 z-30 px-6 py-4">
        <div className="max-w-2xl mx-auto">
          <button onClick={handleSave} disabled={saving}
            className="w-full py-3.5 bg-primary text-on-primary rounded-full font-bold text-[13px] shadow-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[20px]">save</span>
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Transfer Ownership Modal */}
      <AnimatePresence>
        {showTransfer && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50"
              onClick={() => setShowTransfer(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-6 shadow-2xl w-[360px]"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[16px] text-primary">Transfer Ownership</h3>
                <button onClick={() => setShowTransfer(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-outline text-[20px]">close</span>
                </button>
              </div>
              <p className="text-[12px] text-on-surface-variant mb-4 leading-relaxed">
                Enter the email of the new admin. They must already be a member of this club.
              </p>
              <div className="bg-surface-container-low border-b border-outline focus-within:border-primary transition-all rounded-t-lg mb-4">
                <input type="email" value={transferEmail}
                  onChange={(e) => setTransferEmail(e.target.value)}
                  placeholder="admin@example.com"
                  className="w-full bg-transparent border-none focus:ring-0 py-3 px-4 text-[13px] text-on-surface" />
              </div>
              <div className="flex flex-col gap-2">
                <button className="w-full py-3 bg-primary text-on-primary rounded-full text-[13px] font-bold hover:opacity-90 active:scale-95 transition-all">
                  Send Transfer Request
                </button>
                <button onClick={() => setShowTransfer(false)}
                  className="w-full py-2.5 text-on-surface-variant text-[13px] font-semibold hover:text-on-surface transition-colors">
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {showDelete && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50"
              onClick={() => setShowDelete(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white rounded-2xl p-6 shadow-2xl w-[360px] border-2 border-error/10"
            >
              <div className="w-16 h-16 bg-error-container text-error rounded-full mx-auto flex items-center justify-center mb-4">
                <span className="material-symbols-outlined text-[32px]">warning</span>
              </div>
              <div className="text-center space-y-2 mb-5">
                <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[18px] text-error">Confirm Deletion</h3>
                <p className="text-[12px] text-on-surface-variant leading-relaxed">
                  This action is irreversible. All events, tickets, and member history for{" "}
                  <span className="font-bold text-on-surface">{club.name}</span> will be permanently deleted.
                </p>
              </div>
              <div className="space-y-2 mb-5">
                <p className="text-[10px] text-center text-outline uppercase tracking-widest font-bold">
                  Type "DELETE" to confirm
                </p>
                <div className="bg-error-container/10 border-b border-error focus-within:border-error rounded-t-lg">
                  <input type="text" value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value.toUpperCase())}
                    placeholder="..."
                    className="w-full bg-transparent border-none focus:ring-0 py-3 text-center font-bold text-error uppercase text-[14px]" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={handleDelete} disabled={deleting || deleteConfirm !== "DELETE"}
                  className="w-full py-3 bg-error text-on-error rounded-full text-[13px] font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-40">
                  {deleting ? "Deleting..." : "Delete Permanently"}
                </button>
                <button onClick={() => setShowDelete(false)}
                  className="w-full py-2.5 text-on-surface-variant text-[13px] font-semibold hover:text-on-surface transition-colors">
                  Keep My Club
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */

type Tab = "members" | "pending" | "hangouts" | "settings";

interface Props {
  params: Promise<{ clubId: string }>;
}

export default function AdminClubDetailPage({ params }: Props) {
  const { clubId } = React.use(params);
  const [tab, setTab] = useState<Tab>("members");

  const { data, isLoading } = useClubDetail(clubId);
  const club: ClubDetailData = data?.data ?? MOCK_CLUB;

  const pendingCount = MOCK_REQUESTS.length;

  const TABS: { id: Tab; label: string; badge?: number }[] = [
    { id: "members",  label: "Members" },
    { id: "pending",  label: "Pending Requests", badge: pendingCount },
    { id: "hangouts", label: "Hangouts" },
    { id: "settings", label: "Settings" },
  ];

  return (
    <>
      <AdminTopBar
        breadcrumbs={[
          { label: "Clubs", href: "/admin/clubs" },
          { label: club.name },
        ]}
        actions={
          <div className="flex gap-2">
            <button onClick={() => setTab("settings")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-outline text-on-surface-variant text-[12px] font-semibold hover:bg-surface-container-high transition-colors">
              <span className="material-symbols-outlined text-[18px]">settings</span>
              Club Settings
            </button>
            <button
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-error-container text-on-error-container text-[12px] font-semibold hover:opacity-80 transition-opacity">
              <span className="material-symbols-outlined text-[18px]">delete</span>
              Delete Club
            </button>
          </div>
        }
      />

      <div className="max-w-[1200px] mx-auto px-6 pt-6 pb-16">

        {/* ── Hero Banner ── */}
        <section className="mb-6">
          <div className="relative w-full h-[220px] rounded-2xl overflow-hidden shadow-sm mb-5">
            {club.cover_image_url ? (
              <img src={club.cover_image_url} className="w-full h-full object-cover" alt={club.name} />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary to-primary-fixed-dim" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent" />

            {/* Club info overlay */}
            <div className="absolute bottom-5 left-5 flex items-end gap-5">
              <div className="w-20 h-20 rounded-xl bg-white p-2 shadow-lg flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-[44px]"
                  style={{ fontVariationSettings: "'FILL' 1" }}>groups</span>
              </div>
              <div className="text-white pb-1">
                <h1 className="font-['Plus_Jakarta_Sans'] text-[22px] font-extrabold tracking-tight leading-snug">
                  {club.name}
                </h1>
                <div className="flex gap-4 mt-1 items-center flex-wrap">
                  <span className="bg-secondary-container text-on-secondary-container px-3 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[13px]">stadium</span>
                    {club.category}
                  </span>
                  <span className="flex items-center gap-1 text-white/90 text-[12px]">
                    <span className="material-symbols-outlined text-[14px]">group</span>
                    {club.member_count} Members
                  </span>
                  <span className="flex items-center gap-1 text-white/90 text-[12px]">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {club.city}, {club.country}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: "Active Members",    value: club.member_count, icon: "how_to_reg",   iconBg: "bg-primary-fixed",       iconCl: "text-primary-container", sub: "+2 this week" },
              { label: "Pending Requests",  value: pendingCount,      icon: "person_add",   iconBg: "bg-secondary-fixed",     iconCl: "text-on-secondary-fixed-variant", sub: "Awaiting review" },
              { label: "Removed",           value: 5,                 icon: "person_remove", iconBg: "bg-error-container",    iconCl: "text-error", sub: "Total since Jan 2024" },
            ].map(({ label, value, icon, iconBg, iconCl, sub }) => (
              <div key={label} className="bg-white rounded-2xl p-4 border border-outline/10 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wide">{label}</span>
                  <span className={`material-symbols-outlined ${iconCl} ${iconBg} p-1.5 rounded-lg text-[18px]`}>{icon}</span>
                </div>
                <div className="font-['Plus_Jakarta_Sans'] text-[26px] font-extrabold text-primary">{value}</div>
                <div className="text-[11px] text-outline mt-0.5">{sub}</div>
              </div>
            ))}
          </div>

          {/* Tab navigation */}
          <div className="flex border-b border-outline/10 overflow-x-auto">
            {TABS.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-6 py-3.5 text-[13px] font-semibold border-b-2 whitespace-nowrap transition-all ${
                  tab === t.id
                    ? "border-primary text-primary font-bold"
                    : "border-transparent text-on-surface-variant hover:text-primary"
                }`}>
                {t.label}
                {t.badge !== undefined && t.badge > 0 && (
                  <span className="bg-primary text-on-primary text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {t.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* ── Tab content ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
          >
            {tab === "members"  && <MembersTab clubId={clubId} />}
            {tab === "pending"  && <PendingRequestsTab clubId={clubId} />}
            {tab === "hangouts" && (
              <div className="py-20 text-center">
                <span className="material-symbols-outlined text-outline text-[48px] block mb-3">event</span>
                <p className="font-['Plus_Jakarta_Sans'] font-bold text-[16px] text-on-surface">Hangouts</p>
                <p className="text-[12px] text-outline mt-1">Club hangout management coming soon.</p>
              </div>
            )}
            {tab === "settings" && <SettingsTab club={club} clubId={clubId} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}