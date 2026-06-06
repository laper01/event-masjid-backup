"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { getInitials } from "@/lib/utils";
import { useEventStore } from "@/store/eventStore";

/* ─────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────── */

interface NavItem {
  id: string;
  icon: string;
  label: string;
  href: string;
  matchPrefixes: string[];
}

interface SubNavItem {
  id: string;
  icon: string;
  label: string;
  eventPath: string;       // appended after /admin/events/[id]/
  matchPrefix: string;     // regex string
}

/* ─────────────────────────────────────────────────────────────────
   NAV CONFIG
───────────────────────────────────────────────────────────────── */

const TOP_NAV: NavItem[] = [
  {
    id: "dashboard",
    icon: "dashboard",
    label: "Dashboard",
    href: "/admin/dashboard",
    matchPrefixes: ["/admin/dashboard"],
  },
  {
    id: "events",
    icon: "event",
    label: "My Events",
    href: "/admin/events",
    matchPrefixes: ["/admin/events"],
  },
  {
    id: "clubs",
    icon: "groups",
    label: "Clubs",
    href: "/admin/clubs",
    matchPrefixes: ["/admin/clubs"],
  },
  {
    id: "analytics",
    icon: "analytics",
    label: "Analytics",
    href: "/admin/analytics",
    matchPrefixes: ["/admin/analytics"],
  },
  {
    id: "settings",
    icon: "settings",
    label: "Settings",
    href: "/admin/settings",
    matchPrefixes: ["/admin/settings"],
  },
];

// Sub-items shown under "My Events" when an event is active
const EVENT_SUB_NAV: SubNavItem[] = [
  { id: "tickets",    icon: "local_activity",  label: "Tickets",    eventPath: "tickets",    matchPrefix: "/admin/events/[^/]+/tickets" },
  { id: "invites",    icon: "mail",            label: "Invites",    eventPath: "invites",    matchPrefix: "/admin/events/[^/]+/invites" },
  { id: "checkin",    icon: "qr_code_scanner", label: "Check-in",   eventPath: "checkin",    matchPrefix: "/admin/events/[^/]+/checkin" },
  { id: "volunteers", icon: "people",          label: "Volunteers", eventPath: "volunteers", matchPrefix: "/admin/events/[^/]+/volunteers" },
];

/* ─────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────── */

interface AdminSidebarProps {
  pendingApprovals?: number;
}

