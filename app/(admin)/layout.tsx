"use client";

import { AdminSidebar } from "@/components/nav/AdminSidebar";
import { AdminMobileNav } from "@/components/nav/AdminMobileNav";

/**
 * Admin layout
 * ─────────────────────────────────────────────
 * Desktop: Fixed 240px sidebar left + scrollable main content right
 * Mobile:  No sidebar; AdminMobileNav fixed at bottom
 *
 * The AdminTopBar is NOT included here because each admin page
 * renders its own AdminTopBar with page-specific breadcrumbs,
 * event context switcher, and action buttons.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface flex">
      {/* ── Desktop Sidebar ──────────────────────────────────────── */}
      <AdminSidebar />

      {/* ── Main content area ────────────────────────────────────── */}
      <div
        className="
          flex-1
          /* shift right to clear the sidebar on desktop */
          lg:ml-[240px]
          /* on mobile: no left margin */
          /* bottom padding clears mobile nav */
          pb-20 lg:pb-0
          min-h-screen
          flex flex-col
          overflow-x-hidden
        "
      >
        {children}
      </div>

      {/* ── Mobile bottom nav (admin variant) ────────────────────── */}
      <AdminMobileNav />
    </div>
  );
}
