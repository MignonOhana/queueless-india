"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function PageTransition({ children, className = "" }: { children: ReactNode, className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(4px)" }}
      transition={{ 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] // Apple-style custom spring damping
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
