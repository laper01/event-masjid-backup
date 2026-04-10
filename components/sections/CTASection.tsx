"use client";

import { motion } from "framer-motion";
import { AnimateIn } from "@/components/ui/AnimateIn";
import { MotionButton } from "@/components/ui/Button";
import { SOCIAL_PROOF_STATS } from "@/lib/data";

/* ─────────────────────────────────────────────
   SOCIAL PROOF STATS ROW
   ───────────────────────────────────────────── */
function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <p className="font-headline font-extrabold text-2xl md:text-3xl text-on-primary mb-1">
        {value}
      </p>
      <p className="text-primary-fixed/70 text-xs uppercase tracking-widest font-medium">
        {label}
      </p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CTA SECTION
   ───────────────────────────────────────────── */
export function CTASection() {
  return (
    <section
      id="cta"
      className="py-8 px-6 lg:px-8"
      aria-labelledby="cta-heading"
    >
      <div className="max-w-7xl mx-auto">
        <AnimateIn direction="up">
          <div className="relative bg-primary rounded-[2.5rem] overflow-hidden px-8 py-16 md:px-16 md:py-20 text-center">
            {/* Geometric watermark layer */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cg fill='none' stroke='%23a6f2d1' stroke-width='0.8' opacity='0.07'%3E%3Cpolygon points='60,5 95,27.5 95,72.5 60,95 25,72.5 25,27.5'/%3E%3Cpolygon points='60,20 80,32 80,56 60,68 40,56 40,32'/%3E%3Cline x1='60' y1='5' x2='60' y2='20'/%3E%3Cline x1='95' y1='27.5' x2='80' y2='32'/%3E%3Cline x1='95' y1='72.5' x2='80' y2='56'/%3E%3Cline x1='60' y1='95' x2='60' y2='68'/%3E%3Cline x1='25' y1='72.5' x2='40' y2='56'/%3E%3Cline x1='25' y1='27.5' x2='40' y2='32'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: "120px 120px",
              }}
              aria-hidden="true"
            />

            {/* Soft radial glow from center */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(ellipse at 50% 50%, rgba(166,242,209,0.08) 0%, transparent 70%)",
              }}
              aria-hidden="true"
            />

            {/* Content */}
            <div className="relative z-10">
              {/* Stats row */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-14"
              >
                {SOCIAL_PROOF_STATS.map((stat) => (
                  <StatItem key={stat.label} value={stat.value} label={stat.label} />
                ))}
              </motion.div>

              {/* Divider */}
              <div
                className="w-16 h-px bg-primary-fixed/20 mx-auto mb-12"
                aria-hidden="true"
              />

              {/* Headline */}
              <motion.h2
                id="cta-heading"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.65, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="font-headline font-extrabold text-on-primary mb-5 max-w-2xl mx-auto leading-tight"
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                  letterSpacing: "-0.02em",
                }}
              >
                Ready to transform your masjid from Friday-only to 24/7?
              </motion.h2>

              {/* Sub-copy */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.55, delay: 0.2, ease: "easeOut" }}
                className="text-primary-fixed/70 max-w-md mx-auto leading-relaxed mb-10 text-sm md:text-base"
              >
                Join over 200 communities already using Events.io to power their gatherings,
                ticketing, volunteer coordination, and real-time check-ins.
              </motion.p>

              {/* Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                <MotionButton
                  variant="secondary"
                  size="lg"
                  aria-label="Book a demonstration"
                >
                  Book a Demo
                </MotionButton>
                <MotionButton
                  variant="outline"
                  size="lg"
                  aria-label="Sign up for free"
                >
                  Sign Up Free
                </MotionButton>
              </motion.div>
            </div>
          </div>
        </AnimateIn>
      </div>
    </section>
  );
}
