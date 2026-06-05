"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDiscoverStore } from "@/store/discoverStore";

interface NavItem {
  id: string;
  label: string;
  icon: string;
  iconFilled: string;
  href: string;
  /** If true, tapping this tab also sets the discover store activeTab */
  storeTab?: "feed" | "discover";
  /** Highlight when any of these paths are active */
  matchPaths?: string[];
}

const NAV_ITEMS: NavItem[] = [
  {
    id: "feed",
    label: "Feed",
    icon: "rss_feed",
    iconFilled: "rss_feed",
    href: "/feed",
    storeTab: "feed",
    matchPaths: ["/feed"],
  },
  {
    id: "discover",
    label: "Discover",
    icon: "explore",
    iconFilled: "explore",
    href: "/discover",
    storeTab: "discover",
    matchPaths: ["/discover"],
  },
  {
    id: "my-events",
    label: "My Events",
    icon: "event",
    iconFilled: "event",
    href: "/tickets",
    matchPaths: ["/tickets", "/tickets/"],
  },
  {
    id: "profile",
    label: "Profile",
    icon: "person",
    iconFilled: "person",
    href: "/profile",
    matchPaths: ["/profile", "/preferences", "/volunteer", "/revert"],
  },
];

export function BottomNavBar() {
  const pathname = usePathname();
  const { setActiveTab } = useDiscoverStore();

  const isActive = (item: NavItem): boolean => {
    if (item.matchPaths) {
      return item.matchPaths.some(
        (p) => pathname === p || pathname.startsWith(p + "/")
      );
    }
    return pathname === item.href || pathname.startsWith(item.href + "/");
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface/90 backdrop-blur-md border-t border-outline/10 pb-safe">
      <div className="flex items-stretch h-[72px]">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item);

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => {
                if (item.storeTab) setActiveTab(item.storeTab);
              }}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 relative group"
              aria-label={item.label}
            >
              {/* Active background pill */}
              <AnimatePresence>
                {active && (
                  <motion.span
                    layoutId="bottom-nav-pill"
                    className="absolute top-2 inset-x-3 h-8 bg-primary-fixed/60 rounded-full"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </AnimatePresence>

              {/* Icon */}
              <motion.span
                className={`material-symbols-outlined relative z-10 text-[24px] transition-colors ${
                  active
                    ? "text-primary filled"
                    : "text-on-surface-variant group-hover:text-primary"
                }`}
                style={
                  active
                    ? { fontVariationSettings: "'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24" }
                    : {}
                }
                animate={active ? { scale: [1, 1.15, 1] } : { scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                {item.icon}
              </motion.span>

              {/* Label */}
              <span
                className={`relative z-10 text-[10px] font-bold leading-none transition-colors ${
                  active
                    ? "text-primary"
                    : "text-on-surface-variant group-hover:text-primary"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNavBar;
