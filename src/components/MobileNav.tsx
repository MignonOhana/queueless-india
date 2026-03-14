"use client";

import { 
  Home, 
  ListOrdered, 
  Search, 
  User, 
  QrCode, 
  Activity, 
  BarChart3, 
  Settings,
  LayoutDashboard,
  LogOut,
  UserCircle,
  ArrowLeftRight
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, userRole, signOut } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  // Scroll detection for mobile to hide/show nav
  useEffect(() => {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.innerWidth >= 768) {
        setIsVisible(true);
        return;
      }
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setIsVisible(false); // Hide on scroll down
      } else {
        setIsVisible(true); // Show on scroll up
      }
      lastScrollY = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hide on display/TV routes
  if (pathname.startsWith('/display') || pathname.startsWith('/tv')) {
    return null;
  }

  const isBusiness = userRole === "business_owner";

  const navItems = isBusiness
    ? [
        { name: "Overview", icon: LayoutDashboard, href: "/dashboard" },
        { name: "Queue", icon: Activity, href: "/dashboard/queue" },
        { name: "QR Code", icon: QrCode, href: "/dashboard/qr" },
        { name: "Analytics", icon: BarChart3, href: "/dashboard?tab=Analytics" },
        { name: "Settings", icon: Settings, href: "/dashboard?tab=Settings" },
      ]
    : [
        { name: "Home", icon: Home, href: "/home" },
        { name: "Explore", icon: Search, href: "/map" },
        { name: "Scanner", icon: QrCode, href: "/customer/scanner" },
        { name: "Tokens", icon: ListOrdered, href: "/customer/dashboard" },
        { name: "Profile", icon: UserCircle, href: user ? "/customer/profile" : "/login" },
      ];

  const handleRoleSwitch = () => {
    // Determine new destination based on current role and pathname
    const destination = isBusiness ? "/home" : "/dashboard";
    toast.info(`Switching to ${isBusiness ? 'Customer' : 'Business'} Mode...`);
    router.push(destination);
  };

  return (
    <>
      {/* --- DESKTOP SIDEBAR (md and up) --- */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 bg-zinc-950 border-r border-white/5 flex-col z-[50]">
        <div className="p-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-black flex items-center justify-center font-bold text-xl shadow-[0_0_20px_rgba(0,245,160,0.3)]">
              Q
            </div>
            <span className="font-black text-xl tracking-tight text-white">
              QueueLess
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${
                  isActive 
                    ? "bg-primary text-black font-black" 
                    : "text-zinc-500 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 3 : 2} />
                <span className="text-sm uppercase tracking-widest font-bold">{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-black/40"
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-zinc-900 space-y-4">
          {/* Role Switcher for Business Owners */}
          {userRole === "business_owner" && (
            <button 
              onClick={handleRoleSwitch}
              className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-all group"
            >
              <ArrowLeftRight size={20} />
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1">Switch Mode</p>
                <p className="font-bold text-sm text-white">To {isBusiness ? 'Customer' : 'Business'}</p>
              </div>
            </button>
          )}

          <button 
            onClick={() => signOut()}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
          >
            <LogOut size={20} />
            <span className="text-sm font-bold uppercase tracking-widest">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MOBILE BOTTOM NAV (sm only) --- */}
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="md:hidden fixed bottom-0 inset-x-0 z-[100] px-4 pb-6 pointer-events-none"
          >
            <div className="max-w-md mx-auto h-[72px] bg-zinc-900/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] flex items-center justify-around px-2 shadow-2xl pointer-events-auto">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link 
                    key={item.name} 
                    href={item.href} 
                    className="flex flex-col items-center justify-center min-w-[48px] h-full gap-1 active:scale-90 transition-transform"
                  >
                    <div className={`transition-colors ${isActive ? "text-primary" : "text-zinc-500"}`}>
                      <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.05em] transition-colors ${isActive ? "text-primary" : "text-zinc-500"}`}>
                      {item.name}
                    </span>
                    {isActive && (
                      <motion.div 
                        layoutId="nav-glow"
                        className="absolute bottom-1 w-1 h-1 rounded-full bg-primary shadow-[0_0_10px_#00F5A0]"
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
