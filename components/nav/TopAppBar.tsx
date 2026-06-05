"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useDiscoverStore } from "@/store/discoverStore";
import { getInitials } from "@/lib/utils";

interface TopAppBarProps {
  /** Hide the Feed / Discover tab switcher on pages that don't need it */
  showTabs?: boolean;
}

const NAV_TABS = [
  { id: "feed", label: "Feed" },
  { id: "discover", label: "Discover" },
] as const;

export function TopAppBar({ showTabs = true }: TopAppBarProps) {
  const { data: session } = useSession();
  const { activeTab, setActiveTab } = useDiscoverStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isFeedPage = pathname === "/feed" || pathname === "/discover";
  const displayTabs = showTabs && isFeedPage;

  const userInitials = getInitials(session?.user?.name ?? "U");
  const userName = session?.user?.name ?? "User";
  const userEmail = session?.user?.email ?? "";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-b border-outline/10 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">

        {/* ── Logo ─────────────────────────────────────────────── */}
        <Link
          href="/feed"
          className="flex items-center gap-2 shrink-0 group"
          onClick={() => setActiveTab("feed")}
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <span className="material-symbols-outlined text-on-primary text-[18px] filled">
              mosque
            </span>
          </div>
          <span className="font-bold text-primary text-sm hidden sm:block leading-tight">
            Events.<span className="text-secondary">Masjids</span>.io
          </span>
        </Link>

        {/* ── Desktop Tab Switcher (Feed / Discover) ────────────── */}
        {displayTabs && (
          <nav className="hidden md:flex items-center bg-surface-container rounded-full p-1 gap-1">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative px-6 py-1.5 rounded-full font-label-lg text-label-lg transition-colors"
              >
                <AnimatePresence>
                  {activeTab === tab.id && (
                    <motion.span
                      layoutId="tab-pill"
                      className="absolute inset-0 bg-primary rounded-full"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </AnimatePresence>
                <span
                  className={`relative z-10 transition-colors ${
                    activeTab === tab.id
                      ? "text-on-primary font-bold"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>
        )}

        {/* ── Right: Notifications + Profile ───────────────────── */}
        <div className="flex items-center gap-2 shrink-0">

          {/* Notifications bell */}
          <div className="relative">
            <button
              onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors relative"
              aria-label="Notifications"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-[22px]">
                notifications
              </span>
              {/* Unread badge */}
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface" />
            </button>

            {/* Notification dropdown */}
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-80 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline/10 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-outline/10">
                    <h3 className="font-bold text-primary">Notifications</h3>
                  </div>
                  <div className="p-4 text-center py-8">
                    <span className="material-symbols-outlined text-outline text-3xl block mb-2">
                      notifications_none
                    </span>
                    <p className="text-on-surface-variant text-body-md">
                      No new notifications
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Profile avatar */}
          <div className="relative">
            <button
              onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
              className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed-variant font-bold text-sm flex items-center justify-center hover:ring-2 hover:ring-primary/30 transition-all overflow-hidden"
              aria-label="Profile menu"
            >
              {session?.user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={session.user.image}
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                userInitials
              )}
            </button>

            {/* Profile dropdown */}
            <AnimatePresence>
              {profileOpen && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 w-64 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline/10 overflow-hidden z-50"
                  >
                    {/* User info */}
                    <div className="p-4 border-b border-outline/10">
                      <p className="font-bold text-primary text-sm">{userName}</p>
                      <p className="text-outline text-label-sm truncate">{userEmail}</p>
                    </div>

                    {/* Menu items */}
                    <div className="p-2">
                      {[
                        { icon: "person", label: "My Profile", href: "/profile" },
                        { icon: "event", label: "My Events", href: "/tickets" },
                        { icon: "military_tech", label: "Badges", href: "/volunteer" },
                        { icon: "tune", label: "Preferences", href: "/preferences" },
                      ].map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-surface-container-low transition-colors group"
                        >
                          <span className="material-symbols-outlined text-on-surface-variant text-[20px] group-hover:text-primary transition-colors">
                            {item.icon}
                          </span>
                          <span className="text-on-surface text-body-md group-hover:text-primary transition-colors">
                            {item.label}
                          </span>
                        </Link>
                      ))}
                    </div>

                    {/* Divider + Sign out */}
                    <div className="p-2 border-t border-outline/10">
                      <button
                        onClick={async () => {
                          setProfileOpen(false);
                          const { signOut } = await import("next-auth/react");
                          await fetch("/api/auth/logout", { method: "POST" });
                          signOut({ callbackUrl: "/login" });
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-error/5 transition-colors group text-left"
                      >
                        <span className="material-symbols-outlined text-outline text-[20px] group-hover:text-error transition-colors">
                          logout
                        </span>
                        <span className="text-on-surface-variant text-body-md group-hover:text-error transition-colors">
                          Sign out
                        </span>
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── Mobile Tab Switcher ──────────────────────────────────── */}
      {displayTabs && (
        <div className="md:hidden flex border-t border-outline/10">
          {NAV_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 text-label-lg font-bold transition-colors relative ${
                activeTab === tab.id
                  ? "text-primary"
                  : "text-on-surface-variant"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.span
                  layoutId="mobile-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </header>
  );
}

export default TopAppBar;
