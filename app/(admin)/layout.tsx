"use client";

import { AdminSidebar } from "@/components/nav/AdminSidebar";
import { AdminMobileNav } from "@/components/nav/AdminMobileNav";

/**
 * Admin layout
 * Desktop: fixed 240px sidebar + content shifted right
 * Mobile:  no sidebar, bottom nav
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Fixed sidebar */}
      <AdminSidebar />

      {/* Main content — ml-[240px] on desktop to clear sidebar */}
      <div className="flex-1 lg:ml-[240px] min-h-screen flex flex-col pb-20 lg:pb-0 overflow-x-hidden">
        {children}
      </div>

      {/* Mobile bottom nav */}
      <AdminMobileNav />
    </div>
  );
}
