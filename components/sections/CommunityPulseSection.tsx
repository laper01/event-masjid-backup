"use client";

import { motion } from "framer-motion";
import { AnimateIn, StaggerChildren, StaggerItem } from "@/components/ui/AnimateIn";
import { PULSE_MECHANICS } from "@/lib/data";

/* ─────────────────────────────────────────────
   PULSE CARD
   ───────────────────────────────────────────── */
function PulseCard({
  emoji,
  title,
  description,
  tag,
  index,
}: {
  emoji: string;
  title: string;
  description: string;
  tag: string;
  index: number;
}) {
  // Every 3rd card (index 1, 4…) gets a subtle gold tint
  const isAccented = index % 3 === 1;

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.01 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className={`relative rounded-[1.75rem] p-7 h-full overflow-hidden ${
        isAccented
          ? "bg-secondary-container/30"
          : "bg-surface-container-lowest shadow-ambient ghost-border"
      }`}
    >
      {/* Emoji icon */}
      <div className="text-3xl mb-4" role="img" aria-label={title}>
        {emoji}
      </div>

      {/* Tag pill */}
      <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-primary-fixed/20 text-primary mb-3">
        {tag}
      </span>

      <h3 className="font-headline font-bold text-on-surface text-lg mb-2 leading-snug">
        {title}
      </h3>
      <p className="text-on-surface-variant text-sm leading-relaxed">{description}</p>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   COMMUNITY PULSE SECTION
   ───────────────────────────────────────────── */
export function CommunityPulseSection() {
  return (
    <section
      id="community-pulse"
      className="py-24 bg-surface"
      aria-labelledby="pulse-heading"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <AnimateIn direction="up" className="mb-16">
          <div className="max-w-2xl">
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-secondary mb-4">
              The Product Differentiator
            </span>
            <h2
              id="pulse-heading"
              className="font-headline font-extrabold text-primary mb-5 leading-tight"
              style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", letterSpacing: "-0.02em" }}
            >
              The Community Pulse
            </h2>
            <p className="text-on-surface-variant leading-relaxed text-base">
              Events.io isn&apos;t just a calendar — it&apos;s a social catalyst. It uses the UWS
              Baseline Friend Graph to remove the social anxiety of attending events alone,
              turning every gathering into a genuine community moment.
            </p>
          </div>
        </AnimateIn>

        {/* 6-card grid: asymmetric 2/3 + 1/3 split on desktop */}
        <StaggerChildren
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          staggerDelay={0.09}
        >
          {PULSE_MECHANICS.map((mechanic, i) => (
            <StaggerItem key={mechanic.id}>
              <PulseCard {...mechanic} index={i} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
