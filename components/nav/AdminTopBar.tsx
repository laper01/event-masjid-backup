"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AdminEvent {
  event_id: string;
  title: string;
  status: "draft" | "published" | "cancelled" | "completed";
}

interface AdminTopBarProps {
  /** Breadcrumb trail e.g. [{ label: "Annual Gala", href: "/admin/events/evt-001" }, { label: "Tickets" }] */
  breadcrumbs?: BreadcrumbItem[];
  /** Currently selected event for the context switcher */
  activeEvent?: AdminEvent;
  /** All events the organizer manages — shown in the context switcher dropdown */
  events?: AdminEvent[];
  /** Called when the organizer selects a different event from the dropdown */
  onEventChange?: (eventId: string) => void;
  /** Page-level action buttons (rendered right side) */
  actions?: React.ReactNode;
}

const STATUS_COLORS: Record<string, string> = {
  published: "bg-primary-fixed text-on-primary-fixed-variant",
  draft: "bg-surface-container-high text-on-surface-variant",
  cancelled: "bg-error-container text-on-error-container",
  completed: "bg-surface-container-high text-outline",
};

export function AdminTopBar({
  breadcrumbs = [],
  activeEvent,
  events = [],
  onEventChange,
  actions,
}: AdminTopBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [switcherOpen, setSwitcherOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur-md border-b border-outline/10 shadow-sm">
      <div className="px-6 h-14 flex items-center gap-4">

        {/* ── Mobile hamburger (shown on small screens) ─────────── */}
        <button
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-surface-container transition-colors"
          aria-label="Open sidebar"
        >
          <span className="material-symbols-outlined text-on-surface-variant text-[22px]">
            menu
          </span>
        </button>

        {/* ── Breadcrumbs ───────────────────────────────────────── */}
        <nav className="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
          {/* Always show admin home */}
          <Link
            href="/admin/dashboard"
            className="text-on-surface-variant hover:text-primary text-label-lg transition-colors shrink-0"
          >
            Admin
          </Link>

          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-1 min-w-0">
              <span className="material-symbols-outlined text-outline text-[16px] shrink-0">
                chevron_right
              </span>
              {crumb.href && i < breadcrumbs.length - 1 ? (
                <Link
                  href={crumb.href}
                  className="text-on-surface-variant hover:text-primary text-label-lg transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-primary font-bold text-label-lg truncate">
                  {crumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>

        {/* ── Event context switcher ────────────────────────────── */}
        {activeEvent && events.length > 0 && (
          <div className="relative shrink-0">
            <button
              onClick={() => setSwitcherOpen(!switcherOpen)}
              className="flex items-center gap-2 bg-surface-container-low hover:bg-surface-container border border-outline/10 rounded-full px-4 py-2 transition-colors max-w-[220px]"
            >
              <span
                className={`text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0 ${
                  STATUS_COLORS[activeEvent.status] ?? STATUS_COLORS.draft
                }`}
              >
                {activeEvent.status.charAt(0).toUpperCase() + activeEvent.status.slice(1)}
              </span>
              <span className="text-on-surface font-bold text-label-lg truncate">
                {activeEvent.title}
              </span>
              <motion.span
                className="material-symbols-outlined text-outline text-[18px] shrink-0"
                animate={{ rotate: switcherOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                expand_more
              </motion.span>
            </button>

            {/* Switcher dropdown */}
            <AnimatePresence>
              {switcherOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setSwitcherOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-12 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline/10 z-40 min-w-[260px] max-h-72 overflow-y-auto"
                  >
                    <div className="p-2 border-b border-outline/10">
                      <p className="text-label-sm text-outline uppercase tracking-wider px-3 py-1.5 font-bold">
                        Switch Event
                      </p>
                    </div>
                    <div className="p-2">
                      {events.map((event) => (
                        <button
                          key={event.event_id}
                          onClick={() => {
                            setSwitcherOpen(false);
                            onEventChange?.(event.event_id);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors hover:bg-surface-container-low ${
                            event.event_id === activeEvent.event_id
                              ? "bg-primary-fixed/20"
                              : ""
                          }`}
                        >
                          <span
                            className={`text-[10px] font-bold rounded-full px-2 py-0.5 shrink-0 ${
                              STATUS_COLORS[event.status] ?? STATUS_COLORS.draft
                            }`}
                          >
                            {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                          </span>
                          <span className="text-on-surface font-bold text-label-lg truncate flex-1">
                            {event.title}
                          </span>
                          {event.event_id === activeEvent.event_id && (
                            <span className="material-symbols-outlined text-primary text-[18px] shrink-0">
                              check
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    <div className="p-2 border-t border-outline/10">
                      <Link
                        href="/admin/events/create"
                        onClick={() => setSwitcherOpen(false)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-surface-container-low text-primary font-bold text-label-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-[18px]">add</span>
                        Create New Event
                      </Link>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* ── Page actions (passed as children) ────────────────── */}
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}

export default AdminTopBar;
