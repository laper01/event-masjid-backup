import { FOOTER_LINKS } from "@/lib/data";

/* ─────────────────────────────────────────────
   FOOTER COMPONENT
   ───────────────────────────────────────────── */
export function Footer() {
  return (
    <footer
      className="bg-surface-container-low pt-16 pb-10"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col items-center text-center gap-6">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 text-on-primary"
                aria-hidden="true"
              >
                <path d="M12 2C10.34 2 9 3.34 9 5c0 .9.39 1.71 1 2.27V9H8L6 7H4l-2 2v2h2v7h2v-3h2v3h8v-3h2v3h2V11h2V9l-2-2h-2L12 9h-2V7.27C10.61 6.71 11 5.9 11 5c0-1.66-1.34-3-3-3z" />
              </svg>
            </div>
            <span className="font-headline font-bold text-primary text-base">
              Events.Masjids.io
            </span>
          </div>

          {/* Footer Links */}
          <nav
            className="flex flex-wrap justify-center gap-x-8 gap-y-2"
            aria-label="Footer navigation"
          >
            {FOOTER_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-on-surface-variant hover:text-primary transition-colors uppercase tracking-wider font-medium text-[0.7rem]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Copyright */}
          <p className="text-xs text-on-surface-variant/60 font-body">
            © {new Date().getFullYear()} EVENTS.MASJIDS.IO. AN EDITORIAL EXPERIENCE.
          </p>
        </div>
      </div>
    </footer>
  );
}
