"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useEventStore } from "@/store/eventStore";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { ActiveEventBanner } from "@/components/admin/ActiveEventBanner";
import {
  useAttendanceAnalytics,
  useRevenueAnalytics,
  useVolunteerAnalytics,
  useRevertAnalytics,
} from "@/hooks/useAnalytics";
import type {
  AttendanceAnalytics,
  RevenueAnalytics,
  VolunteerAnalytics,
  RevertAnalytics,
} from "@/types/analytics";
import type { VolunteerRoleStats, RevertHostRecord } from "@/types/volunteers";

/* ─────────────────────────────────────────────────────────────────
   MOCK DATA
───────────────────────────────────────────────────────────────── */

const MOCK_ATTENDANCE: AttendanceAnalytics = {
  total_registered: 155,
  total_attended: 132,
  no_show_count: 23,
  attendance_rate: 85,
  waitlist_count: 5,
  cancellation_count: 8,
  daily_registrations: [
    { date: "09:00", count: 45 },
    { date: "09:30", count: 62 },
    { date: "10:00", count: 48 },
    { date: "10:30", count: 32 },
    { date: "11:00", count: 18 },
    { date: "11:30", count: 10 },
  ],
};

const MOCK_REVENUE: RevenueAnalytics = {
  total_revenue: 12450,
  total_tickets: 148,
  total_refunds: 850,
  net_revenue: 11600,
  currency: "USD",
  tier_breakdown: [
    { tier_name: "General Admission", tickets_sold: 112, revenue: 8960, refunded: 400, net_revenue: 8560 },
    { tier_name: "VIP",               tickets_sold: 20,  revenue: 3000, refunded: 450, net_revenue: 2550 },
  ],
  daily_revenue: [],
  promo_code_usage: 14,
  promo_discount: 350,
};

const MOCK_VOLUNTEER: VolunteerAnalytics = {
  total_volunteers: 12,
  total_applications: 18,
  total_badges_awarded: 10,
  pending_badges: 2,
  roles: [
    { role_id: "r1", role_name: "Registration Desk", badge_type: "Registration Desk", slots: 4, filled: 4, applied: 6, badges_awarded: 4, pending_badges: 0 },
    { role_id: "r2", role_name: "Food Service",      badge_type: "Food Service",       slots: 8, filled: 8, applied: 12, badges_awarded: 6, pending_badges: 2 },
  ],
};

const MOCK_REVERT: RevertAnalytics = {
  total_revert_registrations: 4,
  total_hosts: 5,
  matched_pairs: 3,
  unmatched_reverts: 1,
  unmatched_hosts: 2,
  hosts: [
    { host_id: "h1", host_name: "Sarah Ahmed",  journey_text: "I am looking for a community to connect with.", topics: [], contact_preference: "message", is_matched: true,  assigned_revert: "Host A" },
    { host_id: "h2", host_name: "Michael Chen", journey_text: "Interested in learning more about the community.", topics: [], contact_preference: "in_person", is_matched: false },
  ],
};

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */

function fmt(n: number, currency?: string) {
  if (currency) return `$${n.toLocaleString()}`;
  return n.toLocaleString();
}

function pct(n: number) {
  return `${Math.round(n)}%`;
}

/* ─────────────────────────────────────────────────────────────────
   SKELETON CARD
───────────────────────────────────────────────────────────────── */

function Skeleton({ h = "h-32" }: { h?: string }) {
  return <div className={`bg-surface-container rounded-2xl ${h} animate-pulse`} />;
}

/* ─────────────────────────────────────────────────────────────────
   STAT CARD
───────────────────────────────────────────────────────────────── */