export function AdminSidebar({ pendingApprovals = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { activeEvent, clearActiveEvent } = useEventStore();
  const [collapsed, setCollapsed] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const userName     = session?.user?.name ?? "Organizer";
  const userInitials = getInitials(userName);

  /* ── Active state helpers ── */
  const isTopActive = (item: NavItem): boolean => {
    // "My Events" is active if on /admin/events OR any sub-route
    if (item.id === "events") {
      return pathname.startsWith("/admin/events");
    }
    return item.matchPrefixes.some((p) =>
      new RegExp("^" + p + "(/|$)").test(pathname)
    );
  };

  const isSubActive = (sub: SubNavItem): boolean =>
    new RegExp("^" + sub.matchPrefix + "(/|$)").test(pathname);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    signOut({ callbackUrl: "/login" });
  };

  /* Whether any sub-route is currently active */
  const onSubRoute = EVENT_SUB_NAV.some((s) => isSubActive(s));

  return (
    <>
      {/* ══ Desktop sidebar ══════════════════════════════════════ */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-surface-container-low border-r border-outline/10 z-40 overflow-hidden"
      >
        {/* ── Logo row ── */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-outline/10 shrink-0 min-h-[65px]">
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-2 overflow-hidden"
              >
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-on-primary text-[15px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                    mosque
                  </span>
                </div>
                <span className="font-bold text-primary text-[13px] leading-tight whitespace-nowrap">
                  Events.<span className="text-secondary">Masjids</span>.io
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors shrink-0 ml-auto"
          >
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">
              {collapsed ? "chevron_right" : "chevron_left"}
            </span>
          </button>
        </div>

        {/* ── Nav ── */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5">
          {TOP_NAV.map((item) => {
            const active     = isTopActive(item);
            const isEvents   = item.id === "events";
            const showBadge  = item.id === "dashboard" && pendingApprovals > 0;
            const showSub    = isEvents && !!activeEvent && !collapsed;

            return (
              <div key={item.id}>
                {/* Main nav item */}
                <Link
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                    active && !onSubRoute && !isEvents
                      ? "bg-primary-fixed text-primary"
                      : active && isEvents
                      ? "text-primary"
                      : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
                  }`}
                >
                  <span
                    className={`material-symbols-outlined text-[20px] shrink-0 ${
                      active ? "text-primary" : "text-on-surface-variant group-hover:text-primary"
                    }`}
                    style={active && !isEvents ? { fontVariationSettings: "'FILL' 1, 'wght' 600" } : {}}
                  >
                    {item.icon}
                  </span>

                  <AnimatePresence>
                    {!collapsed && (
                      <motion.span
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`text-[13px] whitespace-nowrap flex-1 ${active ? "font-bold" : "font-semibold"}`}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>

                  {/* Active indicator — only for non-events items */}
                  {active && !isEvents && !onSubRoute && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full" />
                  )}

                  {/* Badge */}
                  {showBadge && (
                    <span className={`flex items-center justify-center rounded-full text-[10px] font-bold bg-error text-on-error min-w-[18px] h-[18px] px-1 ${
                      collapsed ? "absolute top-1 right-1" : "ml-auto"
                    }`}>
                      {pendingApprovals > 99 ? "99+" : pendingApprovals}
                    </span>
                  )}

                  {/* Chevron for events when expanded */}
                  {isEvents && !collapsed && activeEvent && (
                    <span className="material-symbols-outlined text-[16px] text-outline ml-auto">
                      expand_more
                    </span>
                  )}

                  {/* Tooltip */}
                  {collapsed && (
                    <span className="absolute left-full ml-3 bg-on-surface text-surface text-[11px] font-semibold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 shadow-lg">
                      {item.label}
                    </span>
                  )}
                </Link>

                {/* ── Active event context + sub-menu ── */}
                <AnimatePresence>
                  {showSub && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      {/* Active event chip */}
                      <div className="mx-3 mt-1 mb-1 px-3 py-2 bg-primary/5 border border-primary/10 rounded-xl">
                        <p className="text-[9px] font-bold text-outline uppercase tracking-widest mb-0.5">
                          Managing
                        </p>
                        <p className="text-[11px] font-bold text-primary leading-snug truncate">
                          {activeEvent.title}
                        </p>
                        <button
                          onClick={(e) => { e.preventDefault(); clearActiveEvent(); }}
                          className="text-[9px] text-outline hover:text-error transition-colors mt-0.5 font-semibold"
                        >
                          Clear selection
                        </button>
                      </div>

                      {/* Sub items */}
                      <div className="ml-3 pl-3 border-l-2 border-primary/15 space-y-0.5 pb-1">
                        {EVENT_SUB_NAV.map((sub) => {
                          const subActive = isSubActive(sub);
                          const href = `/admin/events/${activeEvent.event_id}/${sub.eventPath}`;
                          return (
                            <Link
                              key={sub.id}
                              href={href}
                              className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all group relative ${
                                subActive
                                  ? "bg-primary-fixed text-primary"
                                  : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
                              }`}
                            >
                              <span
                                className={`material-symbols-outlined text-[18px] shrink-0 ${
                                  subActive ? "text-primary" : "text-on-surface-variant group-hover:text-primary"
                                }`}
                                style={subActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                              >
                                {sub.icon}
                              </span>
                              <span className={`text-[12px] whitespace-nowrap ${subActive ? "font-bold" : "font-semibold"}`}>
                                {sub.label}
                              </span>
                              {subActive && (
                                <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-l-full" />
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Collapsed state: show sub icons under event icon when active */}
                {isEvents && collapsed && activeEvent && (
                  <div className="mt-0.5 space-y-0.5">
                    {EVENT_SUB_NAV.map((sub) => {
                      const subActive = isSubActive(sub);
                      const href = `/admin/events/${activeEvent.event_id}/${sub.eventPath}`;
                      return (
                        <Link
                          key={sub.id}
                          href={href}
                          title={sub.label}
                          className={`flex items-center justify-center w-10 h-10 mx-auto rounded-xl transition-all group relative ${
                            subActive
                              ? "bg-primary-fixed text-primary"
                              : "text-on-surface-variant hover:bg-surface-container"
                          }`}
                        >
                          <span
                            className={`material-symbols-outlined text-[18px] ${subActive ? "text-primary" : "text-on-surface-variant"}`}
                            style={subActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                          >
                            {sub.icon}
                          </span>
                          {/* Tooltip */}
                          <span className="absolute left-full ml-3 bg-on-surface text-surface text-[11px] font-semibold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 shadow-lg">
                            {sub.label}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* ── User footer ── */}
        <div className="border-t border-outline/10 p-3 shrink-0">
          {!collapsed ? (
            <div className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-surface-container transition-colors">
              <div className="w-9 h-9 rounded-full bg-primary text-on-primary text-sm font-bold flex items-center justify-center shrink-0 overflow-hidden">
                {session?.user?.image
                  ? <img src={session.user.image} alt={userName} className="w-full h-full object-cover" />
                  : userInitials}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-bold text-primary text-[13px] truncate">{userName}</p>
                <span className="bg-primary-fixed text-on-primary-fixed-variant text-[10px] font-bold rounded-full px-2 py-0.5">
                  Organizer
                </span>
              </div>
              <button
                onClick={() => setLogoutConfirm(true)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-error/10 transition-colors"
              >
                <span className="material-symbols-outlined text-outline hover:text-error text-[20px] transition-colors">
                  logout
                </span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => setLogoutConfirm(true)}
              className="w-10 h-10 mx-auto flex items-center justify-center rounded-xl hover:bg-surface-container transition-colors"
              title="Sign out"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[22px]">logout</span>
            </button>
          )}
        </div>
      </motion.aside>

      {/* ══ Logout confirm ══════════════════════════════════════ */}
      <AnimatePresence>
        {logoutConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-on-surface/30 backdrop-blur-sm z-[60]"
              onClick={() => setLogoutConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] bg-white rounded-2xl p-6 shadow-2xl w-80 text-center"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-3xl block mb-3">logout</span>
              <h3 className="font-bold text-primary mb-1 font-['Plus_Jakarta_Sans']">Sign out?</h3>
              <p className="text-on-surface-variant text-sm mb-5">You will be redirected to the login page.</p>
              <div className="flex gap-3">
                <button onClick={() => setLogoutConfirm(false)}
                  className="flex-1 py-2.5 rounded-full bg-surface-container text-on-surface font-bold text-sm">
                  Cancel
                </button>
                <button onClick={handleLogout}
                  className="flex-1 py-2.5 rounded-full bg-error text-on-error font-bold text-sm">
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default AdminSidebar;