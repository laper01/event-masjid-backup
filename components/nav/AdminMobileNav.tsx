"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const MOBILE_NAV_ITEMS = [
  {
    id: "dashboard",
    icon: "dashboard",
    label: "Dashboard",
    href: "/admin/dashboard",
  },
  {
    id: "events",
    icon: "event",
    label: "Events",
    href: "/admin/events",
  },
  {
    id: "checkin",
    icon: "qr_code_scanner",
    label: "Check-in",
    href: "/admin/events",
  },
  {
    id: "more",
    icon: "more_horiz",
    label: "More",
    href: "",
  },
] as const;

const MORE_ITEMS = [
  { icon: "local_activity", label: "Tickets", href: "/admin/events" },
  { icon: "people", label: "Volunteers", href: "/admin/events" },
  { icon: "groups", label: "Clubs", href: "/admin/clubs" },
  { icon: "analytics", label: "Analytics", href: "/admin/analytics" },
  { icon: "settings", label: "Settings", href: "/admin/settings" },
];

export function AdminMobileNav() {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);

  const isActive = (href: string): boolean => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  return (
    <>
      {/* ── More drawer ─────────────────────────────────────────── */}
      <AnimatePresence>
        {moreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-on-surface/20 z-40 lg:hidden"
              onClick={() => setMoreOpen(false)}
            />
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 35 }}
              className="fixed bottom-[72px] left-0 right-0 bg-surface-container-lowest rounded-t-2xl border-t border-outline/10 shadow-2xl z-50 lg:hidden pb-safe"
            >
              <div className="p-2 flex justify-center">
                <div className="w-10 h-1 rounded-full bg-outline/30" />
              </div>
              <div className="p-4 grid grid-cols-3 gap-3">
                {MORE_ITEMS.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMoreOpen(false)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-surface-container-low transition-colors"
                  >
                    <span className="material-symbols-outlined text-on-surface-variant text-[24px]">
                      {item.icon}
                    </span>
                    <span className="text-label-sm text-on-surface-variant font-bold">
                      {item.label}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Mobile bottom nav ───────────────────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/90 backdrop-blur-md border-t border-outline/10 pb-safe">
        <div className="flex items-stretch h-[72px]">
          {MOBILE_NAV_ITEMS.map((item) => {
            const active = item.id === "more" ? moreOpen : isActive(item.href);

            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === "more") {
                    setMoreOpen(!moreOpen);
                  }
                }}
                className="flex-1 flex flex-col items-center justify-center gap-0.5 relative group"
                aria-label={item.label}
              >
                {item.id === "more" ? (
                  <>
                    <AnimatePresence>
                      {active && (
                        <motion.span
                          layoutId="admin-mobile-pill"
                          className="absolute top-2 inset-x-3 h-8 bg-primary-fixed/60 rounded-full"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>
                    <span
                      className={`material-symbols-outlined relative z-10 text-[24px] transition-colors ${
                        active ? "text-primary" : "text-on-surface-variant"
                      }`}
                      style={
                        active
                          ? { fontVariationSettings: "'FILL' 1, 'wght' 500" }
                          : {}
                      }
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`relative z-10 text-[10px] font-bold leading-none transition-colors ${
                        active ? "text-primary" : "text-on-surface-variant"
                      }`}
                    >
                      {item.label}
                    </span>
                  </>
                ) : (
                  <Link
                    href={item.href}
                    className="flex flex-col items-center justify-center gap-0.5 w-full h-full"
                  >
                    <AnimatePresence>
                      {active && (
                        <motion.span
                          layoutId="admin-mobile-pill"
                          className="absolute top-2 inset-x-3 h-8 bg-primary-fixed/60 rounded-full"
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>
                    <span
                      className={`material-symbols-outlined relative z-10 text-[24px] transition-colors ${
                        active ? "text-primary" : "text-on-surface-variant group-hover:text-primary"
                      }`}
                      style={
                        active
                          ? { fontVariationSettings: "'FILL' 1, 'wght' 500" }
                          : {}
                      }
                    >
                      {item.icon}
                    </span>
                    <span
                      className={`relative z-10 text-[10px] font-bold leading-none transition-colors ${
                        active ? "text-primary" : "text-on-surface-variant group-hover:text-primary"
                      }`}
                    >
                      {item.label}
                    </span>
                  </Link>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}

export default AdminMobileNav;
