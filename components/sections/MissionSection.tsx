"use client";

import { AnimateIn } from "@/components/ui/AnimateIn";
import { REVERT_FEATURES, SUCCESS_METRICS } from "@/lib/data";

/* ─────────────────────────────────────────────
   MISSION + REVERT SECTION
   Combines PRD §4D (Shahadah Companion) + §7 (mission statement)
   ───────────────────────────────────────────── */
export function MissionSection() {
  return (
    <section
      id="mission"
      className="py-24 bg-surface"
      aria-labelledby="mission-heading"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* 2-col layout: mission left, revert features right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* LEFT — Mission statement */}
          <AnimateIn direction="right">
            <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-secondary mb-4">
              Why We Built This
            </span>
            <h2
              id="mission-heading"
              className="font-headline font-extrabold text-primary mb-6 leading-tight"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", letterSpacing: "-0.02em" }}
            >
              Moving the Ummah from Friday-Only to a 24/7 Ecosystem
            </h2>
            <p className="text-on-surface-variant leading-relaxed mb-6">
              When a young professional in Edison wants to find others in their field, or a
              revert in a new city feels isolated, Events.io provides the on-ramp. Every
              interest — from software engineering and real estate to poetry and martial arts —
              has a home within the masjid&apos;s umbrella.
            </p>
            <p className="text-on-surface-variant leading-relaxed mb-10">
              We are solving <strong className="text-primary font-semibold">Community Fragmentation</strong>.
              Events buried in WhatsApp groups or static PDFs are invisible. We make every
              gathering discoverable, attendable, and memorable.
            </p>

            {/* Success metrics */}
            <div className="space-y-4">
              {SUCCESS_METRICS.map((metric) => (
                <div
                  key={metric.id}
                  className="flex items-start gap-4 bg-surface-container-low rounded-2xl p-4"
                >
                  <span className="text-2xl flex-shrink-0" role="img" aria-label={metric.value}>
                    {metric.icon}
                  </span>
                  <div>
                    <p className="font-headline font-bold text-primary text-sm mb-0.5">
                      {metric.value}
                    </p>
                    <p className="text-on-surface-variant text-xs leading-relaxed">
                      {metric.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </AnimateIn>

          {/* RIGHT — Shahadah Companion / Revert features */}
          <AnimateIn direction="left" delay={0.15}>
            <div className="bg-primary rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden">
              {/* Geometric motif */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill='none' stroke='%23a6f2d1' stroke-width='0.7' opacity='0.07'%3E%3Cpolygon points='50,5 85,27 85,73 50,95 15,73 15,27'/%3E%3Cpolygon points='50,20 70,31 70,59 50,70 30,59 30,31'/%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: "100px 100px",
                }}
                aria-hidden="true"
              />

              <div className="relative z-10">
                {/* Icon */}
                <div className="w-14 h-14 bg-primary-fixed/20 rounded-2xl flex items-center justify-center mb-6 text-2xl">
                  🌙
                </div>

                <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-primary-fixed/70 mb-3">
                  Shahadah Companion Filter
                </span>
                <h3 className="font-headline font-extrabold text-on-primary text-2xl mb-3 leading-tight">
                  No One Walks In Alone
                </h3>
                <p className="text-primary-fixed/70 text-sm leading-relaxed mb-8">
                  A dedicated filter for reverts and newcomers — because the first step
                  into a new community should feel like a warm welcome, not a leap of faith.
                </p>

                <div className="space-y-4">
                  {REVERT_FEATURES.map((feature) => (
                    <div
                      key={feature.id}
                      className="bg-primary-container/60 rounded-xl p-4"
                    >
                      <p className="font-semibold text-primary-fixed text-sm mb-1">
                        ✓ {feature.label}
                      </p>
                      <p className="text-primary-fixed/60 text-xs leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AnimateIn>
        </div>
      </div>
    </section>
  );
}
