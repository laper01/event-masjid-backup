import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   BADGE COMPONENT
   ───────────────────────────────────────────── */
type BadgeVariant = "primary" | "secondary" | "gold" | "outline" | "new";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  primary: "bg-primary-fixed/30 text-primary",
  secondary: "bg-surface-container text-on-surface-variant",
  gold: "bg-secondary-container text-on-secondary-container",
  outline:
    "bg-transparent border border-outline-variant/30 text-on-surface-variant",
  new: "bg-secondary-container text-on-secondary-container font-bold",
};

export function Badge({
  children,
  variant = "secondary",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium tracking-wide uppercase",
        badgeVariants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
