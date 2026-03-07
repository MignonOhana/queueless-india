import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Variants } from "framer-motion";

/** Utility to merge tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 
 * Reusable Framer Motion Variants for Enterprise UI 
 */

export const FADE_UP_ANIMATION_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } },
};

export const STAGGER_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export const HOVER_SCALE_VARIANTS: Variants = {
  initial: { scale: 1 },
  hover: { scale: 1.02, transition: { type: "spring", stiffness: 400, damping: 10 } },
  tap: { scale: 0.98, transition: { type: "spring", stiffness: 400, damping: 10 } },
};

export const POP_IN_VARIANTS: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
};
