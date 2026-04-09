"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";

/* ─────────────────────────────────────────────
   ANIMATE-IN COMPONENT
   Triggers Framer Motion animations when element enters viewport.
   ───────────────────────────────────────────── */
interface AnimateInProps {
  children: ReactNode;
  /** Delay in seconds */
  delay?: number;
  /** Direction of the enter animation */
  direction?: "up" | "down" | "left" | "right" | "none";
  /** Once: only animate on first view */
  once?: boolean;
  className?: string;
}

const directionVariants = {
  up: { y: 32, opacity: 0 },
  down: { y: -32, opacity: 0 },
  left: { x: 32, opacity: 0 },
  right: { x: -32, opacity: 0 },
  none: { opacity: 0 },
};

export function AnimateIn({
  children,
  delay = 0,
  direction = "up",
  once = true,
  className,
}: AnimateInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      initial={directionVariants[direction]}
      animate={
        isInView
          ? { y: 0, x: 0, opacity: 1 }
          : directionVariants[direction]
      }
      transition={{
        duration: 0.65,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   STAGGER CHILDREN – animates children in sequence
   ───────────────────────────────────────────── */
interface StaggerChildrenProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerChildren({
  children,
  staggerDelay = 0.1,
  className,
}: StaggerChildrenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px 0px" });

  return (
    <motion.div
      ref={ref}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   STAGGER ITEM – used inside StaggerChildren
   ───────────────────────────────────────────── */
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { y: 24, opacity: 0 },
        visible: {
          y: 0,
          opacity: 1,
          transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
