"use client";

import { motion } from "framer-motion";
import { MotionButton } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { HERO_STATS, RECENT_ATTENDEES } from "@/lib/data";

/* ─────────────────────────────────────────────
   DASHBOARD PREVIEW CARD
   Mimics the floating admin dashboard mockup seen in the reference.
   ───────────────────────────────────────────── */
function DashboardPreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Floating ambient glow behind the card */}
      <div
        className="absolute -inset-8 rounded-[3rem] blur-3xl opacity-30"
        style={{
          background:
            "radial-gradient(ellipse, rgba(166,242,209,0.6) 0%, transparent 70%)",
        }}
        aria-hidden="true"
      />

      {/* Main dashboard card */}
      <div className="relative bg-surface-container-lowest rounded-[2rem] shadow-float overflow-hidden ghost-border">
        {/* Browser chrome */}
        <div className="bg-surface-container-low px-4 py-3 flex items-center gap-2 border-b border-outline-variant/10">
          <span className="w-3 h-3 rounded-full bg-red-400" aria-hidden="true" />
          <span className="w-3 h-3 rounded-full bg-secondary-fixed" aria-hidden="true" />
          <span className="w-3 h-3 rounded-full bg-primary-fixed" aria-hidden="true" />
          <span className="ml-3 text-xs text-on-surface-variant/60 font-mono">
            events.masjids.io/admin/ticketing
          </span>
        </div>

        {/* Dashboard content */}
        <div className="p-6">
          {/* Revenue row */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-headline font-bold text-on-surface text-lg">
                Revenue Overview
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Real-time tracking for {HERO_STATS.eventName}
              </p>
            </div>
            <div className="text-right">
              <p className="font-headline font-extrabold text-2xl text-primary">
                {HERO_STATS.revenue}
              </p>
              <p className="text-xs text-tertiary-fixed-dim font-semibold">
                {HERO_STATS.revenueChange}
              </p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: "TICKETS SOLD", value: HERO_STATS.ticketsSold },
              { label: "CHECK-INS", value: HERO_STATS.checkIns },
              { label: "WAITLIST", value: HERO_STATS.waitlist },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-wider font-medium mb-1">
                  {stat.label}
                </p>
                <p className="font-headline font-bold text-lg text-on-surface">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Recent attendees */}
          <div>
            <p className="text-[10px] text-on-surface-variant/60 uppercase tracking-wider font-medium mb-3">
              RECENT ATTENDEES
            </p>
            <div className="space-y-2">
              {RECENT_ATTENDEES.map((attendee) => (
                <div
                  key={attendee.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary flex-shrink-0"
                      style={{ background: attendee.avatarColor }}
                      aria-hidden="true"
                    >
                      {attendee.initials}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-on-surface leading-tight">
                        {attendee.name}
                      </p>
                      <p className="text-[11px] text-on-surface-variant">
                        {attendee.email}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      attendee.status === "checked-in"
                        ? "bg-primary-fixed/30 text-primary"
                        : "bg-surface-container-high text-on-surface-variant"
                    }`}
                  >
                    {attendee.status === "checked-in" ? "Checked In" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating QR scan badge */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-5 -left-6 bg-primary text-on-primary px-4 py-3 rounded-2xl shadow-float flex items-center gap-3"
        aria-label="Instant scan access feature"
      >
        <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
          {/* QR code icon */}
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 text-primary-fixed"
            aria-hidden="true"
          >
            <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zm8-2v8h8V3h-8zm6 6h-4V5h4v4zM3 21h8v-8H3v8zm2-6h4v4H5v-4zm13-2h-2v2h2v-2zm-4 0h-2v2h2v-2zm4 4h-2v2h2v-2zm-4 4h-2v2h2v-2zm4 0h-2v2h2v-2zm-4-8h-2v2h2v-2z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-bold text-on-primary">INSTANT SCAN</p>
          <p className="text-[10px] text-primary-fixed opacity-80">ACCESS</p>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   HERO SECTION
   ───────────────────────────────────────────── */
export function HeroSection() {
  return (
    <section
      className="relative pt-24 pb-20 md:pt-32 md:pb-28 overflow-hidden"
      aria-label="Hero - The Human Touch in Digital Ticketing"
    >
      {/* Mesh gradient background */}
      <div className="absolute inset-0 mesh-bg" aria-hidden="true" />

      {/* Subtle geometric pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='%23004532' stroke-width='0.5'%3E%3Cpolygon points='30,3 52,15.5 52,40.5 30,53 8,40.5 8,15.5'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column – Text */}
          <div>
            {/* New badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <Badge variant="new" className="mb-6">
                🎉 NEW: TICKETING ENGINE
              </Badge>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="font-headline font-extrabold text-primary leading-[1.08] tracking-tight mb-6"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.02em" }}
            >
              The Human Touch
              <br />
              in Digital
              <br />
              <span className="text-secondary">Ticketing.</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="text-on-surface-variant leading-relaxed mb-8 max-w-md text-base lg:text-lg"
            >
              Manage admissions with grace. Our comprehensive solution combines
              real-time revenue tracking with effortless QR entry for a seamless
              community experience.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3, ease: "easeOut" }}
              className="flex flex-wrap gap-3"
            >
              <MotionButton
                variant="primary"
                size="lg"
                aria-label="Get started for free"
              >
                Get Started Free
              </MotionButton>
              <MotionButton
                variant="ghost"
                size="lg"
                aria-label="View a demonstration"
              >
                View Demo
              </MotionButton>
            </motion.div>
          </div>

          {/* Right Column – Dashboard Preview */}
          <div className="relative hidden md:block">
            <DashboardPreview />
          </div>
        </div>
      </div>
    </section>
  );
}
