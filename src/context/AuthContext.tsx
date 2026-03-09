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
  // Legacy compat methods
  loginAsCustomer: () => Promise<void>;
  loginAsAdmin: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  loading: true,
  isAuthenticated: false,
  signOut: async () => {},
  loginAsCustomer: async () => {},
  loginAsAdmin: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setUserRole((session.user.user_metadata?.role as Role) || "CUSTOMER");
      }
      setLoading(false);
    });

    // Listen for auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setUserRole((session.user.user_metadata?.role as Role) || "CUSTOMER");
      } else {
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserRole(null);
  };

  // Legacy login methods kept for backward compatibility
  const loginAsCustomer = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.warn("Falling back to mock customer login:", error.message);
      setUser({ id: "mock-customer-123", email: "guest@queueless.in", app_metadata: {}, user_metadata: { role: "CUSTOMER" }, aud: "authenticated", created_at: new Date().toISOString() } as User);
    } else {
      setUser(data.user);
    }
    setUserRole("CUSTOMER");
    setLoading(false);
  };

  const loginAsAdmin = async () => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      setUser({ id: "mock-admin-456", email: "admin@queueless.in", app_metadata: {}, user_metadata: { role: "ADMIN" }, aud: "authenticated", created_at: new Date().toISOString() } as User);
    } else {
      await supabase.auth.updateUser({ data: { role: "ADMIN" } });
    }
    setUserRole("ADMIN");
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userRole,
      loading,
      isAuthenticated: !!user,
      signOut,
      loginAsCustomer,
      loginAsAdmin,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
