import { type ButtonHTMLAttributes, forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

/* ─────────────────────────────────────────────
   BUTTON VARIANTS
   ───────────────────────────────────────────── */
type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-on-primary hover:bg-primary-container shadow-ambient-sm hover:shadow-ambient-md",
  secondary:
    "bg-secondary-container text-on-secondary-container hover:bg-secondary-fixed",
  ghost:
    "bg-transparent text-primary hover:bg-surface-container-low border border-outline-variant/20",
  outline:
    "bg-transparent text-on-primary border border-on-primary/30 hover:bg-on-primary/10",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-8 py-4 text-base",
};

/* ─────────────────────────────────────────────
   BUTTON COMPONENT
   ───────────────────────────────────────────── */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      fullWidth = false,
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold",
          "transition-all duration-200 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-95",
          // Variant
          variantStyles[variant],
          // Size
          sizeStyles[size],
          // Full width
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

/* ─────────────────────────────────────────────
   MOTION BUTTON (animated wrapper)
   ───────────────────────────────────────────── */
type MotionButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
};

export function MotionButton({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  children,
  ...props
}: MotionButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold",
        "transition-colors duration-200 cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  );
}
