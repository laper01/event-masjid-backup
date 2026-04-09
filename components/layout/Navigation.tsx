"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/data";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   NAVIGATION COMPONENT
   ───────────────────────────────────────────── */
export function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("Events");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "glass-nav shadow-[0_4px_30px_rgba(0,69,50,0.08)] border-b border-outline-variant/10"
            : "bg-surface/80 backdrop-blur-sm"
        )}
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <motion.a
              href="/"
              className="flex items-center gap-2 group"
              aria-label="Events.Masjids.io - Home"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Mosque icon SVG */}
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-container transition-colors">
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 text-on-primary"
                  aria-hidden="true"
                >
                  <path d="M12 2C10.34 2 9 3.34 9 5c0 .9.39 1.71 1 2.27V9H8L6 7H4l-2 2v2h2v7h2v-3h2v3h8v-3h2v3h2V11h2V9l-2-2h-2L12 9h-2V7.27C10.61 6.71 11 5.9 11 5c0-1.66-1.34-3-3-3zM7 11h10v6H7v-6z" />
                </svg>
              </div>
              <span className="font-headline font-bold text-lg text-primary tracking-tight">
                Events.Masjids.io
              </span>
            </motion.a>

            {/* Desktop Navigation Links */}
            <nav
              className="hidden md:flex items-center gap-1"
              aria-label="Primary navigation"
            >
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setActiveLink(link.label)}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-full transition-all duration-200",
                    activeLink === link.label
                      ? "text-primary bg-primary-fixed/30"
                      : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                  )}
                  aria-current={activeLink === link.label ? "page" : undefined}
                >
                  {link.label}
                  {activeLink === link.label && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </a>
              ))}
            </nav>

            {/* CTA Button + Mobile Menu */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="hidden md:flex items-center gap-2 bg-primary text-on-primary px-5 py-2.5 rounded-full text-sm font-semibold shadow-ambient-sm hover:bg-primary-container transition-colors focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                aria-label="Create a new event"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                  aria-hidden="true"
                >
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" />
                </svg>
                Create Event
              </motion.button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low transition-colors"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                aria-controls="mobile-menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed top-16 left-0 right-0 z-40 glass-nav border-b border-outline-variant/10 md:hidden"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <nav className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link, i) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => {
                    setActiveLink(link.label);
                    setMobileOpen(false);
                  }}
                  className={cn(
                    "px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                    activeLink === link.label
                      ? "text-primary bg-primary-fixed/20 font-semibold"
                      : "text-on-surface-variant hover:text-primary hover:bg-surface-container-low"
                  )}
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="pt-3 border-t border-outline-variant/10 mt-2">
                <button className="w-full bg-primary text-on-primary py-3 rounded-full text-sm font-semibold">
                  Create Event
                </button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
