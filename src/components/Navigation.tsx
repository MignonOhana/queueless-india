"use client";

import { Clock, UserCircle, LogOut, LayoutDashboard, QrCode } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const { user, userRole, signOut } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 inset-x-0 z-[60] bg-background/80 backdrop-blur-xl border-b border-white/5 h-20">
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg bg-gradient-to-tr from-primary to-[#00D4FF] group-hover:scale-110 transition-transform">
            <Clock className="w-5 h-5 text-black" strokeWidth={2.5} />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            QueueLess <span className="text-primary">India</span>
          </span>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link 
                href={userRole === "business_owner" ? "/dashboard" : "/customer/dashboard"}
                className="hidden sm:flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-white transition-colors"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
              <Link
                href="/home"
                className="hidden sm:block text-sm font-bold text-primary hover:brightness-110"
              >
                Find a Queue
              </Link>
              <div className="h-4 w-px bg-white/10 hidden sm:block" />
              <button
                onClick={() => signOut()}
                className="text-xs font-black uppercase tracking-widest text-zinc-500 hover:text-rose-500 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-primary text-black px-5 py-2.5 rounded-full font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-primary/20"
              >
                Register Business
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
