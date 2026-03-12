"use client";

import { Home, ListOrdered, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function MobileNav() {
  const pathname = usePathname();
  const [queueUrl, setQueueUrl] = useState("/home");

  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      // Show only when scrolled down more than 100px
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide the navigation on non-customer routes or if not visible
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/display') || !isVisible) {
    return null;
  }

  const navItems = [
    { name: "Home", icon: Home, href: "/home" },
    { name: "My Tokens", icon: ListOrdered, href: "/my-tokens" },
    { name: "Explore", icon: Search, href: "/map" },
    { name: "Profile", icon: User, href: user ? "/customer/profile" : "/login" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 pointer-events-none pb-safe">
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50/0 via-slate-50/80 to-slate-50 dark:from-black/0 dark:via-black/80 dark:to-black rotate-180 pointer-events-none" />
      
      <div className="relative pointer-events-auto bg-white dark:bg-zinc-900 border-t border-slate-200 dark:border-white/5 py-3 px-4 grid grid-cols-4 justify-items-center items-center shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center gap-1">
              <motion.div 
                whileTap={{ scale: 0.9 }}
                className={`transition-colors ${isActive ? "text-[#0B6EFE]" : "text-slate-400 dark:text-zinc-500"}`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              <span className={`text-[10px] font-bold tracking-tight transition-colors ${isActive ? "text-[#0B6EFE]" : "text-slate-400 dark:text-zinc-500"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
