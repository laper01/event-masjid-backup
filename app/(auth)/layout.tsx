import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In · Events.Masjids.io",
};

/**
 * Auth layout — no TopAppBar, no BottomNav, no Sidebar.
 * Clean centered page for login / register / reset flows.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Minimal brand strip */}
      <div className="py-6 px-6 flex justify-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <span
              className="material-symbols-outlined text-on-primary text-[18px]"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              mosque
            </span>
          </div>
          <span className="font-bold text-primary text-sm leading-tight">
            Events.<span className="text-secondary">Masjids</span>.io
          </span>
        </div>
      </div>

      {/* Page content */}
      <main className="flex-1 flex items-center justify-center px-4 pb-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-outline text-label-sm">
          &copy; {new Date().getFullYear()} Masjids.io · All rights reserved
        </p>
      </footer>
    </div>
  );
}
