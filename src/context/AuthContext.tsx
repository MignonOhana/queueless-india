"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { Profile } from "@/types/database";

type Role = Profile['role'] | "CUSTOMER" | "BUSINESS_OWNER"; // Fallback for legacy casing

const supabase = createClient();

interface AuthContextType {
  user: User | null;
  userRole: Role | null;
  profile: Profile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  profile: null,
  loading: true,
  isAuthenticated: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount — do NOT read role from localStorage
    // (stale data there was showing business nav to customers)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await supabase.rpc('get_my_profile').maybeSingle() as { data: any; error: any };

        // Default to "customer" — never accidentally give business_owner access
        const finalRole = (profile?.role as Role) || (session.user.user_metadata?.role as Role) || "customer";
        setUserRole(finalRole);
        localStorage.setItem("ql_user_role", finalRole);
      } else {
        setUserRole(null);
        localStorage.removeItem("ql_user_role");
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile } = await supabase.rpc('get_my_profile').maybeSingle() as { data: any; error: any };
        setProfile(profile);
          
        const rawRole = (profile?.role || session.user.user_metadata?.role || "customer").toLowerCase();
        const finalRole = rawRole === "business_owner" || rawRole === "staff" ? rawRole : "customer";
        
        setUserRole(finalRole as Role);
        localStorage.setItem("ql_user_role", finalRole);
      } else {
        setUser(null);
        setUserRole(null);
        setProfile(null);
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
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      profile,
      loading,
      isAuthenticated: !!user,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
