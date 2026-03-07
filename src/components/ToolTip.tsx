"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
}

export default function Tooltip({ children, content, position = "top", delay = 0.3 }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  let positionClasses = "";
  let initialOffset = { x: 0, y: 0 };

  switch (position) {
    case "top":
      positionClasses = "bottom-full left-1/2 -translate-x-1/2 mb-2";
      initialOffset = { x: 0, y: 10 };
      break;
    case "bottom":
      positionClasses = "top-full left-1/2 -translate-x-1/2 mt-2";
      initialOffset = { x: 0, y: -10 };
      break;
    case "left":
      positionClasses = "right-full top-1/2 -translate-y-1/2 mr-2";
      initialOffset = { x: 10, y: 0 };
      break;
    case "right":
      positionClasses = "left-full top-1/2 -translate-y-1/2 ml-2";
      initialOffset = { x: -10, y: 0 };
      break;
  }

  return (
    <div 
      className="relative flex items-center justify-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, ...initialOffset }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, ...initialOffset }}
            transition={{ duration: 0.2, delay }}
            className={`absolute z-50 px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-100 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.4)] whitespace-nowrap pointer-events-none ${positionClasses}`}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
