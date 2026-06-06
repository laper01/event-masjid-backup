"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AdminTopBar } from "@/components/nav/AdminTopBar";
import { useMyAdminClubs } from "@/hooks/useMyAdminClubs";
import type { AdminClubRow } from "@/hooks/useMyAdminClubs";

/* ─────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────── */

const VIS_CFG: Record<string, { icon: string; label: string; cls: string }> = {
  public:            { icon: "public",     label: "Public",            cls: "bg-primary-fixed text-on-primary-fixed-variant" },
  approval_required: { icon: "how_to_reg", label: "Approval Required", cls: "bg-secondary-container text-on-secondary-container" },
  private:           { icon: "lock",       label: "Private",           cls: "bg-surface-container-high text-on-surface-variant" },
};

const CAT_ICONS: Record<string, string> = {
  Sports: "sports_soccer", Youth: "child_care", Education: "school",
  Technology: "computer", "Community Outreach": "volunteer_activism",
  Arts: "palette", Default: "groups",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 864e5);
  const months = Math.floor(days / 30);
  if (days < 1)   return "today";
  if (days < 30)  return `${days}d ago`;
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

/* ─────────────────────────────────────────────────────────────────
   CLUB CARD
───────────────────────────────────────────────────────────────── */

function ClubCard({ club, onClick }: { club: AdminClubRow; onClick: () => void }) {
  const vis     = VIS_CFG[club.visibility] ?? VIS_CFG.public;
  const catIcon = CAT_ICONS[club.category] ?? CAT_ICONS.Default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md cursor-pointer overflow-hidden transition-shadow group ${
        !club.is_active ? "opacity-60" : "border-outline/10"
      }`}
    >
      {/* Cover / colour bar */}
      <div className="relative h-[100px] overflow-hidden">
        {club.cover_image_url ? (
          <img src={club.cover_image_url} className="w-full h-full object-cover" alt={club.name} />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary to-primary-fixed-dim" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/60 to-transparent" />

        {/* Inactive stamp */}
        {!club.is_active && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-surface-container/80 text-on-surface-variant text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Inactive
            </span>
          </div>
        )}

        {/* Pending badge */}
        {club.pending_requests > 0 && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 bg-error text-on-error text-[10px] font-bold px-2 py-0.5 rounded-full">
              <span className="material-symbols-outlined text-[12px]">schedule</span>
              {club.pending_requests} pending
            </span>
          </div>
        )}

        {/* Club icon */}
        <div className="absolute bottom-3 left-3 w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-primary text-[22px]"
            style={{ fontVariationSettings: "'FILL' 1" }}>{catIcon}</span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-[15px] text-primary leading-snug line-clamp-1">
              {club.name}
            </h3>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${vis.cls}`}>
              <span className="material-symbols-outlined text-[12px]">{vis.icon}</span>
              {vis.label}
            </span>
          </div>
          <p className="text-[12px] text-outline line-clamp-2 leading-relaxed">{club.description}</p>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-[11px] text-on-surface-variant flex-wrap">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">group</span>
            {club.member_count} members
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            {club.city}
          </span>
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">calendar_today</span>
            Founded {timeAgo(club.founded_at)}
          </span>
        </div>

        {/* Category chip */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] bg-surface-container text-on-surface-variant font-bold uppercase tracking-wider rounded-full px-2.5 py-0.5">
            {club.category}
          </span>
          <span className="text-[12px] text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            Manage
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   EMPTY STATE
───────────────────────────────────────────────────────────────── */

