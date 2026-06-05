"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { getInitials } from "@/lib/utils";

interface SidebarNavItem {
  id: string;
  icon: string;
  label: string;
  href: string;
  matchPrefixes?: string[];
}

const NAV_ITEMS: SidebarNavItem[] = [
  { id: "dashboard",  icon: "dashboard",      label: "Dashboard",  href: "/admin/dashboard", matchPrefixes: ["/admin/dashboard"] },
  { id: "events",     icon: "event",           label: "My Events",  href: "/admin/events",    matchPrefixes: ["/admin/events"] },
  { id: "tickets",    icon: "local_activity",  label: "Tickets",    href: "/admin/events",    matchPrefixes: ["/admin/events/*/tickets"] },
  { id: "checkin",    icon: "qr_code",         label: "Check-in",   href: "/admin/events",    matchPrefixes: ["/admin/events/*/checkin", "/admin/events/*/scanner"] },
  { id: "volunteers", icon: "people",          label: "Volunteers", href: "/admin/events",    matchPrefixes: ["/admin/events/*/volunteers"] },
  { id: "clubs",      icon: "groups",          label: "Clubs",      href: "/admin/clubs",     matchPrefixes: ["/admin/clubs"] },
  { id: "analytics",  icon: "analytics",       label: "Analytics",  href: "/admin/analytics", matchPrefixes: ["/admin/analytics"] },
  { id: "settings",   icon: "settings",        label: "Settings",   href: "/admin/settings",  matchPrefixes: ["/admin/settings"] },
];

interface AdminSidebarProps {
  pendingApprovals?: number;
}

export function AdminSidebar({ pendingApprovals = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const userName     = session?.user?.name ?? "Organizer";
  const userInitials = getInitials(userName);

  const isActive = (item: SidebarNavItem): boolean => {
    if (item.id === "events") {
      return pathname === "/admin/events" || pathname === "/admin/events/create";
    }
    return item.matchPrefixes
      ? item.matchPrefixes.some((p) => {
          const rx = new RegExp("^" + p.replace(/\*/g, "[^/]+") + "(/|$)");
          return rx.test(pathname);
        })
      : pathname === item.href;
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    signOut({ callbackUrl: "/login" });
  };

  return (
    <>
      {/* Desktop Sidebar */}
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

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            /* FIX: only show badge when pendingApprovals > 0 */
            const showBadge = item.id === "dashboard" && pendingApprovals > 0;

            return (
              <Link
                key={item.id}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative ${
                  active
                    ? "bg-primary-fixed text-primary"
                    : "text-on-surface-variant hover:bg-surface-container hover:text-primary"
                }`}
              >
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
                      className={`text-[13px] font-semibold whitespace-nowrap flex-1 ${
                        active ? "font-bold" : ""
                      }`}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Active indicator bar */}
                {active && (
                  <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full" />
                )}

                {/* Badge — only when > 0 */}
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
                  </span>
                )}
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

      {/* Logout confirmation */}
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
