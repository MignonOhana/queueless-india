"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, MapPin, BarChart3, Settings, UserCircle, Search, Bell, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useState } from "react";

export default function AdminNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  // Scroll detection for Pro UI
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Live Queue", href: "#live-queue", icon: Users },
    { name: "Map", href: "/map/heatmap", icon: MapPin },
    { name: "Analytics", href: "#analytics", icon: BarChart3 },
    { name: "Staff", href: "#staff", icon: UserCircle },
    { name: "Settings", href: "#settings", icon: Settings },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] ${
        scrolled 
          ? "h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-white/20 dark:border-white/10 shadow-sm" 
          : "h-20 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50"
      }`}
    >
      <div className="max-w-[1400px] mx-auto px-6 w-full flex items-center justify-between h-full gap-4">
        
        {/* Left: Logo */}
        <Link href="/home" className="flex items-center gap-2 group shrink-0 hidden md:flex">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold shadow-md transition-transform active:scale-95">
            Q
          </div>
          <span className="font-extrabold tracking-tight text-slate-800 dark:text-slate-100 text-lg">
            QueueLess <span className="text-slate-400 font-medium text-sm ml-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">Admin</span>
          </span>
        </Link>
        <Link href="/home" className="md:hidden flex items-center shrink-0">
          <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold">
            Q
          </div>
        </Link>

        {/* Middle: Links */}
        <div className="flex-1 flex justify-center overflow-x-auto hide-scrollbar">
          <div className="flex items-center gap-1.5 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-colors whitespace-nowrap ${
                    isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden lg:inline-block">{item.name}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="admin-active-pill"
                      className="absolute inset-0 bg-white dark:bg-slate-800 rounded-xl -z-10 shadow-sm border border-slate-200/50 dark:border-slate-700/50"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {isActive && (
                    <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-slate-800 dark:bg-white animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Universal Search */}
          <div className="hidden xl:flex items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full px-3 py-1.5 text-sm text-slate-400 w-48 transition-colors focus-within:w-64 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
            <Search size={14} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              className="bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 w-full placeholder:text-slate-400"
            />
          </div>
          
          <button className="hidden xl:flex items-center justify-center w-9 h-9 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors xl:hidden">
            <Search size={18} />
          </button>

          {/* AI Assistant Floating Button Prototype */}
          <button className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all group">
            <Sparkles size={14} className="group-hover:animate-spin" />
            <span>Ask AI</span>
          </button>

          {/* Notification Bell */}
          <button className="relative flex items-center justify-center w-9 h-9 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <Bell size={18} />
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-950"></span>
          </button>

          <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Admin Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 border-2 border-white dark:border-slate-900 shadow-sm ml-1 overflow-hidden">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-full h-full object-cover" />
          </div>
        </div>
      </div>
    </nav>
  );
}
