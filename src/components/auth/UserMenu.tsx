"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import PhoneAuthModal from "@/components/auth/PhoneAuthModal";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Ticket, MapPin, ChevronDown } from "lucide-react";

export default function UserMenu() {
  const { user, isAuthenticated, signOut, loading } = useAuth();
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  if (loading) {
    return <div className="w-9 h-9 rounded-full bg-white/10 animate-pulse" />;
  }

  // Compute initials from name or phone
  const displayName = user?.user_metadata?.full_name || user?.phone || "";
  const initials = displayName
    ? displayName.split(" ").slice(0, 2).map((w: string) => w[0]).join("").toUpperCase()
    : "?";

  if (!isAuthenticated) {
    return (
      <>
        <button
          onClick={() => setIsAuthOpen(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-full transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
        >
          Login
        </button>
        <PhoneAuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(prev => !prev)}
        className="flex items-center gap-2 pl-1 pr-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all active:scale-95"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-black shadow-inner">
          {initials}
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-52 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* User info header */}
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-white font-bold text-sm truncate">{displayName || "User"}</p>
              {user?.phone && <p className="text-slate-400 text-xs font-medium">{user.phone}</p>}
            </div>

            {/* Menu Items */}
            <div className="p-2">
              <button
                onClick={() => { router.push("/my-tokens"); setIsDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <Ticket size={16} className="text-indigo-400" />
                <span className="text-sm font-semibold text-slate-200">My Tokens</span>
              </button>

              <button
                onClick={() => { router.push("/map"); setIsDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors text-left"
              >
                <MapPin size={16} className="text-emerald-400" />
                <span className="text-sm font-semibold text-slate-200">Saved Places</span>
              </button>
            </div>

            <div className="p-2 pt-0 border-t border-white/10">
              <button
                onClick={async () => { await signOut(); setIsDropdownOpen(false); router.push("/"); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-rose-500/10 transition-colors text-left text-rose-400 mt-1"
              >
                <LogOut size={16} />
                <span className="text-sm font-bold">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
