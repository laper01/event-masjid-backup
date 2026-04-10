"use client";

import { motion } from "framer-motion";
import { AnimateIn, StaggerChildren, StaggerItem } from "@/components/ui/AnimateIn";
import { PERSONAS } from "@/lib/data";

/* ─────────────────────────────────────────────
   PERSONA CARD
   ───────────────────────────────────────────── */
function PersonaCard({
  role,
  avatar,
  description,
  painPoint,
  solution,
}: {
  role: string;
  avatar: string;
  description: string;
  painPoint: string;
  solution: string;
}) {
  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-ambient ghost-border flex flex-col"
    >
      {/* Top band - arch shape */}
      <div className="bg-primary px-7 pt-8 pb-12 relative overflow-hidden">
        {/* Geometric watermark */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Cg fill='none' stroke='%23a6f2d1' stroke-width='0.6'%3E%3Cpolygon points='30,3 52,16 52,44 30,57 8,44 8,16'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "60px 60px",
          }}
          aria-hidden="true"
        />
        {/* Avatar circle */}
        <div className="w-14 h-14 rounded-2xl bg-primary-fixed flex items-center justify-center mb-4">
          <span className="font-headline font-extrabold text-primary text-lg" aria-hidden="true">
            {avatar}
          </span>
        </div>
        <h3 className="font-headline font-bold text-on-primary text-xl leading-tight">
          {role}
        </h3>
      </div>

      {/* Body - slightly overlapping the top band */}
      <div className="px-7 pt-6 pb-7 flex flex-col gap-5 flex-1 -mt-5 bg-surface-container-lowest rounded-t-[1.5rem] relative">
        <p className="text-on-surface-variant text-sm leading-relaxed">{description}</p>

        {/* Pain point */}
        <div className="bg-surface-container-low rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-error mb-1.5">
            ⚠ Pain Point
          </p>
          <p className="text-on-surface text-sm leading-relaxed">{painPoint}</p>
        </div>

        {/* Solution */}
        <div className="bg-primary-fixed/15 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1.5">
            ✓ Our Solution
          </p>
          <p className="text-on-surface text-sm leading-relaxed">{solution}</p>
        </div>
      </div>
    </motion.article>
  );
}

/* ─────────────────────────────────────────────
   PERSONAS SECTION
   ───────────────────────────────────────────── */
export function PersonasSection() {
  return (
    <section
      id="personas"
      className="py-24 bg-surface-container-low"
      aria-labelledby="personas-heading"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <AnimateIn direction="up" className="text-center mb-16">
          <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-secondary mb-4">
            Built For Your Community
          </span>
          <h2
            id="personas-heading"
            className="font-headline font-extrabold text-primary mb-5"
            style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.75rem)", letterSpacing: "-0.02em" }}
          >
            Who Is Events.io For?
          </h2>
          <p className="text-on-surface-variant max-w-xl mx-auto leading-relaxed">
            Three distinct users. One unified platform. From complex multi-room scheduling
            to finding your first community event as a revert.
          </p>
        </AnimateIn>

        {/* Cards */}
        <StaggerChildren
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          staggerDelay={0.12}
        >
          {PERSONAS.map((persona) => (
            <StaggerItem key={persona.id}>
              <PersonaCard {...persona} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
