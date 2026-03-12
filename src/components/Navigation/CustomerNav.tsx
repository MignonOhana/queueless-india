"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, MapPin, QrCode, Ticket, Bell, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function CustomerNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  // Scroll detection for Pro UI
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Map", href: "/map", icon: MapPin },
    { name: "Queue", href: "/customer", icon: Ticket },
    { name: "SCAN", href: "/customer/scanner", icon: QrCode, isPrimary: true },
    { name: "Alerts", href: "/customer/alerts", icon: Bell },
    { name: "Profile", href: "/customer/profile", icon: User },
  ];

  return (
    <>
      {/* --- RESPONSIVE TOP NAV --- */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex ${
          scrolled 
            ? "h-16 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-white/20 dark:border-white/10 shadow-sm" 
            : "h-20 md:h-24 bg-transparent border-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 w-full flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2 group">
            <div className={`rounded-xl bg-gradient-to-tr from-orange-500 to-rose-500 text-white flex items-center justify-center font-bold shadow-lg shadow-orange-500/30 group-hover:rotate-12 transition-all duration-300 ${scrolled ? 'w-8 h-8 text-base shrink-0' : 'w-10 h-10 text-xl shrink-0'}`}>
              Q
            </div>
            <span className={`font-extrabold tracking-tight text-slate-900 dark:text-slate-100 transition-all duration-300 ${scrolled ? 'text-lg' : 'text-xl'}`}>
              QueueLess<span className="text-blue-700 dark:text-blue-400"> India</span>
            </span>
          </Link>

          {/* Links (Desktop) */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-md p-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.name === "Map" && pathname === "/map/heatmap");
              const Icon = item.icon;
              
              if (item.isPrimary) {
                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-full font-bold shadow-md shadow-orange-500/20 active:scale-95 transition-all mx-1"
                  >
                    <Icon size={18} />
                    <span>SCAN</span>
                  </Link>
                );
              }

              return (
                <Link 
                  key={item.name} 
                  href={item.href}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-colors ${
                    isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.name}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="desktop-active-pill"
                      className="absolute inset-0 bg-white dark:bg-slate-700/80 rounded-full -z-10 shadow-sm border border-slate-200/50 dark:border-slate-600/50"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  {isActive && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500 animate-pulse"></div>
                  )}
                </Link>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center justify-end md:w-[150px] gap-4">
            <ThemeToggle />
            <button 
              className="md:hidden overflow-hidden w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      {/* --- MOBILE FULLSCREEN MENU --- */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden fixed top-20 left-4 right-4 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6"
          >
            <div className="flex flex-col gap-4">
              <Link onClick={() => setMobileMenuOpen(false)} href="/" className="font-bold text-lg text-slate-900 dark:text-white py-2 border-b border-slate-100 dark:border-slate-800">Home</Link>
              <Link onClick={() => setMobileMenuOpen(false)} href="/about" className="font-bold text-lg text-slate-900 dark:text-white py-2 border-b border-slate-100 dark:border-slate-800">About Us</Link>
              <Link onClick={() => setMobileMenuOpen(false)} href="/pricing" className="font-bold text-lg text-slate-900 dark:text-white py-2 border-b border-slate-100 dark:border-slate-800">Pricing</Link>
              {!user ? (
                <>
                  <Link onClick={() => setMobileMenuOpen(false)} href="/login" className="font-bold text-lg text-[#0B6EFE] py-2 border-b border-slate-100 dark:border-slate-800">Login</Link>
                  <Link onClick={() => setMobileMenuOpen(false)} href="/register" className="font-bold text-lg text-orange-500 py-2">Register Business</Link>
                </>
              ) : (
                <Link onClick={() => setMobileMenuOpen(false)} href="/customer/profile" className="font-bold text-lg text-slate-900 dark:text-white py-2">My Profile</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* The `MobileNav` component handles bottom mobile navigation globally, so we removed the duplicate legacy code. */}
    </>
  );
}