function EmptyState({ hasFilter }: { hasFilter: boolean }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-28 text-center"
    >
      <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-5">
        <span className="material-symbols-outlined text-outline text-[40px]">groups</span>
      </div>
      <h2 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-on-surface mb-2">
        {hasFilter ? "No clubs match your search" : "No clubs yet"}
      </h2>
      <p className="text-[13px] text-outline max-w-xs mb-6">
        {hasFilter
          ? "Try adjusting your search or filter."
          : "You haven't created or been assigned as admin of any clubs yet."}
      </p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────────────────────────── */

const CATEGORIES = ["All", "Sports", "Youth", "Education", "Technology", "Community Outreach", "Arts"];

export default function AdminClubsPage() {
  const router = useRouter();
  const [search, setSearch]   = useState("");
  const [catFilter, setCat]   = useState("All");
  const [statusFilter, setStat] = useState<"all" | "active" | "inactive">("all");
  const [view, setView]       = useState<"grid" | "list">("grid");

  const { data, isLoading } = useMyAdminClubs({
    search: search || undefined,
    category: catFilter !== "All" ? catFilter : undefined,
    status: statusFilter,
  });

  const clubs: AdminClubRow[] = data?.data ?? [];
  const total = data?.metadata?.total ?? 0;

  // Client-side filter for search (mock doesn't support it server-side)
  const filtered = clubs.filter((c) => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    const matchCat   = catFilter === "All" || c.category === catFilter;
    const matchStat  = statusFilter === "all" || (statusFilter === "active" ? c.is_active : !c.is_active);
    return matchSearch && matchCat && matchStat;
  });

  const totalMembers  = clubs.reduce((s, c) => s + c.member_count, 0);
  const totalPending  = clubs.reduce((s, c) => s + c.pending_requests, 0);
  const activeCount   = clubs.filter((c) => c.is_active).length;

  const hasFilter = !!search || catFilter !== "All" || statusFilter !== "all";

  return (
    <>
      <AdminTopBar
        breadcrumbs={[{ label: "Clubs" }]}
      />

      <div className="px-6 pt-6 pb-16 max-w-[1200px] mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-['Plus_Jakarta_Sans'] text-[22px] font-extrabold text-primary">
              My Clubs
            </h1>
            <p className="text-[12px] text-outline mt-0.5">
              {isLoading ? "Loading…" : `${total} club${total !== 1 ? "s" : ""} you manage`}
            </p>
          </div>
        </div>

        {/* ── Summary stats ── */}
        {!isLoading && clubs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {[
              { label: "Total Clubs",    value: clubs.length,  icon: "groups",       cls: "text-primary" },
              { label: "Active",         value: activeCount,   icon: "check_circle", cls: "text-primary" },
              { label: "Total Members",  value: totalMembers,  icon: "group",        cls: "text-secondary" },
              { label: "Pending Review", value: totalPending,  icon: "schedule",     cls: totalPending > 0 ? "text-error" : "text-outline" },
            ].map(({ label, value, icon, cls }) => (
              <div key={label} className="bg-white rounded-2xl border border-outline/10 shadow-sm p-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`material-symbols-outlined text-[18px] ${cls}`}>{icon}</span>
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wide">{label}</p>
                </div>
                <p className={`font-['Plus_Jakarta_Sans'] text-[24px] font-extrabold ${cls}`}>{value}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Search + filters ── */}
        <div className="space-y-3">
          {/* Search + view toggle */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-[20px]">
                search
              </span>
              <input
                type="text" value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search clubs by name, city, or description…"
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-outline/15 rounded-full text-[13px] focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
              {search && (
                <button onClick={() => setSearch("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              )}
            </div>
            {/* View toggle */}
            <div className="flex bg-surface-container rounded-full p-1 gap-0.5 shrink-0">
              {(["grid", "list"] as const).map((v) => (
                <button key={v} onClick={() => setView(v)}
                  className={`w-9 h-9 flex items-center justify-center rounded-full transition-all ${
                    view === v ? "bg-white text-primary shadow-sm" : "text-on-surface-variant"
                  }`}>
                  <span className="material-symbols-outlined text-[20px]">
                    {v === "grid" ? "grid_view" : "view_list"}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filter row */}
          <div className="flex flex-wrap gap-2 items-center">
            {/* Category pills */}
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setCat(cat)}
                  className={`px-4 py-1.5 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all ${
                    catFilter === cat
                      ? "bg-primary text-on-primary shadow-sm"
                      : "bg-white border border-outline/15 text-on-surface-variant hover:bg-surface-container-low"
                  }`}>
                  {cat}
                </button>
              ))}
            </div>

            {/* Status filter */}
            <div className="flex bg-surface-container p-1 rounded-full gap-0.5 ml-auto shrink-0">
              {(["all", "active", "inactive"] as const).map((s) => (
                <button key={s} onClick={() => setStat(s)}
                  className={`px-3 py-1 rounded-full text-[11px] font-semibold capitalize transition-all ${
                    statusFilter === s
                      ? "bg-white text-primary shadow-sm"
                      : "text-on-surface-variant"
                  }`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Active filter summary */}
          {hasFilter && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-[12px] text-on-surface-variant">
              <span>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
              <button onClick={() => { setSearch(""); setCat("All"); setStat("all"); }}
                className="flex items-center gap-1 text-primary font-semibold hover:underline">
                <span className="material-symbols-outlined text-[14px]">close</span>
                Clear filters
              </button>
            </motion.div>
          )}
        </div>

        {/* ── Club list ── */}
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className={view === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
                : "space-y-3"}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`bg-white rounded-2xl border border-outline/10 animate-pulse ${
                  view === "grid" ? "h-64" : "h-24"
                }`} />
              ))}
            </motion.div>
          ) : filtered.length === 0 ? (
            <EmptyState key="empty" hasFilter={hasFilter} />
          ) : view === "grid" ? (
            <motion.div key="grid"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filtered.map((club, i) => (
                <motion.div key={club.club_id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                >
                  <ClubCard
                    club={club}
                    onClick={() => router.push(`/admin/clubs/${club.club_id}`)}
                  />
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* List view */
            <motion.div key="list"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="bg-white rounded-2xl border border-outline/10 shadow-sm overflow-hidden"
            >
              <div className="divide-y divide-outline/5">
                {filtered.map((club, i) => {
                  const vis     = VIS_CFG[club.visibility] ?? VIS_CFG.public;
                  const catIcon = CAT_ICONS[club.category] ?? CAT_ICONS.Default;
                  return (
                    <motion.div key={club.club_id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => router.push(`/admin/clubs/${club.club_id}`)}
                      className={`flex items-center gap-4 px-5 py-4 hover:bg-surface-container-low/40 transition-colors cursor-pointer ${
                        !club.is_active ? "opacity-60" : ""
                      }`}
                    >
                      {/* Icon */}
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-primary text-[20px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}>{catIcon}</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[14px] font-bold text-primary truncate">{club.name}</p>
                          {!club.is_active && (
                            <span className="text-[10px] bg-surface-container text-outline px-2 py-0.5 rounded-full font-bold uppercase">
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-outline truncate">
                          {club.category} · {club.city} · Founded {timeAgo(club.founded_at)}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="hidden sm:flex items-center gap-5 text-[12px] text-on-surface-variant shrink-0">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[15px]">group</span>
                          {club.member_count}
                        </span>
                        {club.pending_requests > 0 && (
                          <span className="flex items-center gap-1 text-error font-bold">
                            <span className="material-symbols-outlined text-[15px]">schedule</span>
                            {club.pending_requests}
                          </span>
                        )}
                        <span className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${vis.cls}`}>
                          <span className="material-symbols-outlined text-[12px]">{vis.icon}</span>
                          {vis.label}
                        </span>
                      </div>

                      <span className="material-symbols-outlined text-outline text-[20px] shrink-0">
                        chevron_right
                      </span>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination footer */}
              <div className="px-5 py-3 border-t border-outline/10 bg-surface-container-low/20 flex items-center justify-between">
                <span className="text-[11px] text-outline">
                  Showing {filtered.length} of {total} clubs
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}