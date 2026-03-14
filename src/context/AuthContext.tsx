"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabaseClient";
import { Role } from "@/lib/db-schema";

interface AuthContextType {
  user: User | null;
  userRole: Role | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  isAuthenticated: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial role from localStorage for immediate UI responsiveness
    const savedRole = typeof window !== "undefined" ? localStorage.getItem("ql_user_role") : null;
    if (savedRole) {
      setUserRole(savedRole as Role);
    }

    // Check active session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        
        // Fetch role via RPC (Security Definer) - works reliably across session timing
        const { data: profile } = await supabase.rpc('get_my_profile').maybeSingle() as { data: any; error: any };
        
        const finalRole = (profile?.role as Role) || (session.user.user_metadata?.role as Role) || "CUSTOMER";
        setUserRole(finalRole);
        localStorage.setItem("ql_user_role", finalRole);
      }
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        
        // Always sync role from DB on auth change via RPC
        const { data: profile } = await supabase.rpc('get_my_profile').maybeSingle() as { data: any; error: any };
          
        const finalRole = (profile?.role as Role) || (session.user.user_metadata?.role as Role) || "CUSTOMER";
        setUserRole(finalRole);
        localStorage.setItem("ql_user_role", finalRole);
      } else {
        setUser(null);
        setUserRole(null);
        localStorage.removeItem("ql_user_role");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
    localStorage.removeItem("ql_user_role");
  };

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      loading,
      isAuthenticated: !!user,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
