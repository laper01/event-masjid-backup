"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";

/** Pages where the FAB should be visible */
const FAB_VISIBLE_PATHS = [
  "/feed",
  "/discover",
  "/hangouts",
  "/clubs",
];

/** Pages where the FAB should be hidden */
const FAB_HIDDEN_PATHS = [
  "/tickets",
  "/profile",
  "/preferences",
  "/volunteer",
  "/revert",
];

interface FABAction {
  icon: string;
  label: string;
  href?: string;
  onClick?: () => void;
  color?: string;
}

export function FAB() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [expanded, setExpanded] = useState(false);

  // Determine visibility
  const isHidden =
    FAB_HIDDEN_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.includes("/qr") ||
    pathname.includes("/[");

  const isVisible =
    !isHidden &&
    FAB_VISIBLE_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));

  // Context-aware actions
  const actions: FABAction[] = [
    {
      icon: "groups",
      label: "Host a Hangout",
      href: "/hangouts/create",
      color: "bg-secondary text-on-secondary",
    },
  ];

  // Show "Create Event" only if user is an organizer
  // (session.user would have a role field in a real app)
  actions.unshift({
    icon: "event",
    label: "Create Event",
    href: "/admin/events/create",
    color: "bg-primary text-on-primary",
  });

  const handleFABClick = () => {
    if (actions.length === 1) {
      router.push(actions[0].href!);
    } else {
      setExpanded(!expanded);
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="lg:hidden fixed bottom-[88px] right-5 z-40 flex flex-col-reverse items-end gap-3">

          {/* Action items — expand upward */}
          <AnimatePresence>
            {expanded &&
              actions.map((action, i) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, y: 16, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 16, scale: 0.8 }}
                  transition={{ duration: 0.2, delay: i * 0.05 }}
                  onClick={() => {
                    setExpanded(false);
                    if (action.href) router.push(action.href);
                    else action.onClick?.();
                  }}
                  className="flex items-center gap-3 pr-4 pl-2 py-2.5 rounded-full shadow-lg bg-surface-container-lowest border border-outline/10"
                >
                  <span
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${action.color ?? "bg-primary text-on-primary"}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {action.icon}
                    </span>
                  </span>
                  <span className="font-bold text-on-surface text-label-lg whitespace-nowrap">
                    {action.label}
                  </span>
                </motion.button>
              ))}
          </AnimatePresence>

          {/* Backdrop overlay when expanded */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[-1]"
                onClick={() => setExpanded(false)}
              />
            )}
          </AnimatePresence>

          {/* Main FAB button */}
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            whileTap={{ scale: 0.92 }}
            onClick={handleFABClick}
            className="w-14 h-14 rounded-full bg-primary text-on-primary shadow-xl flex items-center justify-center relative"
            aria-label="Create"
          >
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-primary opacity-20 fab-ring" />

            {/* Icon — rotates when expanded */}
            <motion.span
              className="material-symbols-outlined text-[28px]"
              animate={{ rotate: expanded ? 45 : 0 }}
              transition={{ duration: 0.2 }}
            >
              add
            </motion.span>
          </motion.button>
        </div>
      )}
    </AnimatePresence>
  );
}

export default FAB;
