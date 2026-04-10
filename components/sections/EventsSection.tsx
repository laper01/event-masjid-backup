"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { AnimateIn, StaggerChildren, StaggerItem } from "@/components/ui/AnimateIn";
import { Button } from "@/components/ui/Button";
import { EVENTS, type EventItem } from "@/lib/data";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   CATEGORY BADGE
   ───────────────────────────────────────────── */
const categoryColors: Record<string, string> = {
  COMMUNITY: "bg-primary-fixed/20 text-primary",
  EDUCATION: "bg-secondary-container/40 text-on-secondary-container",
  YOUTH: "bg-tertiary-fixed/20 text-primary-container",
  FUNDRAISER: "bg-surface-container-high text-on-surface-variant",
};

/* ─────────────────────────────────────────────
   EVENT CARD
   ───────────────────────────────────────────── */
function EventCard({ event }: { event: EventItem }) {
  const formattedPrice =
    event.price === "FREE"
      ? "FREE"
      : `$${event.price.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="bg-surface-container-lowest rounded-[1.5rem] overflow-hidden shadow-ambient ghost-border flex-shrink-0 w-60 md:w-auto"
      aria-label={`${event.title} event — ${event.date} at ${event.time}`}
    >
      {/* Image */}
      <div className="relative h-44 overflow-hidden">
        <Image
          src={event.imageSrc}
          alt={event.imageAlt}
          fill
          className="object-cover transition-transform duration-500 hover:scale-105"
          sizes="(max-width: 768px) 240px, (max-width: 1200px) 25vw, 300px"
        />
        {/* Price badge */}
        <div className="absolute top-3 left-3">
          <span
            className={cn(
              "text-xs font-bold px-3 py-1 rounded-full",
              event.price === "FREE"
                ? "bg-secondary-container text-on-secondary-container"
                : "bg-primary/90 text-on-primary backdrop-blur-sm"
            )}
          >
            {formattedPrice}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Category label */}
        <span
          className={cn(
            "text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded mb-2 inline-block",
            categoryColors[event.category] ?? "bg-surface-container text-on-surface-variant"
          )}
        >
          {event.category}
        </span>

        {/* Title */}
        <h3 className="font-headline font-bold text-on-surface text-base leading-snug mb-2">
          {event.title}
        </h3>

        {/* Date + Third Space tag */}
        <div className="flex items-center gap-1.5 text-on-surface-variant text-xs mb-2">
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true">
            <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
          </svg>
          <time dateTime={`${event.date} ${event.time}`}>{event.date}, {event.time}</time>
        </div>

        {/* Social proof — friends going */}
        {event.friendsGoing && event.friendsGoing > 0 && (
          <div className="flex items-center gap-1.5 mb-3">
            <div className="flex -space-x-1.5" aria-hidden="true">
              {Array.from({ length: Math.min(event.friendsGoing, 3) }).map((_, i) => (
                <div
                  key={i}
                  className="w-5 h-5 rounded-full border border-white bg-primary-fixed flex items-center justify-center text-[8px] font-bold text-primary"
                  style={{ zIndex: 3 - i }}
                />
              ))}
            </div>
            <span className="text-[11px] text-primary font-semibold">
              {event.friendsGoing} friend{event.friendsGoing > 1 ? "s" : ""} going
            </span>
          </div>
        )}

        {/* Tag pill */}
        {event.tag && (
          <span className="inline-block text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant mb-3">
            {event.tag}
          </span>
        )}

        {/* Action button */}
        <Button
          variant="ghost"
          size="sm"
          fullWidth
          aria-label={`${event.action} for ${event.title}`}
          className="text-xs py-2"
        >
          {event.action}
        </Button>
      </div>
    </motion.article>
  );
}

/* ─────────────────────────────────────────────
   EVENTS SECTION
   ───────────────────────────────────────────── */
export function EventsSection() {
  return (
    <section
      id="events"
      className="py-24 bg-surface-container-low"
      aria-labelledby="events-heading"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header row */}
        <AnimateIn direction="up">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2
                id="events-heading"
                className="font-headline font-bold text-on-surface"
                style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)" }}
              >
                Discover Events
              </h2>
              <p className="text-on-surface-variant mt-2 text-sm">
                Join local gatherings and secure your spot instantly.
              </p>
            </div>
            <a
              href="#"
              className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-container transition-colors group"
              aria-label="Browse all events"
            >
              Browse All Events
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                aria-hidden="true"
              >
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </a>
          </div>
        </AnimateIn>

        {/* Mobile: horizontal scroll | Desktop: grid */}
        <div
          className="md:hidden flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x snap-mandatory scroll-smooth"
          role="list"
          aria-label="Events list"
        >
          {EVENTS.map((event) => (
            <div key={event.id} className="snap-start" role="listitem">
              <EventCard event={event} />
            </div>
          ))}
        </div>

        {/* Desktop grid */}
        <StaggerChildren
          className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-5"
          staggerDelay={0.1}
        >
          {EVENTS.map((event) => (
            <StaggerItem key={event.id}>
              <EventCard event={event} />
            </StaggerItem>
          ))}
        </StaggerChildren>

        {/* Mobile browse all link */}
        <div className="md:hidden mt-6 flex justify-center">
          <a
            href="#"
            className="flex items-center gap-1.5 text-sm font-semibold text-primary"
            aria-label="Browse all events"
          >
            Browse All Events
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-4 h-4"
              aria-hidden="true"
            >
              <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