function StatCard({
  label, value, sub, color = "text-primary",
}: {
  label: string; value: string | number; sub?: string; color?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-outline/10 shadow-sm p-5">
      <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wide mb-1">{label}</p>
      <p className={`font-['Plus_Jakarta_Sans'] text-[26px] font-extrabold ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-outline mt-0.5">{sub}</p>}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION HEADER
───────────────────────────────────────────────────────────────── */

function SectionTitle({ icon, title, badge }: { icon: string; title: string; badge?: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-[20px]">{icon}</span>
      </div>
      <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-[20px] text-primary">{title}</h2>
      {badge && (
        <span className="bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
          {badge}
        </span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   PROGRESS ROW
───────────────────────────────────────────────────────────────── */

function ProgressRow({ label, value, max, pctVal, color = "bg-primary" }: {
  label: string; value: string; max?: number; pctVal: number; color?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-[13px] font-semibold text-on-surface w-36 shrink-0">{label}</span>
      <div className="flex-1 bg-surface-container-high rounded-full h-2 overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pctVal}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <span className="text-[12px] font-bold text-on-surface-variant w-16 text-right shrink-0">{value}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   ARRIVAL BAR CHART
───────────────────────────────────────────────────────────────── */

function ArrivalChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1);
  const peakIdx = data.findIndex((d) => d.count === max);

  return (
    <div className="flex items-end justify-around gap-2 h-40 bg-surface-container-low rounded-2xl px-4 pt-6 pb-0">
      {data.map((d, i) => {
        const h = Math.round((d.count / max) * 100);
        const isPeak = i === peakIdx;
        return (
          <div key={d.date} className="flex flex-col items-center gap-1.5 flex-1 relative">
            {isPeak && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap bg-secondary/15 px-2 py-0.5 rounded text-[10px] text-secondary font-bold">
                Peak: {d.count}
              </div>
            )}
            <motion.div
              className={`w-full max-w-[32px] rounded-t-lg ${isPeak ? "bg-secondary" : "bg-primary"}`}
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              style={{ originY: 1, height: `${Math.max(h, 4)}%` }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            />
            <span className={`text-[10px] font-bold mb-1 ${isPeak ? "text-secondary" : "text-outline"}`}>
              {d.date}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION 1 — ATTENDANCE
───────────────────────────────────────────────────────────────── */

function AttendanceSection({ eventId }: { eventId: string }) {
  const { data, isLoading } = useAttendanceAnalytics(eventId);
  const d: AttendanceAnalytics = data?.data ?? MOCK_ATTENDANCE;

  if (isLoading) {
    return (
      <section className="space-y-4">
        <SectionTitle icon="group" title="Attendance Overview" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h="h-24" />)}
        </div>
        <div className="grid grid-cols-3 gap-4"><Skeleton h="h-64" /><Skeleton h="h-64" /><Skeleton h="h-64" /></div>
      </section>
    );
  }

  const rate = d.attendance_rate;

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <SectionTitle icon="group" title="Attendance Overview" />

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total RSVPs"     value={fmt(d.total_registered)} />
        <StatCard label="Checked In"      value={fmt(d.total_attended)}   color="text-green-700" />
        <StatCard label="No Show"         value={fmt(d.no_show_count)}    color="text-error" />
        <StatCard label="Attendance Rate" value={pct(rate)} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Donut */}
        <div className="bg-white rounded-2xl border border-outline/10 shadow-sm p-5">
          <p className="text-[12px] font-bold text-primary uppercase tracking-wide mb-4">Attendance Breakdown</p>
          <div className="relative w-36 h-36 mx-auto mb-4">
            {/* Background ring */}
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e8e8e8" strokeWidth="4" />
              <motion.circle cx="18" cy="18" r="15.9" fill="none"
                stroke="#002d1f" strokeWidth="4"
                strokeDasharray={`${rate} ${100 - rate}`}
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 100" }}
                animate={{ strokeDasharray: `${rate} ${100 - rate}` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[22px] text-primary">{pct(rate)}</span>
              <span className="text-[9px] text-outline uppercase font-bold tracking-wider">Checked In</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" />Checked In</span>
              <span className="font-bold">{d.total_attended} ({pct(rate)})</span>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-surface-container-high" />No Show</span>
              <span className="font-bold">{d.no_show_count} ({pct(100 - rate)})</span>
            </div>
            {d.waitlist_count > 0 && (
              <div className="flex items-center justify-between text-[12px]">
                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-secondary" />Waitlisted</span>
                <span className="font-bold">{d.waitlist_count}</span>
              </div>
            )}
          </div>
        </div>

        {/* Arrival timeline */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-outline/10 shadow-sm p-5">
          <p className="text-[12px] font-bold text-primary uppercase tracking-wide mb-4">Check-in Arrivals Over Time</p>
          <ArrivalChart data={d.daily_registrations} />
        </div>
      </div>
    </motion.section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION 2 — REVENUE
───────────────────────────────────────────────────────────────── */

function RevenueSection({ eventId }: { eventId: string }) {
  const { data, isLoading } = useRevenueAnalytics(eventId);
  const d: RevenueAnalytics = data?.data ?? MOCK_REVENUE;

  if (isLoading) {
    return (
      <section className="space-y-4">
        <SectionTitle icon="payments" title="Revenue Summary" />
        <div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} h="h-24" />)}</div>
        <Skeleton h="h-48" />
      </section>
    );
  }

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="flex items-center justify-between">
        <SectionTitle icon="payments" title="Revenue Summary" />
        <div className="bg-secondary-container px-5 py-3 rounded-2xl shrink-0">
          <p className="text-[10px] font-bold text-on-secondary-fixed uppercase tracking-wider">Net Revenue</p>
          <p className="font-['Plus_Jakarta_Sans'] font-extrabold text-[22px] text-primary">
            ${fmt(d.net_revenue)}
          </p>
        </div>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Total Collected"    value={`$${fmt(d.total_revenue)}`} />
        <StatCard label="Refunded"           value={`$${fmt(d.total_refunds)}`} color="text-error" />
        <StatCard label="Transactions"       value={fmt(d.total_tickets)} />
      </div>

      {/* Tier table */}
      <div className="bg-white rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-outline/10 bg-surface-container-low/40">
          <p className="text-[12px] font-bold text-primary uppercase tracking-wide">Revenue by Tier</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/60 border-b border-outline/10">
                {["Tier", "Tickets Sold", "Revenue", "Refunds", "Net"].map((h) => (
                  <th key={h} className={`px-5 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wide ${h === "Net" ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5">
              {d.tier_breakdown.map((tier, i) => (
                <tr key={tier.tier_name} className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="px-5 py-4 font-bold text-primary text-[13px]">{tier.tier_name}</td>
                  <td className="px-5 py-4 text-[13px] text-on-surface-variant">{tier.tickets_sold}</td>
                  <td className="px-5 py-4 text-[13px] text-on-surface-variant">${fmt(tier.revenue)}</td>
                  <td className="px-5 py-4 text-[13px] text-error">-${fmt(tier.refunded)}</td>
                  <td className="px-5 py-4 text-[13px] font-bold text-primary text-right">${fmt(tier.net_revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Promo code impact */}
      {d.promo_code_usage > 0 && (
        <div className="bg-white rounded-2xl border border-outline/10 shadow-sm p-5">
          <p className="text-[12px] font-bold text-primary uppercase tracking-wide flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
            Promo Code Impact
          </p>
          <div className="flex items-center justify-between bg-surface-container-low px-4 py-3 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="font-bold text-primary text-[13px]">Active Promo Codes</span>
              <span className="text-outline text-[12px]">·</span>
              <span className="text-[13px] font-semibold">{d.promo_code_usage} uses</span>
            </div>
            <div className="text-right">
              <p className="text-[12px] font-bold text-error">-${fmt(d.promo_discount)} Discounted</p>
              <p className="text-[10px] text-outline">Approx. ${fmt(d.promo_discount)} revenue offset</p>
            </div>
          </div>
        </div>
      )}
    </motion.section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION 3 — VOLUNTEER
───────────────────────────────────────────────────────────────── */

function VolunteerSection({ eventId }: { eventId: string }) {
  const { data, isLoading } = useVolunteerAnalytics(eventId);
  const d: VolunteerAnalytics = data?.data ?? MOCK_VOLUNTEER;

  if (isLoading) {
    return (
      <section className="space-y-4">
        <SectionTitle icon="volunteer_activism" title="Volunteer Summary" />
        <div className="grid grid-cols-4 gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} h="h-20" />)}</div>
        <Skeleton h="h-48" />
      </section>
    );
  }

  // Compute total checked-in from roles
  const totalCheckedIn = d.roles.reduce((s, r) => s + r.badges_awarded, 0);
  const checkInRate = d.total_volunteers > 0
    ? Math.round((totalCheckedIn / d.total_volunteers) * 100)
    : 0;
  const noShow = d.total_volunteers - totalCheckedIn;

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <SectionTitle icon="volunteer_activism" title="Volunteer Summary" />

      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-outline/10 rounded-2xl overflow-hidden border border-outline/10 shadow-sm">
        {[
          { label: "Assigned",          value: d.total_volunteers,      color: "text-primary" },
          { label: `Checked In (${pct(checkInRate)})`, value: totalCheckedIn, color: "text-green-700" },
          { label: "No-show",           value: noShow,                  color: "text-error" },
          { label: "Badges Awarded",    value: d.total_badges_awarded,  color: "text-primary" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white px-5 py-4 text-center">
            <p className={`font-['Plus_Jakarta_Sans'] font-extrabold text-[26px] ${color}`}>{value}</p>
            <p className="text-[11px] text-on-surface-variant font-medium mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="bg-white rounded-2xl border border-outline/10 shadow-sm p-5 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[12px] font-bold text-primary uppercase tracking-wide">Overall Attendance Rate</p>
          <span className="font-bold text-primary text-[14px]">{pct(checkInRate)}</span>
        </div>
        <div className="w-full bg-surface-container-high rounded-full h-3 overflow-hidden">
          <motion.div
            className="bg-primary h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${checkInRate}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {/* Role table */}
      <div className="bg-white rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-outline/10 bg-surface-container-low/40">
          <p className="text-[12px] font-bold text-primary uppercase tracking-wide">Roles Breakdown</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/60 border-b border-outline/10">
                {["Role Name", "Slots", "Filled", "Checked In", "Badges"].map((h) => (
                  <th key={h} className={`px-5 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wide ${h === "Badges" ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5">
              {d.roles.map((role) => {
                const roleRate = role.filled > 0 ? Math.round((role.badges_awarded / role.filled) * 100) : 0;
                return (
                  <tr key={role.role_id} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-5 py-4 font-bold text-primary text-[13px]">{role.role_name}</td>
                    <td className="px-5 py-4 text-[13px] text-on-surface-variant">{role.slots}</td>
                    <td className="px-5 py-4 text-[13px] text-on-surface-variant">{role.filled}</td>
                    <td className="px-5 py-4 text-[13px]">
                      <span className={roleRate === 100 ? "text-green-700 font-bold" : roleRate < 80 ? "text-error font-semibold" : "text-on-surface"}>
                        {role.badges_awarded} ({pct(roleRate)})
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="material-symbols-outlined text-primary text-[20px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}>award_star</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Badge job status */}
      <div className="flex items-center gap-3 bg-surface-container rounded-xl p-4 border border-outline/10">
        <span className="material-symbols-outlined text-secondary text-[20px]">schedule</span>
        <p className="text-[12px] text-on-surface-variant flex-1">
          Badge award job ran — <span className="font-bold text-on-surface">{d.total_badges_awarded} badges awarded</span>
          {d.pending_badges > 0 && (
            <span className="ml-2 text-error font-semibold">{d.pending_badges} pending</span>
          )}
        </p>
        <span className="material-symbols-outlined text-green-700 text-[20px]"
          style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      </div>
    </motion.section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   SECTION 4 — REVERT PROGRAM
───────────────────────────────────────────────────────────────── */

function RevertSection({ eventId }: { eventId: string }) {
  const { data, isLoading } = useRevertAnalytics(eventId);
  const d: RevertAnalytics = data?.data ?? MOCK_REVERT;
  const [hosts, setHosts] = useState<RevertHostRecord[]>(d.hosts ?? []);

  // Sync when real data loads
  React.useEffect(() => {
    if (data?.data?.hosts) setHosts(data.data.hosts);
  }, [data]);

  const toggleMatch = (hostId: string) => {
    setHosts((prev) =>
      prev.map((h) =>
        h.host_id === hostId ? { ...h, is_matched: !h.is_matched } : h
      )
    );
    toast.success("Assignment updated.");
  };

  if (isLoading) {
    return (
      <section className="space-y-4">
        <SectionTitle icon="volunteer_activism" title="Revert Program" badge="Active" />
        <div className="grid grid-cols-3 gap-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} h="h-24" />)}</div>
        <Skeleton h="h-48" />
      </section>
    );
  }

  return (
    <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <SectionTitle icon="volunteer_activism" title="Revert Program" badge="Active" />

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "New Muslims Registered", value: d.total_revert_registrations, icon: "person_add",   border: "border-primary",    color: "text-primary" },
          { label: "Hosts Matched",           value: d.matched_pairs,              icon: "diversity_3",  border: "border-green-600",  color: "text-green-700" },
          { label: "Unmatched (Follow-up)",   value: d.unmatched_reverts,          icon: "warning",      border: "border-error",      color: "text-error" },
        ].map(({ label, value, icon, border, color }) => (
          <div key={label} className={`bg-white rounded-2xl border-l-4 ${border} border border-outline/10 shadow-sm p-5 flex items-center gap-4`}>
            <div className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0">
              <span className={`material-symbols-outlined ${color} text-[22px]`}>{icon}</span>
            </div>
            <div>
              <p className={`font-['Plus_Jakarta_Sans'] font-extrabold text-[22px] ${color}`}>{value}</p>
              <p className="text-[11px] text-on-surface-variant font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Host table */}
      <div className="bg-white rounded-2xl border border-outline/10 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-outline/10 bg-surface-container-low/40">
          <p className="text-[12px] font-bold text-primary uppercase tracking-wide">Registrant Details</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low/60 border-b border-outline/10">
                {["Name", "Message", "Language", "Host Assigned", "Action"].map((h) => (
                  <th key={h} className={`px-5 py-3 text-[11px] font-bold text-on-surface-variant uppercase tracking-wide ${h === "Action" ? "text-right" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-outline/5">
              {(hosts ?? []).map((host) => (
                <tr key={host.host_id} className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="px-5 py-4 font-bold text-primary text-[13px]">{host.host_name}</td>
                  <td className="px-5 py-4 text-[12px] text-on-surface-variant max-w-[200px] truncate">
                    {host.journey_text}
                  </td>
                  <td className="px-5 py-4">
                    <span className="bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {host.contact_preference === "message" ? "Message" :
                       host.contact_preference === "in_person" ? "In Person" : "Either"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => toggleMatch(host.host_id)}
                      className={`flex items-center gap-2 text-[12px] font-semibold transition-colors ${
                        host.is_matched ? "text-green-700" : "text-outline hover:text-primary"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]"
                        style={{ fontVariationSettings: host.is_matched ? "'FILL' 1" : "'FILL' 0" }}>
                        {host.is_matched ? "check_circle" : "radio_button_unchecked"}
                      </span>
                      {host.is_matched ? "Assigned" : "Mark Assigned"}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button className="text-[12px] font-bold text-primary underline underline-offset-2 hover:opacity-70 transition-opacity">
                      {host.is_matched ? "Details" : "Follow Up"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 bg-surface-container-low/30 border-t border-outline/10">
          <p className="text-[11px] text-outline italic">
            host_assigned is manually toggled by the organizer to confirm internal matching workflows.
          </p>
        </div>
      </div>
    </motion.section>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */

export default function AdminAnalyticsPage() {
  const { activeEvent } = useEventStore();
  const eventId = activeEvent?.event_id ?? "";

  return (
    <>
      <AdminTopBar
        breadcrumbs={[{ label: "Analytics" }]}
        actions={
          <div className="flex gap-2">
            <button
              onClick={() => toast.success("Report exported!")}
              className="flex items-center gap-2 bg-primary text-on-primary rounded-full px-5 py-2 text-[12px] font-bold hover:opacity-90 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export Report
            </button>
            <button
              onClick={() => toast("Auto-report scheduled.")}
              className="flex items-center gap-2 border border-outline/30 text-primary rounded-full px-5 py-2 text-[12px] font-semibold hover:bg-surface-container transition-colors">
              Schedule Auto-Report
            </button>
          </div>
        }
      />

      <ActiveEventBanner pageName="analytics" />

      {!activeEvent ? (
        <div className="flex flex-col items-center justify-center py-32 text-center px-6">
          <span className="material-symbols-outlined text-outline text-[48px] mb-4">analytics</span>
          <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-on-surface mb-2">
            No event selected
          </h2>
          <p className="text-[13px] text-outline max-w-xs">
            Go to My Events and select an event to view its analytics report.
          </p>
        </div>
      ) : (
        <div className="px-6 pt-6 pb-20 max-w-[1200px] mx-auto space-y-12">

          {/* Event context chip */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white border border-outline/15 rounded-full px-4 py-2 shadow-sm">
              <span className="material-symbols-outlined text-primary text-[18px]">event</span>
              <span className="text-[13px] font-semibold text-on-surface">{activeEvent.title}</span>
              <span className="text-outline text-[12px]">·</span>
              <span className="text-[12px] text-outline">
                {new Date(activeEvent.start_time).toLocaleDateString("en-US", {
                  month: "long", day: "numeric", year: "numeric",
                })}
              </span>
            </div>
          </div>

          <AttendanceSection eventId={eventId} />
          <RevenueSection   eventId={eventId} />
          <VolunteerSection eventId={eventId} />
          <RevertSection    eventId={eventId} />
        </div>
      )}
    </>
  );
}