"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { getInitials } from "@/lib/utils";
import { useEventStore } from "@/store/eventStore";

/* ─────────────────────────────────────────────────────────────────
   NAV ITEMS
   Items that need eventId are marked requiresEvent: true.
   Their href is built dynamically from the active event in the store.
───────────────────────────────────────────────────────────────── */

interface SidebarNavItem {
  id: string;
  icon: string;
  label: string;
  /** Static href (no event context needed) */
  href?: string;
  /** Path segment appended after /admin/events/[eventId]/ */
  eventPath?: string;
  matchPrefixes?: string[];
  requiresEvent?: boolean;
}

const NAV_ITEMS: SidebarNavItem[] = [
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
    id: "tickets",
    icon: "local_activity",
    label: "Tickets",
    eventPath: "tickets",
    matchPrefixes: ["/admin/events/[^/]+/tickets"],
    requiresEvent: true,
  },
  {
    id: "checkin",
    icon: "qr_code",
    label: "Check-in",
    eventPath: "checkin",
    matchPrefixes: ["/admin/events/[^/]+/checkin", "/admin/events/[^/]+/scanner"],
    requiresEvent: true,
  },
  {
    id: "volunteers",
    icon: "people",
    label: "Volunteers",
    eventPath: "volunteers",
    matchPrefixes: ["/admin/events/[^/]+/volunteers"],
    requiresEvent: true,
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

interface AdminSidebarProps {
  pendingApprovals?: number;
}

export function AdminSidebar({ pendingApprovals = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { activeEvent } = useEventStore();
  const [collapsed, setCollapsed] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const userName     = session?.user?.name ?? "Organizer";
  const userInitials = getInitials(userName);

  /* Build the resolved href for a nav item */
  const resolveHref = (item: SidebarNavItem): string => {
    if (item.requiresEvent && activeEvent) {
      return `/admin/events/${activeEvent.event_id}/${item.eventPath}`;
    }
    return item.href ?? "/admin/events";
  };

  /* Active state */
  const isActive = (item: SidebarNavItem): boolean => {
    if (!item.matchPrefixes) return pathname === item.href;
    return item.matchPrefixes.some((p) => {
      const rx = new RegExp("^" + p + "(/|$)");
      return rx.test(pathname);
    });
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {/* ── Desktop Sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        className="hidden lg:flex flex-col fixed left-0 top-0 h-screen bg-surface-container-low border-r border-outline/10 z-40 overflow-hidden"
      >
        {/* Logo row */}
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

        {/* Active event context chip */}
        <AnimatePresence>
          {!collapsed && activeEvent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="px-3 pt-3 pb-1"
            >
              <div className="bg-primary/5 border border-primary/10 rounded-xl px-3 py-2 space-y-0.5">
                <p className="text-[9px] font-bold text-outline uppercase tracking-widest">
                  Managing
                </p>
                <p className="text-[11px] font-bold text-primary leading-snug truncate">
                  {activeEvent.title}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active    = isActive(item);
            const disabled  = item.requiresEvent && !activeEvent;
            const href      = resolveHref(item);
            const showBadge = item.id === "dashboard" && pendingApprovals > 0;

            const cls = `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
              disabled
                ? "opacity-35 cursor-not-allowed pointer-events-none"
                : active
                ? "bg-primary-fixed text-primary"
                : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
            }`;

            const inner = (
              <>
                {/* Icon */}
                <span
                  className={`material-symbols-outlined text-[20px] shrink-0 ${
                    active ? "text-primary" : "text-on-surface-variant group-hover:text-primary"
                  }`}
                  style={active ? { fontVariationSettings: "'FILL' 1, 'wght' 600" } : {}}
                >
                  {item.icon}
                </span>

                {/* Label */}
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className={`text-[13px] font-semibold whitespace-nowrap flex-1 ${active ? "font-bold" : ""}`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* "Select event" hint when disabled */}
                {!collapsed && disabled && (
                  <span className="text-[9px] text-outline font-semibold bg-surface-container px-1.5 py-0.5 rounded-full whitespace-nowrap">
                    select event
                  </span>
                )}

                {/* Active indicator bar */}
                {active && (
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

                {/* Tooltip when collapsed */}
                {collapsed && (
                  <span className="absolute left-full ml-3 bg-on-surface text-surface text-[11px] font-semibold px-2.5 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50 shadow-lg">
                    {item.label}
                    {disabled ? " (select event first)" : ""}
                  </span>
                )}
              </>
            );

            return disabled ? (
              /* Disabled — render div, no navigation */
              <div key={item.id} className={cls}>
                {inner}
              </div>
            ) : (
              /* Enabled — render Link */
              <Link key={item.id} href={href} title={collapsed ? item.label : undefined} className={cls}>
                {inner}
              </Link>
            );
          })}
        </nav>

        {/* User profile footer */}
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

      {/* ── Logout confirmation ── */}
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