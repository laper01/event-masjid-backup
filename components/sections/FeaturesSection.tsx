"use client";

import { motion } from "framer-motion";
import { AnimateIn, StaggerChildren, StaggerItem } from "@/components/ui/AnimateIn";
import { FEATURES } from "@/lib/data";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   MATERIAL ICON MAP
   ───────────────────────────────────────────── */
function FeatureIcon({ icon, highlighted }: { icon: string; highlighted: boolean }) {
  const icons: Record<string, React.ReactNode> = {
    qr_code_scanner: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
        <path d="M9.5 6.5v3h-3v-3h3M11 5H5v6h6V5zm-1.5 9.5v3h-3v-3h3M11 13H5v6h6v-6zm6.5-6.5v3h-3v-3h3M19 5h-6v6h6V5zm-6 8h1.5v1.5H13V13zm1.5 1.5H16V16h-1.5v-1.5zM16 13h1.5v1.5H16V13zm-3 3h1.5v1.5H13V16zm1.5 1.5H16V19h-1.5v-1.5zM16 16h1.5v1.5H16V16zm1.5-1.5H19V16h-1.5v-1.5zm0 3H19V19h-1.5v-1.5zM22 7h-2V4h-3V2h5v5zm0 15v-5h-2v3h-3v2h5zM2 22h5v-2H4v-3H2v5zM2 2v5h2V4h3V2H2z" />
      </svg>
    ),
    monitoring: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
        <path d="M7 14h2v3H7zm3.5-3h2v6h-2zm3.5-3h2v9h-2z" />
      </svg>
    ),
    mail: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    ),
  };

  return (
    <div
      className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center mb-5",
        highlighted
          ? "bg-primary-fixed/20 text-primary-fixed"
          : "bg-surface-container text-primary"
      )}
    >
      {icons[icon]}
    </div>
  );
}

/* ─────────────────────────────────────────────
   FEATURE CARD
   ───────────────────────────────────────────── */
interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  highlighted: boolean;
}

function FeatureCard({ icon, title, description, highlighted }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={highlighted ? {} : { y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={cn(
        "relative rounded-[2rem] p-8 overflow-hidden h-full",
        highlighted
          ? "bg-primary text-on-primary"
          : "bg-surface-container-lowest shadow-ambient ghost-border"
      )}
      role="article"
    >
      {/* Geometric watermark on highlighted card */}
      {highlighted && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='%23a6f2d1' stroke-width='0.6' opacity='0.08'%3E%3Cpolygon points='40,5 70,22.5 70,57.5 40,75 10,57.5 10,22.5'/%3E%3Cpolygon points='40,18 57,27.5 57,46.5 40,56 23,46.5 23,27.5'/%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "80px 80px",
          }}
          aria-hidden="true"
        />
      )}

      <div className="relative z-10">
        <FeatureIcon icon={icon} highlighted={highlighted} />
        <h3
          className={cn(
            "font-headline font-bold text-xl mb-3",
            highlighted ? "text-on-primary" : "text-on-surface"
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "leading-relaxed",
            highlighted
              ? "text-primary-fixed/80 text-sm"
              : "text-on-surface-variant text-sm"
          )}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   FEATURES SECTION
   ───────────────────────────────────────────── */
export function FeaturesSection() {
  return (
    <section
      id="features"
      className="py-24 bg-surface"
      aria-labelledby="features-heading"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <AnimateIn direction="up" className="text-center mb-16">
          <h2
            id="features-heading"
            className="font-headline font-bold text-on-surface mb-4"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
          >
            Engineered for Efficiency
          </h2>
          <p className="text-on-surface-variant max-w-lg mx-auto leading-relaxed">
            Skip the manual spreadsheets. Our automated toolkit handles the
            logistics so you can focus on the people.
          </p>
        </AnimateIn>

        {/* Bento Grid */}
        <StaggerChildren
          className="grid grid-cols-1 md:grid-cols-3 gap-5"
          staggerDelay={0.12}
        >
          {FEATURES.map((feature) => (
            <StaggerItem key={feature.id}>
              <FeatureCard {...feature} />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </div>
    </section>
  );
}
