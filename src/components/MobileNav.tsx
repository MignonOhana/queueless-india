"use client";

import { Home, ListOrdered, QrCode, Search, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function MobileNav() {
  const pathname = usePathname();
  const [queueUrl, setQueueUrl] = useState("/home");

  useEffect(() => {
    // Check for active token to dynamically link the Queue tab
    const savedOrg = localStorage.getItem("active_org");
    const savedToken = localStorage.getItem("active_token");
    if (savedOrg && savedToken) {
      setQueueUrl(`/customer/queue/${savedOrg}/${savedToken}`);
    }
  }, [pathname]); // Re-evaluate on route change

  // Hide the navigation on non-customer routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/display') || pathname === '/') {
    return null;
  }

  const navItems = [
    { name: "Home", icon: Home, href: "/home" },
    { name: "My Queues", icon: ListOrdered, href: queueUrl },
    { name: "SCAN", icon: QrCode, href: "/customer/scanner", isCenter: true },
    { name: "Search", icon: Search, href: "/map" },
    { name: "Profile", icon: User, href: "/customer/profile" }, 
  ];

  return (
    <div className="md:hidden fixed bottom-0 inset-x-0 z-50 pointer-events-none pb-safe">
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-50/0 via-slate-50/80 to-slate-50 dark:from-black/0 dark:via-black/80 dark:to-black rotate-180 pointer-events-none" />
      
      <div className="relative pointer-events-auto bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 py-2 px-2 grid grid-cols-5 justify-items-center items-end pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.name === "Queue" && pathname.includes("/customer/queue"));
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <div key={item.name} className="relative -top-5 flex flex-col items-center justify-center">
                <Link href={item.href}>
                  <motion.div 
                    whileTap={{ scale: 0.9 }}
                    className="w-16 h-16 rounded-full bg-[#F59E0B] shadow-[0_8px_30px_rgba(245,158,11,0.4)] flex items-center justify-center text-white border-4 border-white dark:border-black"
                  >
                    <Icon size={28} />
                  </motion.div>
                </Link>
                <span className="text-[10px] font-bold text-slate-800 dark:text-slate-200 mt-1">{item.name}</span>
              </div>
            );
          }

          return (
            <Link key={item.name} href={item.href} className="flex flex-col items-center justify-center min-w-[48px] min-h-[48px]">
              <motion.div 
                whileTap={{ scale: 0.9 }}
                className={`p-1.5 rounded-xl transition-colors ${isActive ? "bg-[#0B6EFE]/10 text-[#0B6EFE]" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"}`}
              >
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </motion.div>
              <span className={`text-[10px] font-semibold mt-1 transition-colors ${isActive ? "text-[#0B6EFE]" : "text-slate-500"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
