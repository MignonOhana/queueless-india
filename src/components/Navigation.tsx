"use client";

import { useState } from "react";
import { Clock, LayoutDashboard, Menu, X } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export default function Navigation() {
  const { user, userRole, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when a link is clicked
  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 inset-x-0 z-[60] bg-background/95 border-b border-white/5 h-20 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" onClick={handleLinkClick} className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-tr from-primary to-[#00D4FF] group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            QueueLess <span className="text-primary">India</span>
          </span>
        </Link>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-4">
          {user ? (
            <>
              <Link 
                href={userRole === "business_owner" ? "/dashboard" : "/customer/dashboard"}
                className="flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors p-2"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <Link
                href="/home"
                className="text-sm font-bold text-primary hover:brightness-110 p-2"
              >
                Find a Queue
              </Link>
              <div className="h-4 w-px bg-white/10" />
              <button
                onClick={() => signOut()}
                className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-rose-500 transition-colors p-2"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors p-2">
                Login
              </Link>
              <Link href="/about" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors p-2">
                About
              </Link>
              <Link href="/pricing" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors p-2">
                Pricing
              </Link>
              <Link 
                href="/login?role=business_owner" 
                className="bg-primary text-black px-5 py-2.5 rounded-full font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20"
              >
                Register Business
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Icon */}
        <div className="sm:hidden flex items-center">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-zinc-400 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden absolute top-20 left-0 w-full bg-background/95 border-b border-white/5 backdrop-blur-md overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col px-6 py-6 gap-6">
              {user ? (
                <>
                  <Link 
                    href={userRole === "business_owner" ? "/dashboard" : "/customer/dashboard"}
                    onClick={handleLinkClick}
                    className="flex items-center gap-2 text-base font-bold text-zinc-300 hover:text-white transition-colors"
                  >
                    <LayoutDashboard size={20} />
                    Dashboard
                  </Link>
                  <Link
                    href="/home"
                    onClick={handleLinkClick}
                    className="text-base font-bold text-primary hover:brightness-110"
                  >
                    Find a Queue
                  </Link>
                  <div className="h-px w-full bg-white/10" />
                  <button
                    onClick={() => {
                      signOut();
                      handleLinkClick();
                    }}
                    className="text-left text-sm font-black uppercase tracking-widest text-zinc-500 hover:text-rose-500 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={handleLinkClick} className="text-base font-bold text-zinc-300 hover:text-white transition-colors">
                    Login
                  </Link>
                  <Link href="/about" onClick={handleLinkClick} className="text-base font-bold text-zinc-300 hover:text-white transition-colors">
                    About
                  </Link>
                  <Link href="/pricing" onClick={handleLinkClick} className="text-base font-bold text-zinc-300 hover:text-white transition-colors">
                    Pricing
                  </Link>
                  <div className="pt-2">
                    <Link 
                      href="/login?role=business_owner" 
                      onClick={handleLinkClick}
                      className="block w-full text-center bg-primary text-black px-5 py-3 rounded-xl font-bold text-base shadow-lg shadow-primary/20"
                    >
                      Register Business
                    </Link>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
